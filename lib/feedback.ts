import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

export type FeedbackType = 'bug' | 'feature_request' | 'general';

export interface FeedbackSubmission {
  feedback_type: FeedbackType;
  message?: string;
  source_screen?: string;
}

/**
 * Submits user feedback to Supabase.
 * Collects platform and app version automatically.
 */
export async function submitUserFeedback(submission: FeedbackSubmission): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to submit feedback.');
  }

  const { error } = await supabase.from('user_feedback').insert({
    user_id: user.id,
    feedback_type: submission.feedback_type,
    message: submission.message?.trim(),
    source_screen: submission.source_screen || 'profile',
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version ?? 'unknown',
  });

  if (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}
