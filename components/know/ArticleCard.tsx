import { ListRow } from '@/components/ui/ListRow';
import { Tag } from '@/components/ui/PillTag';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
}

/** A guide as a list row: title, "category, N min read", chevron. */
export function ArticleCard({ article, onPress }: ArticleCardProps) {
  return (
    <ListRow
      title={article.title}
      subtitle={`${article.category}, ${article.readTimeMinutes} min read`}
      trailing={article.isFeatured ? <Tag label="Featured" tone="accent" /> : 'chevron'}
      onPress={onPress}
      accessibilityHint="Opens the guide"
    />
  );
}
