import { supabase } from '@/lib/supabase';
import { mapArticleRowToModel } from '@/lib/modelMappers';
import { filterArticles } from '@/lib/articleContent';
import type { Article } from '@/types';

async function fetchArticleRows() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapArticleRowToModel(row));
}

export async function fetchPublishedArticles(): Promise<Article[]> {
  return fetchArticleRows();
}

export async function fetchFeaturedArticles(): Promise<Article[]> {
  const articles = await fetchArticleRows();
  return articles.filter((article) => article.isFeatured);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapArticleRowToModel(data) : null;
}

export async function fetchArticlesByCategory(category: string): Promise<Article[]> {
  const articles = await fetchArticleRows();
  return filterArticles(articles, { category });
}

export async function searchArticles(query: string): Promise<Article[]> {
  const articles = await fetchArticleRows();
  return filterArticles(articles, { query });
}
