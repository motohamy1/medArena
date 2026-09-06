const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krujhlmoqevnwocqgcdd.supabase.co';
const supabaseKey = 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  // Let's test for heart
  for (const specialtyId of ['heart', 'git', 'nephrology', 'lungs', 'surgery_gi']) {
    console.log(`\n--- Testing specialty: ${specialtyId} ---`);
    const { data: specialty, error: specError } = await supabase
      .from('specialties')
      .select('*')
      .eq('id', specialtyId)
      .single();
    
    console.log('Specialty error:', specError?.message);
    console.log('Specialty found:', !!specialty);

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select(`
        *,
        topics(id, title, subtitle, type, ai_scope_description, clinical_content)
      `)
      .eq('specialty_id', specialtyId);

    console.log('Cat error:', catError?.message);
    console.log('Categories count:', categories?.length);
    if (categories) {
      categories.forEach(c => {
        console.log(`  Category [${c.id}] '${c.title}': ${c.topics?.length || 0} topics`);
        if (c.topics && c.topics.length > 0) {
          console.log(`    First topic: ${c.topics[0].id} - ${c.topics[0].title}`);
        }
      });
    }

    // Also check direct query to topics table for this specialty
    const { count: directTopicCount, error: topCountErr } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('specialty_id', specialtyId);
    console.log(`Direct topic count for ${specialtyId}: ${directTopicCount}`);
  }

  // Total topics count in DB
  const { count: totalTopics } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true });
  console.log(`\nTOTAL topics in DB: ${totalTopics}`);
}

testQuery().catch(console.error);
