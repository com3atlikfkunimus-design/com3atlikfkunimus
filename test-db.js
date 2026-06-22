const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://djcjoqeiwbdnuygkehfu.supabase.co',
  'sb_publishable_XqolQ8FBFb64HB8O-BQOZA_Fqj977O-'
);

async function run() {
  console.log('Fetching 1 athlete...');
  const { data, error } = await supabase.from('athletes').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Data:', data[0]);
  }
}
run();
