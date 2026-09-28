import React from 'react';
import { Path, G, Text as SvgText, Rect, Circle } from 'react-native-svg';
import { KnowledgeMapEdge as EdgeType } from '../../types/knowledgeMap';
import { Colors } from '../../constants/Colors';

interface KnowledgeMapEdgeProps {
  edge: EdgeType;
  sourcePos: { x: number; y: number; width: number; height: number };
  targetPos: { x: number; y: number; width: number; height: number };
  isSelected?: boolean;
  isDimmed?: boolean;
  themeColor?: string;
}

/**
 * NotebookLM-style sleek organic Bezier wire connector with dynamic anchor pins,
 * elastic S-curve curvature, and real-time reactive dragging flexibility.
 */
export const KnowledgeMapEdge: React.FC<KnowledgeMapEdgeProps> = React.memo(
  function KnowledgeMapEdge({ edge, sourcePos, targetPos, isSelected = false, isDimmed = false, themeColor }) {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const isTargetBelow = dy >= 0;
    const isTargetRight = dx >= 0;

    let x1 = sourcePos.x;
    let y1 = sourcePos.y + (isTargetBelow ? sourcePos.height / 2 : -sourcePos.height / 2);
    let x2 = targetPos.x;
    let y2 = targetPos.y + (isTargetBelow ? -targetPos.height / 2 : targetPos.height / 2);

    // If nodes are side-by-side rather than stacked
    const isSideBySide = Math.abs(dx) > Math.abs(dy) * 1.6;
    if (isSideBySide) {
      x1 = sourcePos.x + (isTargetRight ? sourcePos.width / 2 : -sourcePos.width / 2);
      y1 = sourcePos.y;
      x2 = targetPos.x + (isTargetRight ? -targetPos.width / 2 : targetPos.width / 2);
      y2 = targetPos.y;
    }

    // Google NotebookLM-style smooth S-curve interpolation
    let cp1x: number;
    let cp1y: number;
    let cp2x: number;
    let cp2y: number;

    if (isSideBySide) {
      const tensionX = Math.max(Math.abs(x2 - x1) * 0.5, 35);
      cp1x = x1 + (isTargetRight ? tensionX : -tensionX);
      cp1y = y1;
      cp2x = x2 + (isTargetRight ? -tensionX : tensionX);
      cp2y = y2;
    } else {
      const tensionY = Math.max(Math.abs(y2 - y1) * 0.55, 30);
      cp1x = x1;
      cp1y = y1 + (isTargetBelow ? tensionY : -tensionY);
      cp2x = x2;
      cp2y = y2 + (isTargetBelow ? -tensionY : tensionY);
    }

    const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

    const accent = themeColor || Colors.accent;
    const strokeColor = isSelected ? accent : '#40444c';
    const underGlowColor = isSelected ? `${accent}45` : 'rgba(64, 68, 76, 0.18)';
    const strokeWidth = isSelected ? 2.4 : 1.7;
    const strokeOpacity = isDimmed ? 0.15 : isSelected ? 1.0 : 0.75;

    // Midpoint for edge label badge
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const pinColor = isSelected ? accent : '#535862';
    const pinGlow = isSelected ? `${accent}66` : 'rgba(64, 68, 76, 0.3)';

    return (
      <G>
        {/* Ambient Depth / Soft Glowing Underlayer */}
        <Path
          d={pathData}
          stroke={underGlowColor}
          strokeWidth={strokeWidth + (isSelected ? 4 : 2)}
          strokeOpacity={isDimmed ? 0.08 : isSelected ? 0.6 : 0.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Sleek NotebookLM Wire */}
        <Path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* NotebookLM Connection Pin - Source Anchor Dot */}
        <Circle
          cx={x1}
          cy={y1}
          r={isSelected ? 3.5 : 2.5}
          fill={pinColor}
          stroke={pinGlow}
          strokeWidth={1.5}
          opacity={isDimmed ? 0.2 : 0.9}
        />

        {/* NotebookLM Connection Pin - Target Anchor Dot */}
        <Circle
          cx={x2}
          cy={y2}
          r={isSelected ? 3.5 : 2.5}
          fill={pinColor}
          stroke={pinGlow}
          strokeWidth={1.5}
          opacity={isDimmed ? 0.2 : 0.9}
        />

        {/* Interactive Edge Label Badge */}
        {isSelected && edge.label && (
          <G>
            <Rect
              x={midX - 42}
              y={midY - 11}
              width={84}
              height={22}
              rx={7}
              fill="#080e10"
              stroke={strokeColor}
              strokeWidth={1}
              strokeOpacity={0.9}
            />
            <SvgText
              x={midX}
              y={midY + 3.5}
              fill={strokeColor}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {edge.label}
            </SvgText>
          </G>
        )}
      </G>
    );
  }
);

KnowledgeMapEdge.displayName = 'KnowledgeMapEdge';
