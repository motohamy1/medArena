const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const GROQ_KEY = process.env.GROQ_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function callGroq(systemPrompt, userPrompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error(`Groq (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callNvidia(systemPrompt, userPrompt) {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 4000
    })
  });
  if (!response.ok) throw new Error(`Nvidia (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1
    })
  });
  if (!response.ok) throw new Error(`OpenRouter (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(systemPrompt, userPrompt) {
  const engines = [
    { name: 'Groq (LLaMA 3.3 70B)', fn: () => callGroq(systemPrompt, userPrompt) },
    { name: 'Nvidia (LLaMA 3.1 70B)', fn: () => callNvidia(systemPrompt, userPrompt) },
    { name: 'OpenRouter', fn: () => callOpenRouter(systemPrompt, userPrompt) }
  ];

  for (const engine of engines) {
    try {
      const text = await engine.fn();
      let cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.topics && Array.isArray(parsed.topics)) return parsed.topics;
      if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
      return Object.values(parsed).find(v => Array.isArray(v)) || null;
    } catch (e) {
      console.warn(`   ⚠️ Engine ${engine.name} error: ${e.message.substring(0, 100)}`);
    }
  }
  return null;
}

const TARGET_CATEGORIES = [
  // FEVER
  { specialtyId: 'fever', specialtyName: 'Infectious Disease & Critical Care', categoryId: 'emergencies', categoryName: 'Emergencies', target: 16 },
  { specialtyId: 'fever', specialtyName: 'Infectious Disease & Critical Care', categoryId: 'clinical_topics', categoryName: 'Clinical Topics', target: 16 },
  { specialtyId: 'fever', specialtyName: 'Infectious Disease & Critical Care', categoryId: 'tools', categoryName: 'Tools & Diagnostics', target: 16 },
  { specialtyId: 'fever', specialtyName: 'Infectious Disease & Critical Care', categoryId: 'research', categoryName: 'Recent Research', target: 16 },

  // NEUROLOGY
  { specialtyId: 'neuro', specialtyName: 'Neurology & Neurocritical Care', categoryId: 'emergencies', categoryName: 'Emergencies', target: 16 },
  { specialtyId: 'neuro', specialtyName: 'Neurology & Neurocritical Care', categoryId: 'clinical_topics', categoryName: 'Clinical Topics', target: 16 },
  { specialtyId: 'neuro', specialtyName: 'Neurology & Neurocritical Care', categoryId: 'tools', categoryName: 'Tools & Diagnostics', target: 16 },
  { specialtyId: 'neuro', specialtyName: 'Neurology & Neurocritical Care', categoryId: 'research', categoryName: 'Recent Research', target: 16 },

  // PULMONOLOGY
  { specialtyId: 'lungs', specialtyName: 'Pulmonology & Respiratory Medicine', categoryId: 'emergencies', categoryName: 'Emergencies', target: 16 },
  { specialtyId: 'lungs', specialtyName: 'Pulmonology & Respiratory Medicine', categoryId: 'clinical_topics', categoryName: 'Clinical Topics', target: 16 },
  { specialtyId: 'lungs', specialtyName: 'Pulmonology & Respiratory Medicine', categoryId: 'tools', categoryName: 'Tools & Diagnostics', target: 16 },
  { specialtyId: 'lungs', specialtyName: 'Pulmonology & Respiratory Medicine', categoryId: 'research', categoryName: 'Recent Research', target: 16 },

  // DERMATOLOGY
  { specialtyId: 'skin', specialtyName: 'Dermatology & Cutaneous Medicine', categoryId: 'emergencies', categoryName: 'Emergencies', target: 16 },
  { specialtyId: 'skin', specialtyName: 'Dermatology & Cutaneous Medicine', categoryId: 'clinical_topics', categoryName: 'Clinical Topics', target: 16 },
  { specialtyId: 'skin', specialtyName: 'Dermatology & Cutaneous Medicine', categoryId: 'tools', categoryName: 'Tools & Diagnostics', target: 16 },

  // GASTROENTEROLOGY
  { specialtyId: 'git', specialtyName: 'Gastroenterology & Hepatology', categoryId: 'tools', categoryName: 'Tools & Diagnostics', target: 16 },
  { specialtyId: 'git', specialtyName: 'Gastroenterology & Hepatology', categoryId: 'research', categoryName: 'Recent Research', target: 16 },

  // OBSTETRICS & GYNECOLOGY
  { specialtyId: 'gynacology', specialtyName: 'Obstetrics & Gynecology', categoryId: 'emergencies', categoryName: 'Emergencies', target: 16 }
];

async function expandCategory(item) {
  const { data: existing } = await supabase
    .from('topics')
    .select('id, title')
    .eq('specialty_id', item.specialtyId)
    .eq('category_id', item.categoryId);

  const count = existing?.length || 0;
  if (count >= item.target) {
    console.log(`✅ [${item.specialtyId} -> ${item.categoryId}] Satisfied: ${count} topics.`);
    return;
  }

  let needed = item.target - count;
  console.log(`\n🚀 [${item.specialtyName} -> ${item.categoryName}]: Current = ${count}, Generating ${needed} topics...`);

  const existingTitles = existing?.map(t => t.title).join(', ') || 'None';

  // Generate in chunks of 5
  while (needed > 0) {
    const chunkSize = Math.min(5, needed);
    console.log(`   ⚡ Generating chunk of ${chunkSize} topics via Groq/Nvidia...`);

    const systemPrompt = `You are a Chief Medical Officer & Guideline Author. Output pure JSON format: {"topics": [ { "id": "slug_id", "title": "...", "subtitle": "...", "type": "...", "ai_scope_description": "...", "clinical_content": [ { "title": "Immediate Triage & Red Flags", "content": "..." }, { "title": "Diagnostic Criteria & Scoring Systems", "content": "..." }, { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "..." }, { "title": "Stepwise Management Algorithm", "content": "..." }, { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "..." }, { "title": "Exact Reference & Guideline Citations", "content": "..." } ] } ] }`;

    const userPrompt = `Generate exactly ${chunkSize} unique, reference-grounded topics for Specialty: ${item.specialtyName}, Category: ${item.categoryName}.
Do NOT duplicate: ${existingTitles}.
Include exact dosages (mg/kg, routes, intervals), diagnostic criteria, and guidelines (e.g. AHA/ACC, IDSA, GINA, GOLD, ACOG, AAD, NCCN).`;

    const result = await callAI(systemPrompt, userPrompt);
    if (!result || result.length === 0) {
      console.warn(`   ⚠️ Empty chunk received, moving to next iteration.`);
      break;
    }

    for (const topic of result) {
      const record = {
        id: topic.id || `${item.specialtyId}_${item.categoryId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        specialty_id: item.specialtyId,
        category_id: item.categoryId,
        title: topic.title,
        subtitle: topic.subtitle,
        type: topic.type || 'Clinical Protocol',
        ai_scope_description: topic.ai_scope_description || topic.title,
        clinical_content: topic.clinical_content || []
      };

      const { data: found } = await supabase.from('topics').select('id').eq('id', record.id).maybeSingle();
      if (found) {
        await supabase.from('topics').update(record).eq('id', record.id);
      } else {
        await supabase.from('topics').insert(record);
      }
      console.log(`      💾 Saved: ${record.title}`);
    }

    needed -= result.length;
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function main() {
  console.log("🌟 Starting Ultra-Fast Multi-Model Expansion (Groq LLaMA 3.3 70B & Nvidia)...");
  for (const cat of TARGET_CATEGORIES) {
    await expandCategory(cat);
  }

  console.log("\n📊 Verification: Querying Final Counts from Supabase...");
  const { data } = await supabase.from('topics').select('specialty_id, category_id');
  const counts = {};
  data.forEach(r => {
    const k = `${r.specialty_id} -> ${r.category_id}`;
    counts[k] = (counts[k] || 0) + 1;
  });
  console.log("FINAL TOPIC DISTRIBUTION:", counts);
  console.log("TOTAL TOPICS IN DATABASE:", data.length);
}

main();
