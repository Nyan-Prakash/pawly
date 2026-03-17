import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ArticleCard } from '@/components/know/ArticleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { fetchPublishedArticles } from '@/lib/articles';
import { filterArticles, getArticleCategories } from '@/lib/articleContent';
import type { Article } from '@/types';

export default function KnowScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const nextArticles = await fetchPublishedArticles();
      setArticles(nextArticles);
    } catch (err) {
      console.warn('[Know] failed to load articles', err);
      setError('We could not load the library right now.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = ['All', ...getArticleCategories(articles)];
  const visibleArticles = filterArticles(articles, {
    category: selectedCategory,
    query,
  });
  const featuredArticle =
    (selectedCategory === 'All' && !query.trim()
      ? articles.find((article) => article.isFeatured)
      : visibleArticles.find((article) => article.isFeatured)) ?? null;
  const listArticles = featuredArticle
    ? visibleArticles.filter((article) => article.slug !== featuredArticle.slug)
    : visibleArticles;
  const hasOnlyFeaturedResult = visibleArticles.length === 1 && listArticles.length === 0 && featuredArticle;

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
        <View style={{ gap: 4 }}>
          <Text variant="h2">Know</Text>
          <Text variant="body" color={colors.text.secondary}>
            Clear, practical dog training guides
          </Text>
        </View>

        <View
          style={{
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border.default,
            backgroundColor: colors.bg.surface,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <Ionicons name="search" size={18} color={colors.text.secondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search articles, topics, or skills"
            placeholderTextColor={colors.text.secondary + '80'}
            style={{
              flex: 1,
              minHeight: 52,
              color: colors.text.primary,
              fontSize: 16,
            }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {categories.map((category) => {
            const isSelected = category === selectedCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radii.pill,
                  backgroundColor: isSelected ? colors.brand.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brand.primary : colors.border.default,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: isSelected ? colors.text.inverse : colors.text.secondary,
                    fontWeight: '700',
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={{ paddingTop: spacing.xxl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : error ? (
          <EmptyState
            icon="library"
            title="Library unavailable"
            subtitle={error}
            action={{ label: 'Try again', onPress: load }}
          />
        ) : (
          <View style={{ gap: spacing.lg }}>
            {featuredArticle ? (
              <View style={{ gap: spacing.sm }}>
                <Text variant="bodyStrong">Featured</Text>
                <ArticleCard
                  article={featuredArticle}
                  featuredStyle
                  onPress={() => router.push(`/know/article/${featuredArticle.slug}` as never)}
                />
              </View>
            ) : null}

            <View style={{ gap: spacing.sm }}>
              <Text variant="bodyStrong">
                {selectedCategory === 'All' ? 'Library' : `${selectedCategory} Articles`}
              </Text>

              {visibleArticles.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="No articles found"
                  subtitle="Try a different keyword or switch categories."
                />
              ) : hasOnlyFeaturedResult ? (
                <Text variant="caption" color={colors.text.secondary}>
                  You&apos;re viewing the only matching article above.
                </Text>
              ) : (
                <View style={{ gap: spacing.md }}>
                  {listArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onPress={() => router.push(`/know/article/${article.slug}` as never)}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
