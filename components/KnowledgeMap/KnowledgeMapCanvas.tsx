import React, { useCallback, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  KnowledgeMapGraph,
  KnowledgeMapNode as NodeType,
  GraphLayoutResult,
} from '../../types/knowledgeMap';
import { GRAPH_CONFIG } from '../../utils/knowledgeMap/graphConstants';
import { KnowledgeMapEdge } from './KnowledgeMapEdge';
import { KnowledgeMapNode } from './KnowledgeMapNode';

export interface KnowledgeMapCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnNode: (nodeId: string) => void;
  resetView: () => void;
}

interface KnowledgeMapCanvasProps {
  graph: KnowledgeMapGraph;
  layout: GraphLayoutResult;
  selectedNodeId?: string;
  themeColor?: string;
  onSelectNode: (node: NodeType) => void;
  viewportWidth?: number;
  viewportHeight?: number;
}

const EASE_OUT = Easing.out(Easing.quad);

export const KnowledgeMapCanvas = forwardRef<KnowledgeMapCanvasRef, KnowledgeMapCanvasProps>(
  function KnowledgeMapCanvas(
    {
      graph,
      layout,
      selectedNodeId,
      themeColor,
      onSelectNode,
      viewportWidth = Dimensions.get('window').width,
      viewportHeight = Dimensions.get('window').height - 180,
    },
    ref
  ) {
    // Dynamic positions for interactive node dragging
    const [dynamicPositions, setDynamicPositions] = useState<
      Map<string, { x: number; y: number; width: number; height: number }>
    >(() => new Map(layout.positions));

    useEffect(() => {
      setDynamicPositions(new Map(layout.positions));
    }, [layout.positions]);

    // Reanimated Shared Values
    const scale = useSharedValue<number>(GRAPH_CONFIG.defaultZoom);
    const savedScale = useSharedValue<number>(GRAPH_CONFIG.defaultZoom);
    const translateX = useSharedValue<number>(0);
    const savedTranslateX = useSharedValue<number>(0);
    const translateY = useSharedValue<number>(0);
    const savedTranslateY = useSharedValue<number>(0);

    // Initial transform calculation
    const calculateInitialTransform = useCallback(() => {
      const { bounds } = layout;
      const initialScale = GRAPH_CONFIG.defaultZoom;
      const initX = viewportWidth / 2 - bounds.centerX * initialScale;
      const initY = 30;

      return { x: initX, y: initY, scale: initialScale };
    }, [layout, viewportWidth]);

    useEffect(() => {
      const initial = calculateInitialTransform();
      translateX.value = initial.x;
      translateY.value = initial.y;
      scale.value = initial.scale;
    }, [calculateInitialTransform, scale, translateX, translateY]);

    // Imperative Toolbar Controls & Focus Node Center
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const next = Math.min(scale.value * 1.25, GRAPH_CONFIG.maxZoom);
        const screenCenterX = viewportWidth / 2;
        const screenCenterY = viewportHeight / 2;
        const contentX = (screenCenterX - translateX.value) / scale.value;
        const contentY = (screenCenterY - translateY.value) / scale.value;

        translateX.value = withTiming(screenCenterX - contentX * next, { duration: 220, easing: EASE_OUT });
        translateY.value = withTiming(screenCenterY - contentY * next, { duration: 220, easing: EASE_OUT });
        scale.value = withTiming(next, { duration: 220, easing: EASE_OUT });
      },
      zoomOut: () => {
        const next = Math.max(scale.value * 0.8, GRAPH_CONFIG.minZoom);
        const screenCenterX = viewportWidth / 2;
        const screenCenterY = viewportHeight / 2;
        const contentX = (screenCenterX - translateX.value) / scale.value;
        const contentY = (screenCenterY - translateY.value) / scale.value;

        translateX.value = withTiming(screenCenterX - contentX * next, { duration: 220, easing: EASE_OUT });
        translateY.value = withTiming(screenCenterY - contentY * next, { duration: 220, easing: EASE_OUT });
        scale.value = withTiming(next, { duration: 220, easing: EASE_OUT });
      },
      centerOnNode: (nodeId: string) => {
        const pos = dynamicPositions.get(nodeId) || layout.positions.get(nodeId);
        if (pos) {
          const currentScale = scale.value;
          const targetX = viewportWidth / 2 - pos.x * currentScale;
          const targetY = Math.max(20, viewportHeight * 0.36 - pos.y * currentScale);

          translateX.value = withTiming(targetX, {
            duration: 250,
            easing: EASE_OUT,
          });
          translateY.value = withTiming(targetY, {
            duration: 250,
            easing: EASE_OUT,
          });
        }
      },
      resetView: () => {
        const initial = calculateInitialTransform();
        translateX.value = withTiming(initial.x, { duration: 250, easing: EASE_OUT });
        translateY.value = withTiming(initial.y, { duration: 250, easing: EASE_OUT });
        scale.value = withTiming(initial.scale, { duration: 250, easing: EASE_OUT });
        setDynamicPositions(new Map(layout.positions));
      },
    }));

    // Background Canvas Pan Gesture (moves whole canvas)
    const panGesture = Gesture.Pan()
      .onStart(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate((e) => {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      });

    // Precision Pinch Gesture with exact Focal Point Tracking
    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        savedScale.value = scale.value;
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate((e) => {
        const nextScale = Math.min(
          Math.max(savedScale.value * e.scale, GRAPH_CONFIG.minZoom),
          GRAPH_CONFIG.maxZoom
        );

        const focalContentX = (e.focalX - savedTranslateX.value) / savedScale.value;
        const focalContentY = (e.focalY - savedTranslateY.value) / savedScale.value;

        scale.value = nextScale;
        translateX.value = e.focalX - focalContentX * nextScale;
        translateY.value = e.focalY - focalContentY * nextScale;
      });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedCanvasStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      transformOrigin: '0% 0%',
    }));

    // Handle Individual Node Drag
    const handleDragUpdate = useCallback((nodeId: string, x: number, y: number) => {
      setDynamicPositions((prev) => {
        const existing = prev.get(nodeId);
        if (!existing) return prev;
        const next = new Map(prev);
        next.set(nodeId, { ...existing, x, y });
        return next;
      });
    }, []);

    // Connected Nodes & Edges logic
    const { connectedNodeIds, connectedEdgeIds } = React.useMemo(() => {
      const nodeIds = new Set<string>();
      const edgeIds = new Set<string>();

      if (selectedNodeId) {
        nodeIds.add(selectedNodeId);
        layout.visibleEdges.forEach((edge) => {
          if (edge.source === selectedNodeId) {
            nodeIds.add(edge.target);
            edgeIds.add(edge.id);
          } else if (edge.target === selectedNodeId) {
            nodeIds.add(edge.source);
            edgeIds.add(edge.id);
          }
        });
      }

      return { connectedNodeIds: nodeIds, connectedEdgeIds: edgeIds };
    }, [selectedNodeId, layout.visibleEdges]);

    const { bounds } = layout;
    const svgWidth = Math.max(bounds.maxX + 120, viewportWidth * 1.6);
    const svgHeight = Math.max(bounds.maxY + 200, viewportHeight * 1.6);

    return (
      <View style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.canvasWrapper, animatedCanvasStyle]}>
            {/* Layer 1: Dynamic SVG Flexible Rope Connections */}
            <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
              {layout.visibleEdges.map((edge) => {
                const sourcePos = dynamicPositions.get(edge.source);
                const targetPos = dynamicPositions.get(edge.target);

                if (!sourcePos || !targetPos) return null;

                const isSelected = connectedEdgeIds.has(edge.id);
                const isDimmed =
                  Boolean(selectedNodeId) && !connectedEdgeIds.has(edge.id);

                return (
                  <KnowledgeMapEdge
                    key={edge.id}
                    edge={edge}
                    sourcePos={sourcePos}
                    targetPos={targetPos}
                    isSelected={isSelected}
                    isDimmed={isDimmed}
                    themeColor={themeColor}
                  />
                );
              })}
            </Svg>

            {/* Layer 2: Interactive Draggable Nodes */}
            {layout.visibleNodes.map((node) => {
              const pos = dynamicPositions.get(node.id);
              if (!pos) return null;

              const isSelected = node.id === selectedNodeId;
              const isConnected = connectedNodeIds.has(node.id);
              const isDimmed = Boolean(selectedNodeId) && !connectedNodeIds.has(node.id);

              return (
                <KnowledgeMapNode
                  key={node.id}
                  node={node}
                  pos={pos}
                  isSelected={isSelected}
                  isConnected={isConnected}
                  isDimmed={isDimmed}
                  themeColor={themeColor}
                  scaleSharedValue={scale}
                  onPress={onSelectNode}
                  onDragUpdate={handleDragUpdate}
                />
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

KnowledgeMapCanvas.displayName = 'KnowledgeMapCanvas';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090b',
    overflow: 'hidden',
  },
  canvasWrapper: {
    width: '100%',
    height: '100%',
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
