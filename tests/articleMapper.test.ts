import assert from 'node:assert/strict';
import test from 'node:test';

import { mapArticleRowToModel } from '../lib/modelMappers.ts';

test('mapArticleRowToModel maps snake_case DB rows to app Article model', () => {
  const article = mapArticleRowToModel({
    id: 'article-1',
    slug: 'sample-article',
    title: 'Sample Article',
    excerpt: 'Short summary',
    content: [
      { type: 'heading', level: 2, text: 'Start here' },
      { type: 'paragraph', text: 'Useful paragraph.' },
    ],
    category: 'Basics',
    difficulty: 'intermediate',
    read_time_minutes: 7,
    is_featured: true,
    is_published: true,
    cover_image_url: null,
    tags: ['focus', 'rewards'],
    sort_order: 4,
    created_at: '2026-03-17T12:00:00.000Z',
    updated_at: '2026-03-17T12:10:00.000Z',
  });

  assert.equal(article.slug, 'sample-article');
  assert.equal(article.readTimeMinutes, 7);
  assert.equal(article.isFeatured, true);
  assert.equal(article.difficulty, 'intermediate');
  assert.deepEqual(article.tags, ['focus', 'rewards']);
  assert.deepEqual(article.content, [
    { type: 'heading', level: 2, text: 'Start here' },
    { type: 'paragraph', text: 'Useful paragraph.' },
  ]);
});

test('mapArticleRowToModel normalizes malformed content blocks and invalid difficulty safely', () => {
  const article = mapArticleRowToModel({
    id: 'article-2',
    slug: 'bad-data',
    title: 'Bad Data',
    excerpt: 'Summary',
    content: [
      { type: 'paragraph', text: 'Keep me' },
      { type: 'heading', level: 9, text: 'Drop me' },
      { type: 'checklist', items: ['One', 2, null] },
      { type: 'warning', text: '' },
    ],
    category: 'Basics',
    difficulty: 'expert',
    read_time_minutes: 5,
    is_featured: false,
    is_published: true,
    tags: ['clear'],
    sort_order: 0,
    created_at: '2026-03-17T12:00:00.000Z',
    updated_at: '2026-03-17T12:00:00.000Z',
  });

  assert.equal(article.difficulty, 'beginner');
  assert.deepEqual(article.content, [
    { type: 'paragraph', text: 'Keep me' },
    { type: 'checklist', items: ['One'] },
  ]);
});
