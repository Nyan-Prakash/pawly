import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getArticleBlockTone } from '@/lib/articleContent';
import type { ArticleContentBlock } from '@/types';

export function ArticleContentRenderer({ content }: { content: ArticleContentBlock[] }) {
  return (
    <View style={{ gap: spacing.md }}>
      {content.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <Text key={`${block.type}-${index}`} variant="body" style={{ lineHeight: 28 }}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'heading') {
          return (
            <Text
              key={`${block.type}-${index}`}
              variant={block.level === 2 ? 'h2' : 'h3'}
              style={{ marginTop: index === 0 ? 0 : spacing.sm }}
            >
              {block.text}
            </Text>
          );
        }

        if (block.type === 'bullets' || block.type === 'checklist') {
          return (
            <View key={`${block.type}-${index}`} style={{ gap: 10 }}>
              {block.items.map((item, itemIndex) => (
                <View
                  key={`${block.type}-${index}-${itemIndex}`}
                  style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
                >
                  <Text
                    variant="bodyStrong"
                    style={{ color: colors.brand.primary, width: 16, marginTop: 1 }}
                  >
                    {block.type === 'checklist' ? '✓' : '•'}
                  </Text>
                  <Text variant="body" style={{ flex: 1, lineHeight: 26 }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          );
        }

        const tone = getArticleBlockTone(block);
        return (
          <Card
            key={`${block.type}-${index}`}
            style={{
              backgroundColor:
                block.type === 'tip'
                  ? colors.status.successBg
                  : block.type === 'warning'
                  ? colors.status.warningBg
                  : colors.bg.surfaceAlt,
              borderColor:
                block.type === 'tip'
                  ? colors.status.successBorder
                  : block.type === 'warning'
                  ? colors.status.warningBorder
                  : colors.border.default,
              gap: 6,
            }}
          >
            {tone.title ? (
              <Text variant="micro" style={{ fontWeight: '700', color: colors.text.secondary }}>
                {tone.title}
              </Text>
            ) : null}
            <Text variant="body" style={{ lineHeight: 26 }}>
              {block.text}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}
