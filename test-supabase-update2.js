const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://djcjoqeiwbdnuygkehfu.supabase.co',
  'sb_publishable_XqolQ8FBFb64HB8O-BQOZA_Fqj977O-'
);

async function run() {
  const { data, error } = await supabase.from('athletes').select('*').limit(1);
  const athlete = data[0];
  console.log('ID:', athlete.id);

  const formTestDate = "2026-06-21T08:00"; 
  const testIso = new Date(formTestDate).toISOString();
  console.log('Attempting update with test_date:', testIso);
  const { error: updateError } = await supabase.from('athletes').update({ test_date: testIso }).eq('id', athlete.id);
  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Update success');
  }
}
run();
