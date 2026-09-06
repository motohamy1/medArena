const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://krujhlmoqevnwocqgcdd.supabase.co', 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899');

async function checkAllSpecialties() {
  const { data: specs, error: specErr } = await supabase.from('specialties').select('id, name');
  if (specErr) {
    console.error('specErr:', specErr);
    return;
  }

  console.log(`Checking ${specs.length} specialties in DB:`);
  for (const s of specs) {
    const { count: topicCount } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('specialty_id', s.id);

    const { count: catCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('specialty_id', s.id);

    console.log(`- ${s.id} (${s.name}): ${catCount} categories, ${topicCount} topics in Supabase`);
  }
}

checkAllSpecialties().catch(console.error);
