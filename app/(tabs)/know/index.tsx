import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { ArticleCard } from '@/components/know/ArticleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { ListGroup } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { fetchPublishedArticles } from '@/lib/articles';
import { filterArticles, getArticleCategories } from '@/lib/articleContent';
import type { Article } from '@/types';

function CategoryChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        borderRadius: radii.sm,
        backgroundColor: selected ? colors.accentSoft : colors.bg.fill,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text variant="bodyStrong" color={selected ? colors.accent : colors.text.primary}>
        {label}
      </Text>
    </Pressable>
  );
}

function GuidesSkeleton() {
  return (
    <View style={{ gap: spacing.xl }}>
      <View>
        <SkeletonBlock height={26} width="35%" style={{ marginBottom: spacing.sm }} />
        <View style={{ backgroundColor: colors.bg.surface, borderRadius: radii.md, overflow: 'hidden' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                minHeight: 60,
                justifyContent: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.lg,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border.hairline,
              }}
            >
              <SkeletonBlock height={16} width="70%" />
              <SkeletonBlock height={14} width="40%" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

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
      console.warn('[Learn] failed to load guides', err);
      setError("Couldn't load the guides. Check your connection and try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = ['All', ...getArticleCategories(articles)];
  const visibleArticles = filterArticles(articles, { category: selectedCategory, query });
  const featuredArticle =
    (selectedCategory === 'All' && !query.trim()
      ? articles.find((article) => article.isFeatured)
      : visibleArticles.find((article) => article.isFeatured)) ?? null;
  const listArticles = featuredArticle
    ? visibleArticles.filter((article) => article.slug !== featuredArticle.slug)
    : visibleArticles;
  const hasOnlyFeaturedResult = visibleArticles.length === 1 && listArticles.length === 0 && !!featuredArticle;

  const openArticle = (article: Article) => router.push(`/know/article/${article.slug}` as never);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
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
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search guides"
        accessibilityLabel="Search guides"
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {categories.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={category === selectedCategory}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      ) : null}

      {isLoading ? (
        <GuidesSkeleton />
      ) : error ? (
        <EmptyState
          icon="book-outline"
          title="Guides didn't load"
          subtitle={error}
          action={{ label: 'Try again', onPress: load }}
        />
      ) : (
        <>
          {featuredArticle ? (
            <View>
              <SectionHeader title="Featured" />
              <ListGroup>
                <ArticleCard article={featuredArticle} onPress={() => openArticle(featuredArticle)} />
              </ListGroup>
            </View>
          ) : null}

          <View>
            <SectionHeader title={selectedCategory === 'All' ? 'All guides' : selectedCategory} />
            {visibleArticles.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="No guides match"
                subtitle="Try another word or pick a different category."
                action={
                  query.trim() || selectedCategory !== 'All'
                    ? {
                        label: 'Clear search',
                        onPress: () => {
                          setQuery('');
                          setSelectedCategory('All');
                        },
                      }
                    : undefined
                }
              />
            ) : hasOnlyFeaturedResult ? (
              <Text variant="caption">The only matching guide is the featured one above.</Text>
            ) : (
              <ListGroup>
                {listArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} onPress={() => openArticle(article)} />
                ))}
              </ListGroup>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
