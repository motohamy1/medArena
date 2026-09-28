import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export type Section = {
  id: string;
  type: string;
  title?: string;
  content: string;
  colorToken?: string;
};

export type AIResponseCardProps = {
  sections: Section[];
  variant?: 'default' | 'compact';
  onCopy?: (sectionId: string) => void;
  maxCollapsedChars?: number;
};

export default function AIResponseCard({ sections, variant = 'default', onCopy, maxCollapsedChars = 600 }: AIResponseCardProps) {
  return (
    <View style={styles.card}>
      {sections.map((sec) => (
        <SectionBlock key={sec.id} section={sec} onCopy={onCopy} maxCollapsedChars={maxCollapsedChars} />
      ))}
    </View>
  );
}

const SectionBlock: React.FC<{ section: Section; onCopy?: (id: string) => void; maxCollapsedChars: number }> = ({ section, onCopy, maxCollapsedChars }) => {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = section.content.length > maxCollapsedChars;
  const visibleText = !needsCollapse || expanded ? section.content : section.content.slice(0, maxCollapsedChars) + '...';

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={[styles.chip, { backgroundColor: section.colorToken || '#877bf4' }]} />
        <Text style={styles.title}>{section.title || section.type}</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => onCopy?.(section.id)}>
          <Text style={styles.copy}>Copy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.body}>{visibleText}</Text>
      {needsCollapse && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.showMore}>{expanded ? 'Show less' : 'Show more'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#23262b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)'
  },
  section: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    width: 18,
    height: 18,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    color: Colors.textBody,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  copy: {
    color: Colors.grayMuted,
    fontSize: 12,
    padding: 6,
  },
  body: {
    color: Colors.textBody,
    fontSize: 14,
    lineHeight: 20,
  },
  showMore: {
    color: Colors.accent,
    marginTop: 6,
    fontWeight: '600',
  }
});
