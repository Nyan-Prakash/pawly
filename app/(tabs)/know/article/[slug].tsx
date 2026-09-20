import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ArticleCard } from '@/components/know/ArticleCard';
import { ArticleContentRenderer } from '@/components/know/ArticleContentRenderer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListGroup } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fetchArticleBySlug, fetchPublishedArticles } from '@/lib/articles';
import { getDifficultyLabel, getRelatedArticles } from '@/lib/articleContent';
import type { Article } from '@/types';

function ArticleSkeleton() {
  return (
    <View
      style={{ gap: spacing.lg }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading guide"
      accessibilityState={{ busy: true }}
    >
      <SkeletonBlock height={14} width="30%" />
      <SkeletonBlock height={30} width="90%" />
      <SkeletonBlock height={30} width="60%" />
      <SkeletonBlock height={14} width="45%" />
      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        <SkeletonBlock height={16} />
        <SkeletonBlock height={16} />
        <SkeletonBlock height={16} width="80%" />
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={16} />
        <SkeletonBlock height={16} width="70%" />
      </View>
    </View>
  );
}

export default function ArticleReaderScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!slug) {
      setError('This guide could not be found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setError(null);
      const [currentArticle, allArticles] = await Promise.all([fetchArticleBySlug(slug), fetchPublishedArticles()]);

      if (!currentArticle) {
        setArticle(null);
        setRelatedArticles([]);
        setError('This guide could not be found.');
        return;
      }

      setArticle(currentArticle);
      setRelatedArticles(getRelatedArticles(allArticles, currentArticle));
    } catch (err) {
      console.warn('[Learn] failed to load guide', err);
      setError("Couldn't load this guide. Check your connection and try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      refreshControl={
        <RefreshControl
          tintColor={colors.text.secondary}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            load();
          }}
        />
      }
    >
      {isLoading ? (
        <ArticleSkeleton />
      ) : error || !article ? (
        <EmptyState
          icon="book-outline"
          title="Guide unavailable"
          subtitle={error ?? 'This guide could not be found.'}
          action={{ label: 'Back to guides', onPress: () => router.replace('/(tabs)/know') }}
        />
      ) : (
        <>
          <View style={{ gap: spacing.sm }}>
            <Text variant="caption">{article.category}</Text>
            <Text variant="h1" selectable accessibilityRole="header">
              {article.title}
            </Text>
            <Text variant="caption">
              {getDifficultyLabel(article.difficulty)}, {article.readTimeMinutes} min read, updated{' '}
              {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            {article.excerpt ? (
              <Text variant="body" color={colors.text.secondary} selectable>
                {article.excerpt}
              </Text>
            ) : null}
          </View>

          <ArticleContentRenderer content={article.content} />

          {relatedArticles.length > 0 ? (
            <View>
              <SectionHeader title="Related guides" />
              <ListGroup>
                {relatedArticles.map((related) => (
                  <ArticleCard
                    key={related.id}
                    article={related}
                    onPress={() => router.push(`/know/article/${related.slug}` as never)}
                  />
                ))}
              </ListGroup>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
