const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krujhlmoqevnwocqgcdd.supabase.co';
const supabaseKey = 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  // Let's get categories for heart and git
  const { data: heartCats } = await supabase
    .from('categories')
    .select('*')
    .eq('specialty_id', 'heart');
  console.log('Heart categories:', heartCats);

  const { data: gitCats } = await supabase
    .from('categories')
    .select('*')
    .eq('specialty_id', 'git');
  console.log('Git categories:', gitCats);

  // Let's test getCategory query
  console.log('\nTesting .eq("id", "emergencies").eq("specialty_id", "heart").single()...');
  const { data: singleCat, error: singleErr } = await supabase
    .from('categories')
    .select(`
      *,
      topics(id, title, subtitle, type, ai_scope_description)
    `)
    .eq('id', 'emergencies')
    .eq('specialty_id', 'heart')
    .single();

  console.log('Single cat error:', singleErr?.message);
  console.log('Single cat found:', !!singleCat, 'topics:', singleCat?.topics?.length);

  // Let's also check topics table columns
  const { data: sampleTopic } = await supabase
    .from('topics')
    .select('*')
    .limit(1)
    .single();
  console.log('Sample topic keys:', Object.keys(sampleTopic || {}));
}

inspectSchema().catch(console.error);
