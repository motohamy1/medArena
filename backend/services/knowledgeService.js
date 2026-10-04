const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// For text embeddings, use the gemini-embedding model (3072 dims, matches the
// custom_knowledge.embedding vector(3072) schema).
const embeddingModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-embedding-2' }) : null;

// Lazy Supabase client: module must be loadable without credentials (tests,
// tooling). Client creation throws on missing URL, so defer it.
let supabase = null;
function getSupabase() {
    if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    }
    return supabase;
}

/**
 * Generate an embedding vector for a piece of text. Throws on failure so the
 * caller can distinguish embedding failure from a legitimately empty result
 * (spec §61/§95: silent [] return is prohibited at the retrieval boundary).
 */
function abortedRequestError() {
    return Object.assign(new Error('Internal knowledge request aborted at retrieval deadline'), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
}

async function generateEmbedding(text, { signal, timeoutMs = 5000 } = {}) {
    if (!embeddingModel) {
        const error = new Error('Embedding provider not configured (GEMINI_API_KEY missing)');
        error.code = 'EMBEDDING_FAILURE';
        throw error;
    }
    if (signal?.aborted) throw abortedRequestError();
    let abortHandler;
    const aborted = signal && new Promise((_, reject) => {
        abortHandler = () => reject(abortedRequestError());
        signal.addEventListener('abort', abortHandler, { once: true });
    });
    let result;
    try {
        const request = embeddingModel.embedContent(text, { timeout: timeoutMs });
        result = await (aborted ? Promise.race([request, aborted]) : request);
    } finally {
        if (abortHandler) signal.removeEventListener('abort', abortHandler);
    }
    return result.embedding.values;
}

/**
 * Lexical (ILIKE) retrieval over the custom_knowledge table. This is the
 * fallback path when embedding generation or the vector RPC fails — one
 * failed retrieval mechanism must not destroy the internal RAG (spec §16/§17).
 * Client-side ranking with the shared relevance scorer keeps this dependency-
 * free (no new SQL migration required).
 */
async function searchInternalKnowledgeLexical(queryText, matchCount = 5, { signal } = {}) {
    if (signal?.aborted) throw abortedRequestError();
    const tokens = String(queryText || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2);
    // Longest/most discriminating terms first; ilike OR over top terms.
    const ranked = tokens.sort((a, b) => b.length - a.length).slice(0, 4);
    if (!ranked.length) return [];
    const filter = ranked.map((token) => `content.ilike.%${token}%,title.ilike.%${token}%`).join(',');
    let request = getSupabase()
        .from('custom_knowledge')
        .select('id, title, source_url, content')
        .or(filter)
        .limit(matchCount * 4);
    if (signal && typeof request.abortSignal === 'function') request = request.abortSignal(signal);
    const { data, error } = await request;
    if (error) {
        const err = new Error(`Internal lexical search failed: ${error.message}`);
        err.code = 'DATABASE_FAILURE';
        throw err;
    }
    // Rank client-side by token overlap with the full query.
    const scored = (data || []).map((row) => {
        const combined = `${row.title || ''} ${row.content || ''}`.toLowerCase();
        const hits = ranked.filter((token) => combined.includes(token)).length;
        return { ...row, similarity: ranked.length ? Number((hits / ranked.length).toFixed(4)) : 0 };
    }).filter((row) => row.similarity > 0).sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, matchCount);
}

/**
 * Hybrid internal knowledge search (spec §16–§17):
 *   1. vector (pgvector RPC)
 *   2. lexical (ILIKE)  — on embedding failure OR low vector recall
 *   3. exact title/entity — narrow ILIKE on title only
 * Returns { items, failures } — failures are structured diagnostics, never a
 * silent empty array.
 */
async function searchInternalKnowledge(queryText, matchCount = 5, matchThreshold = 0.45, { signal } = {}) {
    if (signal?.aborted) throw abortedRequestError();
    const failures = [];
    let items = [];

    // 1. Vector path
    try {
        const queryEmbedding = await generateEmbedding(queryText, { signal, timeoutMs: 5000 });
        let request = getSupabase().rpc('match_custom_knowledge', {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });
        if (signal && typeof request.abortSignal === 'function') request = request.abortSignal(signal);
        const { data, error } = await request;
        if (error) {
            failures.push({ mechanism: 'vector', code: 'DATABASE_FAILURE', message: error.message });
        } else if (data && data.length) {
            items = data.map((row) => ({ ...row, similarity: typeof row.similarity === 'number' ? row.similarity : 0.7, retrieval_mechanism: 'vector' }));
        }
    } catch (error) {
        if (signal?.aborted || error?.name === 'AbortError' || error?.code === 'RETRIEVAL_TIMEOUT') throw abortedRequestError();
        failures.push({ mechanism: 'vector', code: 'EMBEDDING_FAILURE', message: error.message });
    }

    // 2. Lexical fallback: on embedding/RPC failure OR weak vector recall
    if (failures.length > 0 || items.length === 0) {
        if (signal?.aborted) throw abortedRequestError();
        try {
            const lexical = await searchInternalKnowledgeLexical(queryText, matchCount, { signal });
            if (lexical.length) {
                items = lexical.map((row) => ({ ...row, retrieval_mechanism: 'lexical' }));
            }
        } catch (error) {
            if (signal?.aborted || error?.code === 'RETRIEVAL_TIMEOUT') throw abortedRequestError();
            failures.push({ mechanism: 'lexical', code: error.code || 'DATABASE_FAILURE', message: error.message });
        }
    }

    // 3. Exact title search: last resort for precisely named guidelines
    if (items.length === 0) {
        if (signal?.aborted) throw abortedRequestError();
        const probe = String(queryText || '').split(/\s+/).filter((token) => token.length > 5)[0];
        if (probe) {
            try {
                let request = getSupabase()
                    .from('custom_knowledge')
                    .select('id, title, source_url, content')
                    .ilike('title', `%${probe}%`)
                    .limit(matchCount);
                if (signal && typeof request.abortSignal === 'function') request = request.abortSignal(signal);
                const { data, error } = await request;
                if (!error && data && data.length) {
                    items = data.map((row) => ({ ...row, similarity: 0.6, retrieval_mechanism: 'exact_title' }));
                }
            } catch (error) {
                if (signal?.aborted || error?.code === 'RETRIEVAL_TIMEOUT') throw abortedRequestError();
                failures.push({ mechanism: 'exact_title', code: 'DATABASE_FAILURE', message: error.message });
            }
        }
    }

    return { items, failures };
}

/**
 * Perform a similarity search in the Custom Knowledge base.
 * Prioritizes active guidelines and returns rich metadata for attribution.
 * (Legacy vector-only API preserved for chatRoutes/admin callers; production
 * /api/chat/v2 uses searchInternalKnowledge instead.)
 */
async function searchCustomKnowledge(queryText, match_count = 5, match_threshold = 0.45) {
    // 1. Convert user's question to a vector
    let query_embedding;
    try {
        query_embedding = await generateEmbedding(queryText);
    } catch (error) {
        console.error('[Embed Error] Failed to generate embedding:', error.message);
        return [];
    }
    if (!query_embedding) return [];

    // 2. Call the Supabase Postgres function
    const { data, error } = await getSupabase().rpc('match_custom_knowledge', {
        query_embedding,
        match_threshold,
        match_count
    });

    if (error) {
        console.error("[Search Error] Custom Knowledge Match Failed:", error.message);
        return [];
    }

    return data || [];
}

/**
 * Guideline-aware chunking (spec V3 §20): a clinical recommendation and its
 * qualifiers form ONE retrievable unit — never split "recommended" from
 * "only in patients with..." or "may be considered" from "low-certainty
 * evidence".
 *
 * Strategy: sentence-level segmentation, then greedy grouping where a
 * recommendation-bearing sentence pulls the following qualifier sentence(s)
 * into the same chunk. Non-recommendation prose is chunked by size as before.
 */
const RECOMMENDATION_CUE = /\b(recommend(?:s|ed|ation)?s?\b|should be|should not|must be|must not|is indicated|are indicated|first[- ]line|second[- ]line|avoid|contraindicated|monitored with|considered)\b|ينصح|يُنصح|يمنع|يُمنع|يُفضل|يفضل|يوصى/i;
const QUALIFIER_CUE = /^(?:\s*(?:in patients with|only in|provided that|unless|except|if|when|while|because|due to|provided|but|however|although|unless there is|particularly|especially|caution|with caution|for patients|among patients|low[- ]certainty|high[- ]certainty|moderate[- ]certainty|very low|conditional))/i;

function chunkGuidelineText(text, maxChunkSize = 1000) {
    const source = String(text || '');
    const sentences = source.match(/[^.!?(?:۔)]+[.!?]+(?:\s|$)|[^.!?(?:۔)]+$/g) || [source];
    const chunks = [];
    let current = [];
    let currentLength = 0;
    let keepNext = 0; // remaining qualifier sentences that must join the current chunk

    const flush = () => {
        if (current.length) chunks.push(current.join(' ').trim());
        current = [];
        currentLength = 0;
    };

    for (const raw of sentences) {
        const sentence = raw.trim();
        if (!sentence) continue;
        const isRecommendation = RECOMMENDATION_CUE.test(sentence);
        const isQualifier = QUALIFIER_CUE.test(sentence) || keepNext > 0;

        // A qualifier must NOT start a new chunk if a recommendation is open.
        if ((currentLength + sentence.length > maxChunkSize) && !(isQualifier && current.length)) {
            flush();
        }
        current.push(sentence);
        currentLength += sentence.length + 1;
        if (isRecommendation && !QUALIFIER_CUE.test(sentence)) {
            // Open the qualifier window: the NEXT sentence (and only that one)
            // is presumed to qualify this recommendation.
            keepNext = 1;
        } else if (keepNext > 0 && QUALIFIER_CUE.test(sentence)) {
            keepNext -= 1; // consumed by this chunk
        } else {
            keepNext = 0;
        }
    }
    flush();
    return chunks.filter(Boolean);
}

/**
 * Chunk long text into smaller pieces (approx 500-1000 characters)
 * with overlapping to preserve context. (Legacy generic chunker retained for
 * non-guideline ingestion.)
 */
function chunkText(text, maxChunkSize = 1000) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = "";
    let overlapChunk = "";

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if ((currentChunk.length + sentence.length) > maxChunkSize) {
            chunks.push(currentChunk.trim());
            // Overlap: start the next chunk with the last sentence of this chunk
            currentChunk = overlapChunk + " " + sentence;
        } else {
            currentChunk += " " + sentence;
        }
        overlapChunk = sentence; // Keep track of last sentence for overlap
    }
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

/**
 * Admin utility: Ingest a large guideline/resource with metadata, batching,
 * progress reporting, and version control.
 */
async function ingestKnowledge(title, text, sourceUrl = '', onProgress = null, metadata = {}) {
    const {
        guidelineSociety = 'OTHER',
        publicationYear = new Date().getFullYear(),
        versionTag = '',
        pmid = ''
    } = metadata;

    console.log(`[Ingest] Starting ingestion for: "${title}" (${guidelineSociety} ${publicationYear})`);
    // Spec V3 §20: guidelines are chunked recommendation-first (qualifiers
    // stay attached to their recommendation), not as generic prose.
    const chunks = chunkGuidelineText(text);
    console.log(`[Ingest] Sliced into ${chunks.length} guideline-aware chunks.`);

    let successCount = 0;
    const batchSize = 10; // Process 10 chunks at a time for speed

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        // Map each chunk to a promise that embeds and inserts
        const promises = batch.map(async (chunk) => {
            const embedding = await generateEmbedding(chunk);
            if (embedding) {
                const { error } = await getSupabase()
                    .from('custom_knowledge')
                    .insert({
                        title,
                        source_url: sourceUrl,
                        guideline_society: guidelineSociety,
                        publication_year: publicationYear,
                        version_tag: versionTag || `${guidelineSociety} ${publicationYear}`,
                        pmid: pmid || null,
                        is_active: true,
                        content: chunk,
                        embedding
                    });
                if (error) {
                    console.error(`[Ingest] Error inserting chunk:`, error.message);
                } else {
                    return true;
                }
            }
            return false;
        });

        // Await the whole batch concurrently
        const results = await Promise.all(promises);
        successCount += results.filter(r => r).length;

        if (onProgress) {
            onProgress(Math.min(i + batchSize, chunks.length), chunks.length);
        }
        
        // Small delay between batches to respect rate limits
        await new Promise(res => setTimeout(res, 300));
    }
    
    console.log(`[Ingest] Successfully ingested ${successCount}/${chunks.length} chunks for ${title}.`);
    return successCount;
}

module.exports = {
    searchCustomKnowledge,
    searchInternalKnowledge,
    searchInternalKnowledgeLexical,
    chunkText,
    chunkGuidelineText,
    ingestKnowledge
};
