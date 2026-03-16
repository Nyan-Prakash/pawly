import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bqckiotsddmrjnhsawce.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxY2tpb3RzZGRtcmpuaHNhd2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjIxOTQsImV4cCI6MjA4ODg5ODE5NH0.wYSOrU21D6bahD65PYvA4SVAEQrwo6x5_rdi69_k2aY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  let log = '';
  const addLog = (msg) => {
    console.log(msg);
    log += msg + '\n';
  };

  try {
    addLog('1. Authenticating...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (authError || !authData.user) {
      addLog('Auth error: ' + JSON.stringify(authError));
      fs.writeFileSync('test-output.txt', log);
      return;
    }
    const user = authData.user;
    addLog('User ID: ' + user.id);

    addLog('2. Creating dog...');
    const { data: dog, error: dogError } = await supabase
      .from('dogs')
      .insert({
        owner_id: user.id,
        name: 'RemoteTestDog',
        breed: 'Lab',
        age_months: 12,
        environment_type: 'indoors_low_distraction',
        behavior_goals: ['Leash Pulling'],
        training_experience: 'none',
        equipment: ['collar'],
        lifecycle_stage: 'adult',
        available_days_per_week: 3,
        available_minutes_per_day: 10,
        preferred_training_days: ['monday','wednesday','friday'],
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
      addLog('Dog error: ' + JSON.stringify(dogError));
      fs.writeFileSync('test-output.txt', log);
      return;
    }
    addLog('Dog ID: ' + dog.id);

    addLog('3. Calling Edge Function...');
    const { data: resData, error: resError } = await supabase.functions.invoke('generate-adaptive-plan', {
      body: { dogId: dog.id }
    });

    if (resError) {
      addLog('Function error: ' + JSON.stringify(resError));
    } else {
      addLog('Function result: ' + JSON.stringify(resData, null, 2));
    }
  } catch (err) {
    addLog('Exception: ' + err.message);
  }

  fs.writeFileSync('test-output.txt', log);
}

runTest();
