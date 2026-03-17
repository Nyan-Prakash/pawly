import type { Article, ArticleContentBlock, ArticleDifficulty } from '../types/index.ts';

const VALID_DIFFICULTIES = new Set<ArticleDifficulty>(['beginner', 'intermediate', 'advanced']);

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item): item is string => item !== null);
}

export function normalizeArticleDifficulty(value: unknown): ArticleDifficulty {
  return VALID_DIFFICULTIES.has(value as ArticleDifficulty)
    ? (value as ArticleDifficulty)
    : 'beginner';
}

export function normalizeArticleContentBlocks(raw: unknown): ArticleContentBlock[] {
  if (!Array.isArray(raw)) return [];

  const blocks: ArticleContentBlock[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const block = item as Record<string, unknown>;
    const type = asString(block.type);

    if (type === 'paragraph') {
      const text = asString(block.text);
      if (text) blocks.push({ type, text });
      continue;
    }

    if (type === 'heading') {
      const text = asString(block.text);
      const level = block.level === 2 || block.level === 3 ? block.level : null;
      if (text && level) blocks.push({ type, level, text });
      continue;
    }

    if (type === 'bullets' || type === 'checklist') {
      const items = asStringArray(block.items);
      if (items.length > 0) blocks.push({ type, items });
      continue;
    }

    if (type === 'tip' || type === 'warning') {
      const text = asString(block.text);
      if (text) blocks.push({ type, text });
    }
  }

  return blocks;
}

export function filterArticles(articles: Article[], options?: { category?: string; query?: string }): Article[] {
  const normalizedQuery = options?.query?.trim().toLowerCase() ?? '';
  const normalizedCategory = options?.category?.trim().toLowerCase() ?? 'all';

  return articles.filter((article) => {
    if (normalizedCategory !== 'all' && article.category.toLowerCase() !== normalizedCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      article.title,
      article.excerpt,
      article.category,
      article.difficulty,
      ...article.tags,
      ...article.content.flatMap((block) => {
        if ('text' in block) return [block.text];
        if ('items' in block) return block.items;
        return [];
      }),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function getArticleCategories(articles: Article[]): string[] {
  return Array.from(new Set(articles.map((article) => article.category))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getRelatedArticles(
  articles: Article[],
  current: Article,
  limit = 3,
): Article[] {
  return articles
    .filter((article) => article.slug !== current.slug && article.category === current.category)
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

export function getDifficultyLabel(difficulty: ArticleDifficulty): string {
  switch (difficulty) {
    case 'advanced':
      return 'Advanced';
    case 'intermediate':
      return 'Intermediate';
    default:
      return 'Beginner';
  }
}

export function getArticleBlockTone(block: ArticleContentBlock): {
  backgroundColor?: string;
  borderColor?: string;
  title?: string;
} {
  if (block.type === 'tip') {
    return { title: 'Tip' };
  }

  if (block.type === 'warning') {
    return { title: 'Watch For This' };
  }

  return {};
}
