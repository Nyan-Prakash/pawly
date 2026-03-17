import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { getDifficultyLabel } from '@/lib/articleContent';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
  featuredStyle?: boolean;
}

export function ArticleCard({ article, onPress, featuredStyle = false }: ArticleCardProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          style={{
            backgroundColor: pressed ? colors.bg.surfaceAlt : colors.bg.surface,
            borderColor: pressed ? colors.brand.primary + '40' : colors.border.default,
            gap: spacing.sm,
            padding: featuredStyle ? spacing.xl : spacing.lg,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {article.isFeatured ? (
              <View
                style={{
                  borderRadius: radii.pill,
                  backgroundColor: colors.status.warningBg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text variant="micro" style={{ color: '#B45309', fontWeight: '700' }}>
                  Featured
                </Text>
              </View>
            ) : null}

            <View
              style={{
                borderRadius: radii.pill,
                backgroundColor: colors.brand.primary + '14',
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text variant="micro" style={{ color: colors.brand.primary, fontWeight: '700' }}>
                {article.category}
              </Text>
            </View>

            <View
              style={{
                borderRadius: radii.pill,
                backgroundColor: colors.bg.surfaceAlt,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text variant="micro" style={{ color: colors.text.secondary, fontWeight: '600' }}>
                {getDifficultyLabel(article.difficulty)}
              </Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text variant={featuredStyle ? 'h3' : 'bodyStrong'}>{article.title}</Text>
            <Text variant="body" color={colors.text.secondary} numberOfLines={featuredStyle ? 4 : 3}>
              {article.excerpt}
            </Text>
          </View>

          <Text variant="caption" style={{ fontWeight: '600' }}>
            {article.readTimeMinutes} min read
          </Text>
        </Card>
      )}
    </Pressable>
  );
}
