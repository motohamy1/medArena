const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const providers = [];
if (GEMINI_KEY) providers.push('gemini');
if (OPENROUTER_KEY) providers.push('openrouter');
if (NVIDIA_KEY) providers.push('nvidia');

if (providers.length === 0) {
    console.error("❌ ERROR: No API keys found in backend/.env (Need at least one: GEMINI, OPENROUTER, or NVIDIA)");
    process.exit(1);
}

let currentProviderIndex = 0;

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: "application/json" } }) : null;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SPECIALTIES = [
    { id: 'heart', name: 'Cardiology' },
    { id: 'git', name: 'Gastroenterology' },
    { id: 'fever', name: 'Infectious Disease & Critical Care' },
    { id: 'neuro', name: 'Neurology' },
    { id: 'skin', name: 'Dermatology' },
    { id: 'gynacology', name: 'Obstetrics & Gynecology' },
    { id: 'lungs', name: 'Pulmonology' }
];

const CATEGORIES = [
    { id: 'emergencies', name: 'Emergencies', desc: 'Acute conditions and protocols' },
    { id: 'clinical_topics', name: 'Clinical Topics', desc: 'Standard guidelines and diseases' },
    { id: 'tools', name: 'Tools & Diagnostics', desc: 'Interpretations and procedures' },
    { id: 'research', name: 'Recent Research', desc: 'Latest evidence-based medicine and landmark trials' }
];

async function callOpenRouter(systemPrompt, userPrompt) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
            model: "openrouter/free", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ] 
        })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`429 OpenRouter Quota Error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callNvidia(systemPrompt, userPrompt) {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NVIDIA_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
            model: "meta/llama-3.1-70b-instruct", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 4000
        })
    });
    if (!response.ok) throw new Error(`429 Nvidia Quota Error (${response.status}): ${await response.text()}`);
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGemini(systemPrompt, userPrompt) {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-3.5-flash', 
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction: systemPrompt 
    });
    const result = await model.generateContent(userPrompt);
    return result.response.text();
}

async function callAI(systemPrompt, userPrompt, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const providerName = providers[currentProviderIndex];
        try {
            let text = "";
            if (providerName === 'gemini') {
                text = await callGemini(systemPrompt, userPrompt);
            } else if (providerName === 'openrouter') {
                text = await callOpenRouter(systemPrompt, userPrompt);
            } else if (providerName === 'nvidia') {
                text = await callNvidia(systemPrompt, userPrompt);
            }

            text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); 
            
            return JSON.parse(text);
        } catch (error) {
            console.error(`   ⚠️ [${providerName.toUpperCase()}] Attempt ${attempt} failed: ${error.message.substring(0, 150)}...`);
            
            if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('Too Many Requests')) {
                currentProviderIndex = (currentProviderIndex + 1) % providers.length;
                console.log(`   ➡️ Switched AI Engine to: ${providers[currentProviderIndex].toUpperCase()}`);
                if (currentProviderIndex === 0) await new Promise(r => setTimeout(r, 30000));
                continue;
            }
            if (attempt === retries) return null;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    return null;
}

async function getExhaustiveTopicList(specialty, category) {
    console.log(`\n🔍 Fetching exhaustive topic blueprint for ${specialty.name} - ${category.name}...`);
    
    const systemPrompt = `You are a Chief of Medicine. Output ONLY a pure JSON array of objects. No markdown.
Schema: {"id": "string", "title": "string", "subtitle": "string", "type": "string", "ai_scope_description": "string"}`;
    
    const userPrompt = `List exhaustive topics for specialty: ${specialty.name}, category: ${category.name} (${category.desc}).`;

    const topicList = await callAI(systemPrompt, userPrompt);
    if (!topicList) return [];
    
    console.log(`📋 Discovered ${topicList.length} exhaustive topics.`);
    return topicList;
}

async function generateTopicContent(specialty, category, topic) {
    console.log(`   ✍️ Generating deep clinical content for topic: ${topic.title}...`);
    
    const systemPrompt = `You are a medical textbook author. Generate a JSON object with a key "sections" which is an array of objects: {"title": "string", "content": "string"}. Output ONLY JSON. No markdown.`;
    const userPrompt = `Write clinical content for topic: ${topic.title}. Scope: ${topic.ai_scope_description}.`;

    const content = await callAI(systemPrompt, userPrompt, 3);
    return content?.sections || [];
}

async function generateTopicsForCategory(specialty, category) {
    const topicsBlueprint = await getExhaustiveTopicList(specialty, category);
    if (topicsBlueprint.length === 0) return;

    const { data: existingTopics } = await supabase
        .from('topics')
        .select('id')
        .eq('specialty_id', specialty.id)
        .eq('category_id', category.id);
        
    const existingIds = new Set(existingTopics?.map(t => t.id) || []);

    for (const topicBlueprint of topicsBlueprint) {
        if (existingIds.has(topicBlueprint.id)) {
            console.log(`   ⏩ Skipping ${topicBlueprint.title}, already exists.`);
            continue;
        }

        const clinicalContent = await generateTopicContent(specialty, category, topicBlueprint);
        
        if (clinicalContent && clinicalContent.length > 0) {
            const record = {
                specialty_id: specialty.id,
                category_id: category.id,
                id: topicBlueprint.id,
                title: topicBlueprint.title,
                subtitle: topicBlueprint.subtitle,
                type: topicBlueprint.type,
                ai_scope_description: topicBlueprint.ai_scope_description,
                clinical_content: clinicalContent
            };

            const { error } = await supabase.from('topics').upsert(record);
            if (error) {
                console.error(`   ❌ Failed to save ${topicBlueprint.title}:`, error.message);
            } else {
                console.log(`   💾 Saved ${topicBlueprint.title} successfully.`);
            }
        }
        
        // Minor rate limit between successes
        await new Promise(r => setTimeout(r, 2000));
    }
}

async function run() {
    console.log(`🚀 Starting Multi-Engine Medical Knowledge Generation...`);
    console.log(`Enabled AI Engines: ${providers.join(', ').toUpperCase()}`);
    
    for (const specialty of SPECIALTIES) {
        for (const category of CATEGORIES) {
            await generateTopicsForCategory(specialty, category);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    
    console.log("🎉 Complete! All exhaustive specialties generated and saved.");
}

run();
