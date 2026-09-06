const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://krujhlmoqevnwocqgcdd.supabase.co', 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899');

async function compareSpecialties() {
  // 1. Supabase specialties
  const { data: dbSpecs } = await supabase.from('specialties').select('id, name');
  const dbSpecIds = new Set(dbSpecs.map(s => s.id));
  console.log('Database specialty IDs (' + dbSpecs.length + '):', Array.from(dbSpecIds));

  // 2. SpecialtyData.ts keys
  const specDataContent = fs.readFileSync('constants/SpecialtyData.ts', 'utf8');
  const localSpecKeys = [...specDataContent.matchAll(/^\s{2}([a-z_]+):\s*\{/gm)].map(m => m[1]);
  console.log('\nLocal SpecialtyData keys:', localSpecKeys);

  // 3. Orbit / Med Center routes
  const indexContent = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
  const medOrbitContent = fs.readFileSync('components/ExpandedMedicalOrbitSection.tsx', 'utf8');
  const surgOrbitContent = fs.readFileSync('components/ExpandedSurgicalOrbitSection.tsx', 'utf8');

  const medRoutes = [...medOrbitContent.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const surgRoutes = [...surgOrbitContent.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  console.log('\nMedical Orbit IDs:', medRoutes);
  console.log('Surgical Orbit IDs:', surgRoutes);

  // Check which IDs in orbits exist in DB and local
  console.log('\n--- Checking Medical IDs in DB and Local ---');
  for (const id of medRoutes) {
    console.log(`Medical ID: "${id}" -> DB: ${dbSpecIds.has(id)}, Local: ${localSpecKeys.includes(id)}`);
  }

  console.log('\n--- Checking Surgical IDs in DB and Local ---');
  for (const id of surgRoutes) {
    console.log(`Surgical ID: "${id}" -> DB: ${dbSpecIds.has(id)}, Local: ${localSpecKeys.includes(id)}`);
  }
}

compareSpecialties().catch(console.error);
