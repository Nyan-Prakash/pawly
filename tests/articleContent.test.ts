import assert from 'node:assert/strict';
import test from 'node:test';

import { getArticleBlockTone, normalizeArticleContentBlocks } from '../lib/articleContent.ts';

test('normalizeArticleContentBlocks keeps only renderable article blocks', () => {
  const blocks = normalizeArticleContentBlocks([
    { type: 'paragraph', text: 'Paragraph text' },
    { type: 'bullets', items: ['First', '', 'Second'] },
    { type: 'heading', level: 3, text: 'Subhead' },
    { type: 'tip', text: 'Helpful note' },
    { type: 'bullets', items: [] },
    { type: 'unknown', text: 'Ignore me' },
  ]);

  assert.deepEqual(blocks, [
    { type: 'paragraph', text: 'Paragraph text' },
    { type: 'bullets', items: ['First', 'Second'] },
    { type: 'heading', level: 3, text: 'Subhead' },
    { type: 'tip', text: 'Helpful note' },
  ]);
});

test('getArticleBlockTone provides consistent card tone metadata for callout blocks', () => {
  const tipTone = getArticleBlockTone({ type: 'tip', text: 'Do this' });
  const warningTone = getArticleBlockTone({ type: 'warning', text: 'Avoid this' });
  const paragraphTone = getArticleBlockTone({ type: 'paragraph', text: 'Normal text' });

  assert.equal(tipTone.title, 'Tip');
  assert.equal(warningTone.title, 'Watch For This');
  assert.equal(paragraphTone.title, undefined);
});
