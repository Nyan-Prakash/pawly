import assert from 'node:assert/strict';
import test from 'node:test';

// Mocking some of the logic from feedback.ts for unit testing
type FeedbackType = 'bug' | 'feature_request' | 'general';

interface FeedbackSubmission {
  feedback_type: FeedbackType;
  message?: string;
  source_screen?: string;
}

function validateFeedback(submission: FeedbackSubmission): { valid: boolean; error?: string } {
  if (!submission.feedback_type) {
    return { valid: false, error: 'Feedback type is required' };
  }

  const allowedTypes: FeedbackType[] = ['bug', 'feature_request', 'general'];
  if (!allowedTypes.includes(submission.feedback_type)) {
    return { valid: false, error: 'Invalid feedback type' };
  }

  return { valid: true };
}

function prepareMessage(message?: string): string | undefined {
  return message?.trim() || undefined;
}

test('feedback validation: accepts valid feedback types', () => {
  assert.deepEqual(validateFeedback({ feedback_type: 'bug' }), { valid: true });
  assert.deepEqual(validateFeedback({ feedback_type: 'feature_request' }), { valid: true });
  assert.deepEqual(validateFeedback({ feedback_type: 'general' }), { valid: true });
});

test('feedback validation: rejects invalid feedback types', () => {
  // @ts-ignore
  assert.deepEqual(validateFeedback({ feedback_type: 'invalid' }).valid, false);
});

test('feedback message preparation: trims whitespace', () => {
  assert.equal(prepareMessage('  hello  '), 'hello');
  assert.equal(prepareMessage('   '), undefined);
  assert.equal(prepareMessage(''), undefined);
  assert.equal(prepareMessage(undefined), undefined);
});
