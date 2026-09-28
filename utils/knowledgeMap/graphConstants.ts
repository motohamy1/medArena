import { KnowledgeNodeType, KnowledgeEdgeType } from '../../types/knowledgeMap';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export const GRAPH_CONFIG = {
  minZoom: 0.35,
  maxZoom: 2.8,
  defaultZoom: 0.68, // 2 zoom steps lower than 1.0 (1.0 * 0.8 * 0.8 ≈ 0.64-0.68) for broader initial visibility

  rootWidth: 240,
  rootHeight: 56,

  sectionWidth: 204,
  sectionHeight: 50,

  conceptWidth: 178,
  conceptHeight: 48,

  horizontalGap: 24,
  sectionGap: 56,
  verticalGap: 90,

  maxNodesInitial: 40,
  maxEdgesInitial: 60,

  maxNodes: 60,
  maxEdges: 100,
  maxLabelLength: 80,
  maxSummaryLength: 500,
} as const;

export const VALID_NODE_TYPES: Set<KnowledgeNodeType> = new Set([
  'root',
  'section',
  'concept',
  'finding',
  'investigation',
  'treatment',
  'drug',
  'complication',
  'red-flag',
  'citation',
  'question',
]);

export const VALID_EDGE_TYPES: Set<KnowledgeEdgeType> = new Set([
  'contains',
  'causes',
  'associated-with',
  'presents-with',
  'diagnosed-by',
  'treated-with',
  'complicated-by',
  'supports',
  'related-to',
  'derived-from',
  'asks-about',
]);

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'node';
}

export function getNodeDimensions(type: KnowledgeNodeType): { width: number; height: number } {
  switch (type) {
    case 'root':
      return { width: GRAPH_CONFIG.rootWidth, height: GRAPH_CONFIG.rootHeight };
    case 'section':
      return { width: GRAPH_CONFIG.sectionWidth, height: GRAPH_CONFIG.sectionHeight };
    default:
      return { width: GRAPH_CONFIG.conceptWidth, height: GRAPH_CONFIG.conceptHeight };
  }
}

export function getNodeVisualConfig(type: KnowledgeNodeType, themeColor?: string) {
  const accent = themeColor || Colors.accent;

  switch (type) {
    case 'root':
      return {
        bg: '#23262b',
        border: accent,
        text: '#ffffff',
        iconName: 'medical' as keyof typeof Ionicons.glyphMap,
        iconColor: accent,
        badgeBg: `${accent}25`,
      };
    case 'section':
      return {
        bg: '#23262b',
        border: 'rgba(255, 255, 255, 0.18)',
        text: '#e8ebf2',
        iconName: 'folder-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: Colors.lavender,
        badgeBg: 'rgba(176, 175, 235, 0.2)',
      };
    case 'finding':
      return {
        bg: '#23262b',
        border: 'rgba(176, 175, 235, 0.35)',
        text: '#ede9fe',
        iconName: 'eye-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: '#b0afeb',
        badgeBg: 'rgba(176, 175, 235, 0.25)',
      };
    case 'investigation':
      return {
        bg: '#23262b',
        border: 'rgba(135, 123, 244, 0.35)',
        text: '#ccfbf1',
        iconName: 'pulse-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: '#877bf4',
        badgeBg: 'rgba(135, 123, 244, 0.25)',
      };
    case 'treatment':
    case 'drug':
      return {
        bg: '#0e1816',
        border: 'rgba(246, 221, 162, 0.4)',
        text: '#f0fdf4',
        iconName: 'medkit-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: '#f6dda2',
        badgeBg: 'rgba(246, 221, 162, 0.25)',
      };
    case 'red-flag':
    case 'complication':
      return {
        bg: '#23262b',
        border: 'rgba(235, 152, 138, 0.45)',
        text: '#ffe4e6',
        iconName: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: '#eb988a',
        badgeBg: 'rgba(235, 152, 138, 0.3)',
      };
    case 'citation':
      return {
        bg: '#23262b',
        border: 'rgba(255, 255, 255, 0.15)',
        text: '#ccd1dc',
        iconName: 'book-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: '#8c92a0',
        badgeBg: 'rgba(255, 255, 255, 0.1)',
      };
    default:
      return {
        bg: '#23262b',
        border: 'rgba(255, 255, 255, 0.15)',
        text: '#ccd1dc',
        iconName: 'ellipse-outline' as keyof typeof Ionicons.glyphMap,
        iconColor: '#8c92a0',
        badgeBg: 'rgba(255, 255, 255, 0.1)',
      };
  }
}
