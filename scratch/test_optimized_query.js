const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://krujhlmoqevnwocqgcdd.supabase.co', 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899');

async function testOptimizedQuery(specialtyId) {
  console.log(`\nFetching specialty "${specialtyId}" with optimized query...`);
  const t0 = Date.now();

  const { data: specialty, error: specError } = await supabase
    .from('specialties')
    .select('*')
    .eq('id', specialtyId)
    .single();

  if (specError || !specialty) {
    console.error('Spec error:', specError);
    return;
  }

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select(`
      *,
      topics(id, title, subtitle, type, ai_scope_description)
    `)
    .eq('specialty_id', specialtyId);

  const t1 = Date.now();
  console.log(`Fetched in ${t1 - t0}ms!`);
  console.log(`Specialty: ${specialty.name} (${specialty.id})`);
  console.log(`Categories count: ${categories?.length}`);
  
  let totalTopics = 0;
  categories?.forEach(c => {
    const count = c.topics?.length || 0;
    totalTopics += count;
    console.log(`  - Category [${c.id}] "${c.title}": ${count} topics`);
  });
  console.log(`Total topics for "${specialtyId}": ${totalTopics}`);
}

async function run() {
  await testOptimizedQuery('heart');
  await testOptimizedQuery('nephrology');
  await testOptimizedQuery('pediatrics');
  await testOptimizedQuery('endocrinology');
  await testOptimizedQuery('surgery_gi');
}

run().catch(console.error);
