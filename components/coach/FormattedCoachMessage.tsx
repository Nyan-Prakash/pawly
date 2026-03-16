import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface FormattedCoachMessageProps {
  message: string;
  textColor?: string;
}

type BlockType = 'header' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'callout';

interface Block {
  type: BlockType;
  content: string;
  items?: string[];
}

/**
 * FormattedCoachMessage renders assistant messages with rich formatting.
 * Supported:
 * - **Header** (Single line wrapped in bold)
 * - Bullet lists (- or •)
 * - Numbered lists (1.)
 * - Callouts (starting with 💡, ⚠️, ✅, 🐶)
 * - Inline bold (**text**)
 * - Paragraphs (split by double newline)
 */
export function FormattedCoachMessage({ message, textColor }: FormattedCoachMessageProps) {
  if (!message) return null;

  const blocks = parseMessage(message);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => (
        <View key={index} style={styles.blockContainer}>
          {renderBlock(block, textColor)}
        </View>
      ))}
    </View>
  );
}

function parseMessage(text: string): Block[] {
  // Split into blocks by one or more empty lines
  const rawBlocks = text.split(/\n\s*\n/);
  const blocks: Block[] = [];

  for (const rawBlock of rawBlocks) {
    const trimmedBlock = rawBlock.trim();
    if (!trimmedBlock) continue;

    // 1. Header: **Text** on a single line
    if (
      trimmedBlock.startsWith('**') &&
      trimmedBlock.endsWith('**') &&
      !trimmedBlock.includes('\n')
    ) {
      blocks.push({
        type: 'header',
        content: trimmedBlock.slice(2, -2),
      });
      continue;
    }

    // 2. Callout: starts with specific emojis
    const calloutEmojis = ['💡', '⚠️', '✅', '🐶'];
    if (calloutEmojis.some((emoji) => trimmedBlock.startsWith(emoji))) {
      blocks.push({
        type: 'callout',
        content: trimmedBlock,
      });
      continue;
    }

    // 3. Lists
    const lines = trimmedBlock.split('\n');

    // Bullet list: all lines start with - or •
    if (lines.every((line) => {
      const t = line.trim();
      return t.startsWith('- ') || t.startsWith('• ');
    })) {
      blocks.push({
        type: 'bullet-list',
        content: trimmedBlock,
        items: lines.map((line) => line.trim().replace(/^[-•]\s*/, '')),
      });
      continue;
    }

    // Numbered list: all lines start with "1. ", "2. ", etc.
    if (lines.every((line) => /^\d+\.\s/.test(line.trim()))) {
      blocks.push({
        type: 'numbered-list',
        content: trimmedBlock,
        items: lines.map((line) => line.trim().replace(/^\d+\.\s*/, '')),
      });
      continue;
    }

    // 4. Default: Paragraph
    blocks.push({
      type: 'paragraph',
      content: trimmedBlock,
    });
  }

  return blocks;
}

function renderBlock(block: Block, textColor?: string) {
  const commonTextStyle = textColor ? { color: textColor } : {};

  switch (block.type) {
    case 'header':
      return <Text style={[styles.header, commonTextStyle]}>{block.content}</Text>;

    case 'callout': {
      // Determine callout border color based on emoji
      let borderColor = colors.brand.primary;
      if (block.content.startsWith('⚠️')) borderColor = colors.status.warningBorder;
      if (block.content.startsWith('✅')) borderColor = colors.status.successBorder;
      if (block.content.startsWith('💡')) borderColor = colors.brand.secondary;

      return (
        <View style={[styles.calloutContainer, { borderLeftColor: borderColor }]}>
          <Text style={[styles.calloutText, commonTextStyle]}>
            {renderInlineBold(block.content, textColor)}
          </Text>
        </View>
      );
    }

    case 'bullet-list':
      return (
        <View style={styles.listContainer}>
          {block.items?.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.listBullet, commonTextStyle]}>•</Text>
              <Text style={[styles.listText, commonTextStyle]}>
                {renderInlineBold(item, textColor)}
              </Text>
            </View>
          ))}
        </View>
      );

    case 'numbered-list':
      return (
        <View style={styles.listContainer}>
          {block.items?.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.listBullet, commonTextStyle]}>{i + 1}.</Text>
              <Text style={[styles.listText, commonTextStyle]}>
                {renderInlineBold(item, textColor)}
              </Text>
            </View>
          ))}
        </View>
      );

    case 'paragraph':
      return (
        <Text style={[styles.paragraph, commonTextStyle]}>
          {renderInlineBold(block.content, textColor)}
        </Text>
      );

    default:
      return <Text style={[styles.paragraph, commonTextStyle]}>{block.content}</Text>;
  }
}

/**
 * Splits text by **bold** markers and returns an array of Text components/strings.
 */
function renderInlineBold(text: string, textColor?: string) {
  // Regex that captures the **...** including the markers
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <Text key={index} style={[styles.boldText, textColor ? { color: textColor } : {}]}>
          {content}
        </Text>
      );
    }
    return part;
  });
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  blockContainer: {
    marginBottom: spacing.xs,
  },
  header: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  calloutContainer: {
    backgroundColor: colors.bg.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginVertical: spacing.xs,
  },
  calloutText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
  },
  listContainer: {
    paddingLeft: spacing.xs,
    marginVertical: 2,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  listBullet: {
    width: 22,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    fontWeight: '600',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
  },
});
