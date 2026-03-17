import assert from 'node:assert/strict';
import test from 'node:test';

import { filterArticles, getArticleCategories, getRelatedArticles } from '../lib/articleContent.ts';
import type { Article } from '../types/index.ts';

const sampleArticles: Article[] = [
  {
    id: '1',
    slug: 'settle-fast',
    title: 'Settle Faster',
    excerpt: 'Help an excited dog slow down.',
    content: [{ type: 'paragraph', text: 'Calm on a mat.' }],
    category: 'Settling',
    difficulty: 'beginner',
    readTimeMinutes: 4,
    isFeatured: true,
    isPublished: true,
    coverImageUrl: null,
    tags: ['calm', 'mat'],
    sortOrder: 1,
    createdAt: '2026-03-17T12:00:00.000Z',
    updatedAt: '2026-03-17T12:00:00.000Z',
  },
  {
    id: '2',
    slug: 'recall-outside',
    title: 'Recall Outside',
    excerpt: 'Build recall when the environment is busy.',
    content: [{ type: 'paragraph', text: 'Use a long line outdoors.' }],
    category: 'Recall',
    difficulty: 'intermediate',
    readTimeMinutes: 6,
    isFeatured: false,
    isPublished: true,
    coverImageUrl: null,
    tags: ['come', 'outdoors'],
    sortOrder: 2,
    createdAt: '2026-03-17T12:00:00.000Z',
    updatedAt: '2026-03-17T12:00:00.000Z',
  },
  {
    id: '3',
    slug: 'settle-after-walks',
    title: 'Settle After Walks',
    excerpt: 'Transition from activity to calm.',
    content: [{ type: 'paragraph', text: 'Reward the first quiet pause.' }],
    category: 'Settling',
    difficulty: 'beginner',
    readTimeMinutes: 5,
    isFeatured: false,
    isPublished: true,
    coverImageUrl: null,
    tags: ['calm', 'transitions'],
    sortOrder: 3,
    createdAt: '2026-03-17T12:00:00.000Z',
    updatedAt: '2026-03-17T12:00:00.000Z',
  },
];

test('filterArticles matches query across title, excerpt, tags, and content', () => {
  assert.deepEqual(
    filterArticles(sampleArticles, { query: 'long line' }).map((article) => article.slug),
    ['recall-outside'],
  );

  assert.deepEqual(
    filterArticles(sampleArticles, { query: 'calm' }).map((article) => article.slug),
    ['settle-fast', 'settle-after-walks'],
  );
});

test('filterArticles respects category filter and getArticleCategories returns sorted labels', () => {
  assert.deepEqual(
    filterArticles(sampleArticles, { category: 'Settling' }).map((article) => article.slug),
    ['settle-fast', 'settle-after-walks'],
  );

  assert.deepEqual(getArticleCategories(sampleArticles), ['Recall', 'Settling']);
});

test('getRelatedArticles returns same-category articles excluding the current article', () => {
  assert.deepEqual(
    getRelatedArticles(sampleArticles, sampleArticles[0]).map((article) => article.slug),
    ['settle-after-walks'],
  );
});
