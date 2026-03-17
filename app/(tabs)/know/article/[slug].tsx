import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ArticleCard } from '@/components/know/ArticleCard';
import { ArticleContentRenderer } from '@/components/know/ArticleContentRenderer';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { fetchArticleBySlug, fetchPublishedArticles } from '@/lib/articles';
import { getDifficultyLabel, getRelatedArticles } from '@/lib/articleContent';
import type { Article } from '@/types';

export default function ArticleReaderScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!slug) {
      setError('This article could not be found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setError(null);
      const [currentArticle, allArticles] = await Promise.all([
        fetchArticleBySlug(slug),
        fetchPublishedArticles(),
      ]);

      if (!currentArticle) {
        setArticle(null);
        setRelatedArticles([]);
        setError('This article could not be found.');
        return;
      }

      setArticle(currentArticle);
      setRelatedArticles(getRelatedArticles(allArticles, currentArticle));
    } catch (err) {
      console.warn('[Know] failed to load article', err);
      setError('We could not load this article right now.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  return (
    <SafeScreen>
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={colors.brand.primary}
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              load();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl * 2,
          gap: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.bg.surface,
              borderWidth: 1,
              borderColor: colors.border.default,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
          <Text variant="bodyStrong">Know</Text>
        </View>

        {isLoading ? (
          <View style={{ paddingTop: spacing.xxl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : error || !article ? (
          <EmptyState
            icon="library"
            title="Article unavailable"
            subtitle={error ?? 'This article could not be found.'}
            action={{ label: 'Back to library', onPress: () => router.replace('/(tabs)/know') }}
          />
        ) : (
          <View style={{ gap: spacing.lg }}>
            <Card variant="elevated" style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
                  <Text variant="micro" style={{ fontWeight: '600' }}>
                    {getDifficultyLabel(article.difficulty)}
                  </Text>
                </View>
              </View>

              <Text variant="h1">{article.title}</Text>
              <Text variant="body" color={colors.text.secondary} style={{ lineHeight: 28 }}>
                {article.excerpt}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <Text variant="caption" style={{ fontWeight: '600' }}>
                  Pawly
                </Text>
                <Text variant="caption">{article.readTimeMinutes} min read</Text>
                <Text variant="caption">
                  Updated {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </Card>

            <Card style={{ gap: spacing.md }}>
              <ArticleContentRenderer content={article.content} />
            </Card>

            {relatedArticles.length > 0 ? (
              <View style={{ gap: spacing.sm }}>
                <Text variant="bodyStrong">Related in {article.category}</Text>
                {relatedArticles.map((related) => (
                  <ArticleCard
                    key={related.id}
                    article={related}
                    onPress={() => router.push(`/know/article/${related.slug}` as never)}
                  />
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
