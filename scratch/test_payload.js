const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krujhlmoqevnwocqgcdd.supabase.co';
const supabaseKey = 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPayload() {
  console.log('Testing categories with full topics(clinical_content)...');
  const t0 = Date.now();
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      topics(id, title, subtitle, type, ai_scope_description, clinical_content)
    `)
    .eq('specialty_id', 'heart');
  const t1 = Date.now();
  console.log(`Query time: ${t1 - t0}ms, error:`, error?.message);
  if (categories) {
    const jsonStr = JSON.stringify(categories);
    console.log(`Payload size: ${(jsonStr.length / 1024).toFixed(1)} KB`);
    console.log(`Total topics fetched:`, categories.reduce((sum, c) => sum + (c.topics?.length || 0), 0));
  }

  console.log('\nTesting categories with topics WITHOUT clinical_content...');
  const t2 = Date.now();
  const { data: catLite, error: liteErr } = await supabase
    .from('categories')
    .select(`
      *,
      topics(id, title, subtitle, type, ai_scope_description)
    `)
    .eq('specialty_id', 'heart');
  const t3 = Date.now();
  console.log(`Lite query time: ${t3 - t2}ms, error:`, liteErr?.message);
  if (catLite) {
    const jsonStrLite = JSON.stringify(catLite);
    console.log(`Lite payload size: ${(jsonStrLite.length / 1024).toFixed(1)} KB`);
  }
}

testPayload().catch(console.error);
