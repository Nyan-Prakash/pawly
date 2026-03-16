import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bqckiotsddmrjnhsawce.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxY2tpb3RzZGRtcmpuaHNhd2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjIxOTQsImV4cCI6MjA4ODg5ODE5NH0.wYSOrU21D6bahD65PYvA4SVAEQrwo6x5_rdi69_k2aY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  console.log('1. Signing in anonymously...');
  const { data: { user }, error: authError } = await supabase.auth.signInAnonymously();
  if (authError || !user) {
    console.error('Auth error:', authError);
    return;
  }
  console.log('User signed in:', user.id);

  console.log('2. Creating a test dog...');
  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .insert({
      owner_id: user.id,
      name: 'TestDog',
      breed: 'Mixed',
      age_months: 6,
      environment_type: 'indoors_low_distraction',
      behavior_goals: ['Leash Pulling'],
      training_experience: 'none',
      equipment: ['collar'],
      lifecycle_stage: 'puppy',
      available_days_per_week: 5,
      available_minutes_per_day: 15,
      preferred_training_days: ['monday','tuesday','wednesday','thursday','friday'],
      preferred_training_windows: {},
      preferred_training_times: {},
      usual_walk_times: [],
      session_style: 'slow',
      schedule_flexibility: 'fixed',
      schedule_intensity: 'relaxed',
      blocked_days: [],
      blocked_dates: [],
      timezone: 'UTC'
    })
    .select()
    .single();

  if (dogError || !dog) {
    console.error('Dog creation error:', dogError);
    return;
  }
  console.log('Test dog created:', dog.id);

  console.log('3. Invoking the edge function (generate-adaptive-plan)...');
  const { data: result, error: fnError } = await supabase.functions.invoke('generate-adaptive-plan', {
    body: { dogId: dog.id },
  });

  if (fnError) {
    console.error('Edge function error:', fnError);
    if (fnError.context) {
      console.error('Error Context:', await fnError.context.text());
    }
  } else {
    console.log('Edge function result:', JSON.stringify(result, null, 2));
  }
}

runTest().catch(console.error);
