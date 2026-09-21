const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
const { callAI } = require('../services/aiService');
const { interpretClinicalQuery } = require('../services/clinicalQueryInterpreter');
const { decomposeClinicalTask } = require('../services/clinicalTaskDecomposer');
const { createRetrievalPlan } = require('../services/retrievalPlanner');
const { retrieveEvidence } = require('../services/evidenceRetrievalService');
const { assessEvidenceSufficiency, buildCoverageMatrix } = require('../services/evidenceSufficiencyService');
const { composeEvidenceAnswer } = require('../services/clinicalAnswerComposer');
const { createAbstentionResponse, createClarificationResponse, buildResponseContract } = require('../models/responseContracts');
const { logEvent } = require('../services/structuredLogger');
const { extractSessionClinicalState } = require('../services/sessionClinicalState');
const evidenceCache = require('../services/evidenceCache');

// Pure greetings carry no clinical question; running them through evidence
// retrieval produces irrelevant registry noise (spec §34: don't dress
// conversation as evidence-grounded clinical guidance).
const GREETING_PATTERN = /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening)|سلام|اهلا|أهلا|هاي)[!.,\s]*$/i;

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    : null;

// Spec §29: response shape is determined by intent + complexity.
function composerPolicy(query, sessionState) {
    switch (query.intent) {
        case 'drug_question':
            return 'This is a dosing/drug question: lead with the direct answer (drug, dose, route, frequency, duration), then key cautions in 1-2 sentences. Do not force clinical assessment headings.';
        case 'follow_up':
            return 'This is a follow-up: continue the existing conversation naturally. Do not restart with generic headings; resolve references against the established clinical context.';
        case 'research_question':
        case 'latest_evidence':
            return 'This is an evidence-synthesis request: organize as a brief synthesis with a short evidence-landscape summary, then key findings, then stated uncertainty.';
        case 'diagnosis_question':
            return 'This is a diagnostic/workup question: reason-oriented workup (criteria, then tests, then differentials supported by evidence).';
        default:
            return 'This is a clinical management question: lead with the primary recommendation supported by evidence, then important qualifiers, alternatives only if evidence states them, and conflicts if present.';
    }
}

function buildEvidenceContext(evidence) {
    return evidence.map((item, index) => `[SOURCE ${index + 1} | id=${item.id} | title=${item.title} | url=${item.url || ''} | freshness=${item.freshness || 'unknown'}]\n${item.excerpt || item.content}\n[END SOURCE ${index + 1}]`).join('\n\n');
}

// Spec §53 prompt contract. Spec §28: use only sections that materially help;
// the model may use "### Heading" markdown for multi-part answers, which the
// composer parses into the structured sections field.
function buildComposerPrompt(query, evidenceContext, sessionState) {
    return `You are the Med Arena clinical composer. The supplied evidence is authoritative context for this response. Use only facts supported by the supplied evidence for material clinical claims. Never invent citations or claim a source was checked unless it appears below. If evidence is insufficient, state the limitation. If evidence conflicts, report the conflict. Preserve structured patient context. Match the user's language. Keep the answer natural. Do not emit UI control markup other than optional "### Heading" lines for distinct sections. Return only the answer prose.\n\nRESPONSE POLICY: ${composerPolicy(query, sessionState)}\n\nPATIENT CONTEXT (from stated information only): ${JSON.stringify(sessionState)}\n\nINTERPRETED QUERY:\n${JSON.stringify(query)}\n\nRETRIEVED EVIDENCE:\n${evidenceContext}`;
}

function dedupeById(items) {
    const seen = new Set();
    const merged = [];
    for (const item of items || []) {
        if (!item || !item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
    }
    return merged;
}

// Spec V2.1 §0.8/A.3: the model call is bounded. A hung provider must not
// stall the request indefinitely; it becomes MODEL_FAILURE (an abstention,
// never a memory fallback).
const COMPOSER_TIMEOUT_MS = Number(process.env.COMPOSER_TIMEOUT_MS || 30000);

function withModelTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            const error = new Error(`Composer model exceeded ${ms}ms timeout`);
            error.code = 'MODEL_FAILURE';
            reject(error);
        }, ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Spec §58: record the unanswered question for the scientist/review loop.
// Never block the response on this; gaps are advisory.
async function recordKnowledgeGap(message, query, requestId) {
    if (!supabase) return;
    try {
        await supabase.from('knowledge_gaps').insert({ query: String(message).slice(0, 500), category: query.intent || 'clinical_management', context: JSON.stringify({ language: query.language, search_terms: query.search_terms }), status: 'PENDING' });
        logEvent(requestId, 'knowledge_gap_recorded', {});
    } catch (error) {
        logEvent(requestId, 'knowledge_gap_record_failed', { message: error.message });
    }
}

// Structured error response body (spec §38).
function sendStructuredError(res, requestId, code, message, retryable, statusCode = 503) {
    return res.status(statusCode).json({
        error: { code, message, retryable },
        request_id: requestId,
    });
}

router.post('/', async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}`;
    const startedAt = Date.now();
    const stageTimings = [];
    const timeStage = (stage, fn) => {
        const stageStart = Date.now();
        return Promise.resolve(fn()).finally(() => {
            stageTimings.push({ stage, duration_ms: Date.now() - stageStart });
        });
    };
    const { message, history = [] } = req.body || {};
    if (!message) return sendStructuredError(res, requestId, 'QUERY_PARSE_ERROR', 'message is required', false, 400);
    if (GREETING_PATTERN.test(String(message).trim())) {
        return res.json(buildResponseContract({
            answer: { type: 'conversation', text: 'Hello! How can I help you with a clinical question today?', sections: [] },
            evidence: { status: 'PARTIAL', freshness: 'current', sufficiency_score: null },
            query_metadata: { intent: 'conversation' },
        }));
    }
    try {
        logEvent(requestId, 'interpretation_started');
        const query = await timeStage('parse', async () => interpretClinicalQuery(message, history));
        const sessionState = extractSessionClinicalState(history, message);

        // Spec §43/§105: a materially relevant, unresolved ambiguity asks a
        // targeted clarification question — never a guess, never NO_EVIDENCE.
        if (query.clarification_required && query.clarification) {
            logEvent(requestId, 'clarification_required', { token: query.clarification.token });
            const clarificationResponse = createClarificationResponse({ clarification: query.clarification, queryMetadata: query });
            return res.json({ ...clarificationResponse, request_id: requestId, timing: { total_ms: Date.now() - startedAt, stages: stageTimings } });
        }

        // Spec §12/§13: decompose into bounded evidence tasks before planning.
        const tasks = await timeStage('task_decomposition', async () => decomposeClinicalTask(query));
        const plan = createRetrievalPlan(query, sessionState, tasks);
        // Spec §33: request-level time budget — retrieval must respect the
        // plan's budget so a NORMAL request never becomes a 45s spinner.
        const retrievalDeadline = plan.time_budget_ms ? Date.now() + plan.time_budget_ms : null;
        logEvent(requestId, 'retrieval_started', { intent: query.intent, complexity: query.complexity, source_count: plan.plans.length, task_count: tasks.length, max_rounds: plan.max_rounds, time_budget_ms: plan.time_budget_ms });

        // Spec §35/§64: canonical-keyed evidence cache. A hit within TTL
        // skips external retrieval entirely; a stale-but-tolerated hit is
        // labeled, never presented as live.
        const cacheLookup = await timeStage('cache_lookup', async () => evidenceCache.get(query));
        let retrieval;
        let cacheHit = null;
        if (cacheLookup.hit) {
            cacheHit = cacheLookup;
            retrieval = { candidates: cacheLookup.candidates, failures: [], sourceHealth: [{ sourceId: 'cache', status: 'healthy', checkedAt: new Date().toISOString() }], selected: cacheLookup.selected };
            logEvent(requestId, 'cache_hit', { age_ms: cacheLookup.age_ms, stale: cacheLookup.stale, selected_count: cacheLookup.selected.length });
        } else {
            try {
                // Round 1 already uses task-anchored queries (spec §13/§53): the
                // decomposer builds condition-anchored formulations that beat the
                // raw normalized query for source-specific search.
                retrieval = await timeStage('retrieval', () => retrieveEvidence(plan, query, { focusTasks: tasks, deadline: retrievalDeadline }));
                evidenceCache.set(query, { selected: retrieval.selected, candidates: retrieval.candidates });
            } catch (error) {
                // Spec §6/§32: SYSTEM_FAILURE (infrastructure) is distinct from
                // NO_RELEVANT_EVIDENCE (search worked, nothing relevant found).
                const statusByCode = {
                    EMBEDDING_FAILURE: 'SYSTEM_FAILURE',
                    DATABASE_FAILURE: 'SYSTEM_FAILURE',
                    SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
                    RETRIEVAL_TIMEOUT: 'RETRIEVAL_TIMEOUT',
                };
                const status = statusByCode[error.code] || 'SOURCE_UNAVAILABLE';
                logEvent(requestId, 'retrieval_failed', { code: error.code, failures: error.cause });
                const abstention = createAbstentionResponse({ status, queryMetadata: query, limitations: [error.code === 'EMBEDDING_FAILURE' ? 'embedding_provider_unavailable' : 'evidence_source_unavailable'], retryable: true });
                return res.json({ ...abstention, request_id: requestId, timing: { total_ms: Date.now() - startedAt, stages: stageTimings } });
            }
        }
        let sufficiency = assessEvidenceSufficiency(retrieval.selected, query, { systemFailure: false, conflicts: [] });
        // Spec V2.1-P observability: record per-source health on every request.
        logEvent(requestId, 'source_health', { sources: retrieval.sourceHealth });
        logEvent(requestId, 'sufficiency_assessed', { status: sufficiency.status, candidate_count: retrieval.candidates.length, selected_count: retrieval.selected.length, failures: retrieval.failures.length, missing: sufficiency.missing });

        // Spec §21/§31/§35: the retry round CHANGES STRATEGY — it targets the
        // uncovered sub-questions with task-specific queries (deep retrieval),
        // falling back to a broad expansion only when no task focus exists.
        if (['NO_RELEVANT_EVIDENCE', 'NO_EVIDENCE', 'OUTDATED'].includes(sufficiency.status) && plan.max_rounds > 1) {
            const coverage = buildCoverageMatrix(tasks, retrieval.candidates);
            const uncovered = coverage.filter((entry) => entry.coverage !== 'supported');
            const focusTasks = tasks.filter((task) => uncovered.some((entry) => entry.task_id === task.task_id));
            logEvent(requestId, 'retrieval_round_2_started', { reason: sufficiency.missing, uncovered_tasks: uncovered.map((entry) => entry.task_id) });
            try {
                const round2Query = { ...query, temporal_request: sufficiency.missing.includes('current_evidence') ? 'current' : query.temporal_request };
                // Round 2 gets its own budget slice so an exhausted round-1
                // budget cannot starve the deep strategy (spec §33).
                const round2Deadline = Date.now() + (plan.time_budget_ms || 8000);
                const retrieval2 = await timeStage('retrieval_deep', () => retrieveEvidence(plan, round2Query, { forceBroad: true, focusTasks: focusTasks.length ? focusTasks : null, deadline: round2Deadline }));
                const mergedSelected = dedupeById([...retrieval.selected, ...retrieval2.selected]);
                retrieval = { ...retrieval, selected: mergedSelected, candidates: dedupeById([...retrieval.candidates, ...retrieval2.candidates]), failures: [...retrieval.failures, ...retrieval2.failures] };
                evidenceCache.set(query, { selected: mergedSelected, candidates: retrieval.candidates });
                sufficiency = assessEvidenceSufficiency(mergedSelected, query, { systemFailure: false, conflicts: [] });
                logEvent(requestId, 'sufficiency_reassessed', { status: sufficiency.status, selected_count: mergedSelected.length });
            } catch (error) {
                logEvent(requestId, 'retrieval_round_2_failed', { message: error.message });
            }
        }

        if (['NO_RELEVANT_EVIDENCE', 'NO_EVIDENCE', 'OUTDATED', 'SYSTEM_FAILURE', 'SOURCE_UNAVAILABLE'].includes(sufficiency.status)) {
            if (sufficiency.status === 'NO_RELEVANT_EVIDENCE' || sufficiency.status === 'NO_EVIDENCE') await recordKnowledgeGap(message, query, requestId);
            const abstention = createAbstentionResponse({ status: sufficiency.status, queryMetadata: query, limitations: sufficiency.missing, retryable: false });
            return res.json({ ...abstention, request_id: requestId, timing: { total_ms: Date.now() - startedAt, stages: stageTimings } });
        }

        // Coverage matrix drives PARTIAL status + limitations (spec §22/§26).
        const coverage = buildCoverageMatrix(tasks, retrieval.selected);
        const evidenceContext = buildEvidenceContext(retrieval.selected);
        let draft;
        try {
            draft = await timeStage('composition', () => withModelTimeout(callAI(buildComposerPrompt(query, evidenceContext, sessionState), message, history), COMPOSER_TIMEOUT_MS));
        } catch (error) {
            logEvent(requestId, 'model_failed', { code: error.code || 'MODEL_FAILURE', message: error.message });
            const abstention = createAbstentionResponse({ status: 'SYSTEM_FAILURE', queryMetadata: query, limitations: ['model_provider_unavailable'], retryable: true });
            return res.json({ ...abstention, request_id: requestId, timing: { total_ms: Date.now() - startedAt, stages: stageTimings } });
        }
        const response = await composeEvidenceAnswer({ query, evidence: retrieval.selected, sufficiency, conflicts: [], limitations: retrieval.failures.map((failure) => `${failure.source_id}:${failure.code}`), draftText: draft, provider: 'backend', sessionState, coverage });
        // Spec §33/§35: stale cached evidence is labeled, never passed as live.
        if (cacheHit && cacheHit.stale && !response.limitations.includes('cached_evidence_not_live_refreshed')) {
            response.limitations.push('cached_evidence_not_live_refreshed');
        }
        logEvent(requestId, 'claim_verification_completed', { claims: response.claims.length, sources: response.sources.length, status: response.evidence.status, cache_hit: Boolean(cacheHit) });
        return res.json({ ...response, request_id: requestId, timing: { total_ms: Date.now() - startedAt, stages: stageTimings } });
    } catch (error) {
        logEvent(requestId, 'request_error', { code: error.code || 'VALIDATION_FAILURE' });
        return sendStructuredError(res, requestId, error.code || 'VALIDATION_FAILURE', error.message, false, 400);
    }
});

module.exports = router;
