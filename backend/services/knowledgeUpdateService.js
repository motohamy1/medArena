const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: "application/json" }
});
const textModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Triggered after a new textbook or resource is ingested.
 * It summarizes the resource, cross-references with existing specialty_topics, 
 * and silently updates the topics if the new textbook has updated guidelines/data.
 */
async function autoReviewAndUpdateTopics(newTextContent, resourceTitle) {
    try {
        console.log(`[Auto-Update] Starting AI review of newly uploaded resource: "${resourceTitle}"`);
        
        // 1. Summarize the core medical concepts in the new resource
        const summarizePrompt = `
        You are an expert physician. A new medical resource titled "${resourceTitle}" has just been uploaded.
        Read this extracted text and summarize the high-yield medical concepts, updated guidelines, 
        and any critical changes in differential diagnosis, management, or pharmacology.
        
        Extracted Text:
        ${newTextContent.substring(0, 50000)} // Ensure we don't exceed token limits
        
        Output a detailed clinical summary.
        `;
        
        const summaryResult = await textModel.generateContent(summarizePrompt);
        const coreConcepts = summaryResult.response.text();
        console.log(`[Auto-Update] Extracted core concepts from "${resourceTitle}". Checking against existing knowledge base...`);

        // 2. Fetch all existing topics from Supabase
        const { data: existingTopics, error } = await supabase
            .from('topics')
            .select('*');
            
        if (error || !existingTopics || existingTopics.length === 0) {
            console.log("[Auto-Update] No existing specialty topics to update, or database error.");
            return;
        }

        // We batch process topics to not overwhelm the model. 
        // For simplicity, we send them all but tell it to ONLY return the ones that need updates.
        const batchSize = 10;
        let totalProposals = 0;

        for (let i = 0; i < existingTopics.length; i += batchSize) {
            const batch = existingTopics.slice(i, i + batchSize);
            
            const reviewPrompt = `
            You are a rigorous Medical Review Board AI.
            
            A new medical resource was just ingested. Its core concepts are:
            ${coreConcepts}
            
            Here are ${batch.length} existing topics from our database:
            ${JSON.stringify(batch, null, 2)}
            
            Your job is to cross-reference our existing topics against the new resource's concepts.
            Critique the existing data. If the new resource provides a significant update, newer guideline, or better differential diagnosis, you must update the "clinical_content" of that topic.
            
            Return ONLY a JSON array of the topics that you have updated. The schema for each updated object must be identical to the original object (with the same id, specialty_id, category_id, topic_id), but with the updated "clinical_content".
            If no updates are needed for ANY topic in this batch, return an empty array [].
            `;

            const reviewResult = await model.generateContent(reviewPrompt);
            const responseText = reviewResult.response.text();
            
            try {
                const updatedTopics = JSON.parse(responseText);
                if (updatedTopics && updatedTopics.length > 0) {
                    console.log(`[Auto-Update] Found ${updatedTopics.length} review proposals.`);
                    for (const topic of updatedTopics) {
                        if (!topic.id) continue;
                        const originalTopic = batch.find((candidate) => candidate.id === topic.id);
                        const { error: proposalError } = await supabase
                            .from('knowledge_review_queue')
                            .insert({
                                topic_id: topic.id,
                                topic_name: topic.title || originalTopic?.title || 'Untitled topic',
                                content: {
                                    old_content: originalTopic?.clinical_content || null,
                                    new_content: topic.clinical_content || null,
                                    source_document: resourceTitle,
                                    risk_flags: ['AI_GENERATED_REVIEW_REQUIRED'],
                                },
                                source: 'PERIODIC_AUDIT',
                                reference: resourceTitle,
                                trigger_query: 'scientist_surveillance',
                                status: 'PENDING',
                            });
                        if (proposalError) console.error(`[Auto-Update] Error saving review proposal for ${topic.id}:`, proposalError);
                        else totalProposals++;
                    }
                }
            } catch (parseErr) {
                console.error("[Auto-Update] Failed to parse JSON from AI review:", parseErr);
            }
        }
        
        console.log(`[Auto-Update] Complete. Total review proposals queued: ${totalProposals}`);

    } catch (error) {
        console.error("[Auto-Update Error]", error);
    }
}

/**
 * Logs a knowledge update candidate from a chat session.
 * These are potential new guidelines found by the AI in external search results (PMC).
 */
async function logKnowledgeUpdateFromChat(topic, content, reference, query) {
    try {
        console.log(`[Knowledge Mining] Found potential update for topic: ${topic}`);
        const { error } = await supabase
            .from('knowledge_review_queue')
            .insert({
                topic_name: topic,
                content: content,
                reference: reference,
                trigger_query: query,
                source: 'CHAT_MINING',
                status: 'PENDING'
            });

        if (error) {
            // If table doesn't exist, just log to console for now
            if (error.code === '42P01') {
                console.log(`[Knowledge Mining] Queue table not found. Proposal: ${topic} - ${content.substring(0, 100)}...`);
            } else {
                console.error(`[Knowledge Mining] Error saving update:`, error.message);
            }
        }
    } catch (err) {
        console.error(`[Knowledge Mining] Fatal error:`, err);
    }
}

/**
 * Logs a query that yielded no direct evidence-based references.
 * Used to build a "Gap Map" for future ingestion.
 */
async function logKnowledgeGap(query, category) {
    try {
        console.log(`[Knowledge Gap] No reference found for: "${query}" (${category})`);
        await supabase
            .from('knowledge_gaps')
            .insert({
                query: query,
                category: category,
                occurred_at: new Date().toISOString()
            });
    } catch { /* Silent fail */ }
}

module.exports = {
    autoReviewAndUpdateTopics,
    logKnowledgeUpdateFromChat,
    logKnowledgeGap
};
