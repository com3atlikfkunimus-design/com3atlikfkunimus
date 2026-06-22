import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('athletes').select('id, test_date').limit(1);
  if (error) {
    console.error('Fetch error:', error);
    return;
  }
  const athlete = data[0];
  console.log('Current test_date:', athlete.test_date);

  // simulate update exactly as we did:
  const formTestDate = "2026-06-21T08:00"; // What comes from datetime-local
  const testIso = new Date(formTestDate).toISOString();
  console.log('Attempting update with:', testIso);
  const { error: updateError } = await supabase.from('athletes').update({ test_date: testIso }).eq('id', athlete.id);
  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Update success');
  }
}
test();
