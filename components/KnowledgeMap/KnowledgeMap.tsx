import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { TopicItem, SpecialtyData } from '../../constants/SpecialtyData';
import {
  KnowledgeMapGraph,
  KnowledgeMapNode as NodeType,
} from '../../types/knowledgeMap';
import { knowledgeMapService } from '../../services/knowledgeMapService';
import { layoutTopicGraph } from '../../utils/knowledgeMap/layoutTopicGraph';
import { buildNodeQuestion } from '../../utils/knowledgeMap/buildNodeQuestion';
import { Colors } from '../../constants/Colors';
import { KnowledgeMapCanvas, KnowledgeMapCanvasRef } from './KnowledgeMapCanvas';
import { KnowledgeMapToolbar } from './KnowledgeMapToolbar';
import { KnowledgeMapNodeSheet } from './KnowledgeMapNodeSheet';
import { KnowledgeMapLegend } from './KnowledgeMapLegend';
import { KnowledgeMapEmptyState } from './KnowledgeMapEmptyState';

export interface KnowledgeMapProps {
  topic: TopicItem;
  specialty?: SpecialtyData;
  initialGraph?: KnowledgeMapGraph;
  themeColor?: string;
  onAskAi?: (question: string) => void;
  onOpenGuide?: (sectionIndex?: number) => void;
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({
  topic,
  specialty,
  initialGraph,
  themeColor = Colors.accent,
  onAskAi,
  onOpenGuide,
}) => {
  const canvasRef = useRef<KnowledgeMapCanvasRef>(null);

  // Graph state
  const [graph, setGraph] = useState<KnowledgeMapGraph | null>(() => {
    if (initialGraph) return initialGraph;
    if (topic) {
      return knowledgeMapService.buildKnowledgeMap({
        specialty,
        topic,
      });
    }
    return null;
  });

  // UI state
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const windowDimensions = Dimensions.get('window');
  const viewportWidth = windowDimensions.width;
  const viewportHeight = windowDimensions.height - 180;

  // Build local graph when topic changes
  useEffect(() => {
    if (!initialGraph && topic) {
      const localGraph = knowledgeMapService.buildKnowledgeMap({
        specialty,
        topic,
      });
      setGraph(localGraph);
      setCollapsedNodeIds(new Set());
      setSelectedNode(null);
    }
  }, [topic, specialty, initialGraph]);

  // Compute layout deterministically
  const layout = useMemo(() => {
    if (!graph) return null;
    return layoutTopicGraph(graph, {
      collapsedNodeIds,
      viewportWidth,
      viewportHeight,
    });
  }, [graph, collapsedNodeIds, viewportWidth, viewportHeight]);

  // Node Selection Handlers
  const handleSelectNode = useCallback(
    (node: NodeType) => {
      setSelectedNode(node);
      canvasRef.current?.centerOnNode(node.id);
    },
    []
  );

  const handleCloseSheet = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleAskAi = useCallback(
    (node: NodeType) => {
      const question = buildNodeQuestion(node, {
        topicName: topic.title,
        specialtyName: (specialty as any)?.scientificName || (specialty as any)?.name,
      });
      onAskAi?.(question);
    },
    [topic.title, specialty, onAskAi]
  );

  const handleOpenGuide = useCallback(
    (sourceId?: string) => {
      if (selectedNode?.type === 'root' || !sourceId) {
        // Root node -> Open full guide
        onOpenGuide?.(undefined);
        return;
      }
      const idx = parseInt(sourceId, 10);
      if (!isNaN(idx)) {
        onOpenGuide?.(idx);
      } else {
        onOpenGuide?.(undefined);
      }
    },
    [selectedNode, onOpenGuide]
  );

  const handleToggleExpand = useCallback(
    (node: NodeType) => {
      setCollapsedNodeIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    },
    []
  );

  const handleFocusNode = useCallback(
    (node: NodeType) => {
      canvasRef.current?.centerOnNode(node.id);
    },
    []
  );

  // Empty state handling
  if (!graph || graph.nodes.length === 0 || !layout) {
    return (
      <View style={styles.container}>
        <KnowledgeMapEmptyState
          themeColor={themeColor}
          onAskAi={() => onAskAi?.(`What are the clinical guidelines for ${topic.title}?`)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#08090b" />

      {/* Main Interactive Zoom/Pan Canvas */}
      <KnowledgeMapCanvas
        ref={canvasRef}
        graph={graph}
        layout={layout}
        selectedNodeId={selectedNode?.id}
        themeColor={themeColor}
        onSelectNode={handleSelectNode}
        viewportWidth={viewportWidth}
        viewportHeight={viewportHeight}
      />

      {/* Floating Toolbar Controls */}
      <KnowledgeMapToolbar
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onCenter={() => {
          if (graph.rootNodeId) {
            canvasRef.current?.centerOnNode(graph.rootNodeId);
          } else {
            canvasRef.current?.resetView();
          }
        }}
        onReset={() => canvasRef.current?.resetView()}
        onToggleLegend={() => setIsLegendOpen((prev) => !prev)}
        isLegendOpen={isLegendOpen}
        themeColor={themeColor}
      />

      {/* Legend Popover */}
      <KnowledgeMapLegend
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        themeColor={themeColor}
      />

      {/* Node Detail Action Sheet */}
      <KnowledgeMapNodeSheet
        node={selectedNode}
        topicName={topic.title}
        specialtyName={(specialty as any)?.scientificName || (specialty as any)?.name}
        onClose={handleCloseSheet}
        onAskAi={handleAskAi}
        onOpenGuide={handleOpenGuide}
        onToggleExpand={handleToggleExpand}
        onFocusNode={handleFocusNode}
        isExpanded={selectedNode ? !collapsedNodeIds.has(selectedNode.id) : true}
        themeColor={themeColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090b',
    position: 'relative',
    overflow: 'hidden',
  },
});
