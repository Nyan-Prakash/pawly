import { View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { ArticleContentBlock } from '@/types';

const NOTE_META: Record<'tip' | 'warning', { icon: AppIconName; title: string }> = {
  tip: { icon: 'bulb-outline', title: 'Tip' },
  warning: { icon: 'warning-outline', title: 'Watch out' },
};

function ListItems({ items, checklist }: { items: string[]; checklist: boolean }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
          {checklist ? (
            <AppIcon name="checkmark-circle-outline" size={20} color={colors.accent} />
          ) : (
            <View
              style={{
                width: spacing.xs,
                height: spacing.xs,
                borderRadius: radii.full,
                backgroundColor: colors.accent,
                marginTop: spacing.sm,
                marginHorizontal: spacing.sm,
              }}
            />
          )}
          <Text variant="body" selectable style={{ flex: 1 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Renders guide blocks straight on the page: h2 headings, body paragraphs,
 * dot bullets, checklists, and tip / warning notes as a flat Card.
 */
export function ArticleContentRenderer({ content }: { content: ArticleContentBlock[] }) {
  return (
    <View style={{ gap: spacing.lg }}>
      {content.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'paragraph') {
          return (
            <Text key={key} variant="body" selectable>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'heading') {
          return (
            <Text
              key={key}
              variant={block.level === 2 ? 'h2' : 'bodyStrong'}
              selectable
              accessibilityRole="header"
              style={{ marginTop: index === 0 ? 0 : spacing.sm }}
            >
              {block.text}
            </Text>
          );
        }

        if (block.type === 'bullets' || block.type === 'checklist') {
          return <ListItems key={key} items={block.items} checklist={block.type === 'checklist'} />;
        }

        const meta = NOTE_META[block.type];
        return (
          <Card key={key} style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AppIcon name={meta.icon} size={20} color={block.type === 'tip' ? colors.accent : colors.status.warning} />
              <Text variant="captionStrong">{meta.title}</Text>
            </View>
            <Text variant="body" selectable>
              {block.text}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}
