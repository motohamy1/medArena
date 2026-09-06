const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krujhlmoqevnwocqgcdd.supabase.co';
const supabaseKey = 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  console.log('Checking Supabase tables...');
  
  const { data: specs, error: specErr } = await supabase.from('specialties').select('*');
  console.log('Specialties:', specErr || specs?.length);
  if (specs) {
    console.log('Specialties list:', specs.map(s => s.id));
  }

  const { data: cats, error: catErr } = await supabase.from('categories').select('*');
  console.log('Categories:', catErr || cats?.length);
  if (cats) {
    console.log('Sample categories:', cats.slice(0, 10).map(c => ({ id: c.id, specialty_id: c.specialty_id, title: c.title })));
  }

  const { data: topics, error: topErr } = await supabase.from('topics').select('id, specialty_id, category_id, title');
  console.log('Topics:', topErr || topics?.length);
  if (topics) {
    console.log('Total topics in Supabase:', topics.length);
    const bySpec = {};
    topics.forEach(t => {
      bySpec[t.specialty_id] = (bySpec[t.specialty_id] || 0) + 1;
    });
    console.log('Topics per specialty in Supabase:', bySpec);
  }
}

checkSupabase().catch(console.error);
