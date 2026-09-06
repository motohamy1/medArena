const fs = require('fs');

const content = fs.readFileSync('constants/SpecialtyData.ts', 'utf8');

const specRegex = /^\s{2}([a-z_]+):\s*\{/gm;
let m;
const specs = [];
while ((m = specRegex.exec(content)) !== null) {
  specs.push({ name: m[1], index: m.index });
}

console.log('=== SPECIALTY_KNOWLEDGE in SpecialtyData.ts ===');
for (let i = 0; i < specs.length; i++) {
  const start = specs[i].index;
  const end = i < specs.length - 1 ? specs[i+1].index : content.indexOf('...SURGICAL_SPECIALTY_KNOWLEDGE');
  const specBlock = content.slice(start, end);
  
  const catMatches = specBlock.match(/icon:\s*['"][^'"]+['"],\s*topics:\s*\[/g) || [];
  const topicMatches = specBlock.match(/subtitle:\s*['"][^'"]+['"]/g) || [];
  console.log(`${specs[i].name}: ${catMatches.length} categories, ${topicMatches.length} topics`);
}

// Check SurgicalSpecialtiesData.ts
if (fs.existsSync('constants/SurgicalSpecialtiesData.ts')) {
  console.log('\n=== SURGICAL_SPECIALTY_KNOWLEDGE in SurgicalSpecialtiesData.ts ===');
  const surgContent = fs.readFileSync('constants/SurgicalSpecialtiesData.ts', 'utf8');
  const surgRegex = /^\s{2}([a-z_]+):\s*\{/gm;
  const surgSpecs = [];
  while ((m = surgRegex.exec(surgContent)) !== null) {
    surgSpecs.push({ name: m[1], index: m.index });
  }
  for (let i = 0; i < surgSpecs.length; i++) {
    const start = surgSpecs[i].index;
    const end = i < surgSpecs.length - 1 ? surgSpecs[i+1].index : surgContent.length;
    const block = surgContent.slice(start, end);
    const catMatches = block.match(/icon:\s*['"][^'"]+['"],\s*topics:\s*\[/g) || [];
    const topicMatches = block.match(/subtitle:\s*['"][^'"]+['"]/g) || [];
    console.log(`${surgSpecs[i].name}: ${catMatches.length} categories, ${topicMatches.length} topics`);
  }
}
