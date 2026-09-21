# MEDARENA V3 — Phase 0 Repository Audit & Implementation Plan

Status: AUDIT ONLY — no production files modified.

## 1. Actual production call graph (verified by reading code)

```
Mobile (Expo RN, app/(tabs)/ChatTab.tsx)
  → services/aiService.ts :: aiService.sendMessageByText()
      POST {BACKEND_URL}/api/chat/v2   (45s AbortController timeout)
  → backend/routes/chatV2Routes.js  (router.post '/'; mounted at /api/chat/v2 in server.js)
      1. interpretClinicalQuery()          services/clinicalQueryInterpreter.js
      2. extractSessionClinicalState()     services/sessionClinicalState.js
      3. createRetrievalPlan()             services/retrievalPlanner.js
      4. retrieveEvidence()                services/evidenceRetrievalService.js
           - internal_knowledge → services/knowledgeService.js (Gemini embedding → Supabase pgvector RPC match_custom_knowledge)
           - pubmed            → services/pubmedService.js (esearch/esummary, TITLE-ONLY)
           - europe_pmc        → services/medicalSearchService.js (Europe PMC REST, relaxation ladder)
           - clinicaltrials/fda→ services/medicalSearchService.js
           - every source call wrapped by services/sourceHealthService.js (timeout, retry, breaker)
           - ranking           → services/evidenceRankingService.js
      5. assessEvidenceSufficiency()       services/evidenceSufficiencyService.js
      6. (round 2 only if NO_EVIDENCE/OUTDATED: same plan, forceBroad)
      7. callAI() composer                 services/aiService.js (Groq→Gemini→…)
      8. composeEvidenceAnswer()           services/clinicalAnswerComposer.js
           - claimExtractionService.js + claimVerificationService.js (token overlap)
      9. buildResponseContract()           models/responseContracts.js
  ← JSON { answer, evidence, claims, sources, conflicts, limitations, query_metadata }
ChatTab renders evidence badge from message.sourceType = evidence.status
```

Legacy `/api/chat` (chatRoutes.js) is a separate v1 path — NOT part of v2 flow; untouched.

## 2. Confirmed defects mapped to spec sections

| # | File | Defect | Spec |
|---|------|--------|------|
| D1 | clinicalQueryInterpreter.js:95 | `temporal_request: cond ? 'current' : 'current'` — literally always `current`. | §0.4, §11 |
| D2 | evidenceRetrievalService.js normalizeLegacyResult | `is_current: true` hardcoded on every external record → freshness fabricated. | §0.4, §15 |
| D3 | sourceFreshnessService.js | `assessFreshness()` exists but is NEVER called anywhere in the pipeline. | §15 |
| D4 | clinicalQueryInterpreter.js | Keyword lookup only: no entity resolution, no typo/fuzzy matching (`dthiazide`, `diurctic` fail), no negation ("not emergency" ignored), no BP parsing (`160/90` dropped — digits stripped from tokens), no sex, no age ranges/decade, no clinical_setting, no obesity, no ambiguity candidates (CCP), no clarification path. | §5–§10, §43 |
| D5 | sessionClinicalState.js | Regex state only; no sex/obesity/BP/age-range; state never merged into the retrieval query — follow-ups don't inherit context for retrieval. | §8 |
| D6 | Whole pipeline | No clinical task decomposition, no per-task evidence requirements, no coverage matrix at sub-question level. | §12–§13, §22 |
| D7 | chatV2Routes.js round 2 | Deep retrieval = same plan with `forceBroad` (broader same query), not targeted at missing sub-questions. | §21 |
| D8 | knowledgeService.js | Vector-only internal RAG. Embedding failure → `return []` (silent). No lexical/exact fallback. Suspect embedding model name `gemini-embedding-2` (comment says text-embedding-004) — must verify. | §16–§17, §61, §95 |
| D9 | medicalSearchService.js | Silent `catch { continue/return [] }` in every fetcher; one generic query string sent to PMC/trials/FDA; fetchMedicalKnowledge (HuggingFace SFT dataset) returns model-generated "expert synthesis" text usable as context — prohibited by §0.3 spirit. | §95, §53 |
| D10 | claimVerificationService.js | Token-overlap only (ratio ≥0.35). No negation awareness, no numeric consistency, no semantic check. | §25 |
| D11 | clinicalAnswerComposer.js | Unsupported claims remain in `answerText`; only a disclaimer sentence is APPENDED ("I could not verify every clinical claim…"). Spec demands removal/rewrite before final answer. | §0.5 |
| D12 | pubmedService.js | Title-only metadata; no abstract; no `evidence_depth=metadata_only` marker; can be ranked like abstract evidence. | §20 |
| D13 | evidenceSufficiencyService.js | Collapses NO_RELEVANT_EVIDENCE / SOURCE_UNAVAILABLE / RETRIEVAL_TIMEOUT toward NO_EVIDENCE; `current` check trivially passes due to D2; no population_match value ever set on items (missing `population_match` always). | §6, §32 |
| D14 | models/responseContracts.js | Status set lacks CLARIFICATION_REQUIRED, SOURCE_UNAVAILABLE, RETRIEVAL_TIMEOUT, NO_RELEVANT_EVIDENCE, INSUFFICIENT_EVIDENCE. No structured `{error:{code,message,retryable}}` contract. | §28–§29, §38 |
| D15 | chatV2Routes.js | No request-level time budget (per-source only); no cache; retry round doesn't change strategy; no clarification response path; timing not returned. | §33–§35, §43 |
| D16 | config/sourceRegistry.js | WHO/NICE/CDC/EMA/MHRA listed `enabled: true` but have NO adapters (never planned — currently inert, but registry misrepresents capability). | §19, §80 |
| D17 | services/aiService.ts | ANY backend failure (timeout/HTTP 4xx/5xx/malformed) → `offlineKnowledgeReply()` which RETURNS BUNDLED CLINICAL CONTENT as the answer (labeled "offline"), or a canned system-failure line with no Retry affordance. Spec §33: clinical chat must show "evidence retrieval unavailable + not generating unverified answer" + Retry; bundled content must not pose as the answer to a clinical question. Silent `catch {}`. | §33, §93, §95 |
| D18 | app/(tabs)/ChatTab.tsx | Single ActivityIndicator; no staged progress; badges missing CLARIFICATION_REQUIRED / SOURCE_UNAVAILABLE / RETRIEVAL_TIMEOUT states; retry re-sends identical request (no strategy change). | §48–§49, §91 |
| D19 | backend | No test runner at all (`backend/tests/gold-set.json` exists, nothing executes it; no npm test). | §66 |
| D20 | caching | No caching of canonical queries/results anywhere. | §35, §64 |
| D21 | chatV2Routes.js + ChatTab | Greeting pattern duplicated client+server; client greeting bypasses evidence entirely (acceptable, keep). | — |

## 3. Things that are ALREADY CORRECT (preserve, don't rewrite)

- `/api/chat/v2` route exists and is the single mobile chat path; response contract JSON already typed and validated (`buildResponseContract`).
- `sourceHealthService.js`: per-attempt timeouts, bounded retries w/ backoff, circuit breaker, health snapshot — matches spec §34/§81.
- `structuredLogger.js`: trace IDs + stage events.
- `/api/system/status` (systemRoutes.js) already exists, non-secret.
- Evidence badges server-authoritative in ChatTab; `##GREETING##`/`### Heading` section parsing.
- Provider keys are backend-only; client never calls model providers.
- Migrations 003/004 define real freshness columns (evidence_documents.document_status, superseded_at) — the DB schema supports real freshness; the code just doesn't use it (D2/D3).
- Client timeout (45s) > backend per-source budgets — alignment acceptable; add request-level budget backend-side (D15).

## 4. File-by-file implementation plan

### Backend — modify

| File | Current state | Change | Untouched parts |
|---|---|---|---|
| `backend/services/clinicalQueryInterpreter.js` | 104-line keyword matcher (D1, D4) | Rebuild internals, keep exported API (`interpretClinicalQuery`, `normalizeText`, `detectLanguage`, `rankSearchTerms`): canonical clinical query object; Arabic/EG/EN entity resolution w/ fuzzy typo candidates; negation; BP/age/weight/sex parsing; decade→range; setting/emergency; ambiguity candidates + clarification flag; FIX temporal_request bug | Export names stay; EGYPTIAN_TERMS map kept & extended |
| `backend/services/sessionClinicalState.js` | 37-line regex (D5) | Extend attributes (sex, obesity, BP, age_range, activity); add `mergeIntoQuery(state, query)` used by route so follow-ups inherit context | Only stated-info extraction principle preserved |
| `backend/services/retrievalPlanner.js` | Intent→sources, budget (D6, D15) | Accept tasks+requirements; per-task source planning; complexity class SIMPLE/NORMAL/DEEP; request time budget in plan; source-specific query formulations | BUDGETS concept, addPlan shape |
| `backend/services/evidenceRetrievalService.js` | Variant loop + forceBroad (D2, D7) | Remove `is_current:true`; call assessFreshness; deep round targets missing sub-questions with new queries/sources; dedup by DOI/PMID/title; lexical fallback trigger on internal RAG failure | executeSourceCall usage, ranking call sites |
| `backend/services/knowledgeService.js` | Vector-only, silent [] (D8) | Add lexical (ilike / full-text) + exact-title fallback paths in Supabase when embedding fails; structured failure reporting; verify/fix embedding model name | ingestKnowledge, chunkText |
| `backend/services/evidenceSufficiencyService.js` | Coarse status collapse (D13) | Per-task coverage matrix (supported/partial/unsupported); distinguish NO_RELEVANT_EVIDENCE vs INSUFFICIENT vs SOURCE_UNAVAILABLE; consume real freshness | STATUSES values kept + extended |
| `backend/services/sourceFreshnessService.js` | Orphaned (D3) | Wire into normalization; freshness current/recent/old/unknown from real dates only | parseDate |
| `backend/services/claimExtractionService.js` + `claimVerificationService.js` | Token overlap (D10) | Add negation awareness, numeric/entity consistency, evidence-type gating; keep token overlap as one signal | SUPPORT_LEVELS |
| `backend/services/clinicalAnswerComposer.js` | Appends disclaimer (D11) | Strip/rewrite unsupported sentences from draft BEFORE final text; numerical safety pass; limitations from coverage | Section parsing, contract build |
| `backend/services/pubmedService.js` | Title-only (D12) | Add efetch abstract retrieval; `evidence_depth: 'metadata_only'` when abstract missing | esearch flow, timeouts |
| `backend/services/medicalSearchService.js` | Silent catches, generic query (D9) | Structured failures instead of silent []; source-specific query shaping; stop feeding HF SFT "expert synthesis" into composer context | getQueryTokens/computeRelevance, relaxation ladder |
| `backend/models/responseContracts.js` | Limited statuses (D14) | Add CLARIFICATION_REQUIRED, SOURCE_UNAVAILABLE, RETRIEVAL_TIMEOUT, NO_RELEVANT_EVIDENCE; structured error helper | buildResponseContract validation core |
| `backend/routes/chatV2Routes.js` | Straight pipeline (D7, D15) | Wire tasks/coverage/clarification; bounded strategy-changing retry; request time budget; timing+trace in response; clarification response path | Greeting fast-path, composerPolicy, knowledge gap recording |
| `backend/config/sourceRegistry.js` | Unimplemented entries enabled (D16) | Add `implemented: false` to WHO/NICE/CDC/EMA/MHRA; planner already skips them; keep entries for future adapters | All existing entries retained |
| `backend/package.json` | No test script (D19) | Add `"test": "node --test backend/tests/"` runner scripts only | Dependencies unchanged (zero new packages required) |

### Backend — new files

| File | Purpose |
|---|---|
| `backend/services/clinicalTaskDecomposer.js` | Task decomposition + evidence requirement builder (spec §12–13) |
| `backend/services/evidenceCache.js` | Canonical-query-keyed cache with TTL + stale labeling (spec §35, §64) |
| `backend/services/requestBudget.js` | Request-level time budget helper (spec §33) |
| `backend/tests/interpreter.test.js` | Arabic/EG/EN/typo/negation/BP/decade/follow-up cases (spec §70 A–F) |
| `backend/tests/retrieval.test.js` | Embedding failure → lexical fallback; source timeout; all-sources-down; PubMed metadata-only (§70 G–I) |
| `backend/tests/claims.test.js` | Unsupported claim removal; numeric safety (§70 J, §26) |
| `backend/tests/gold-set.json` | Expand to ≥50 queries incl. Arabic/EG-mixed/follow-up (spec §103) |

### Frontend — modify

| File | Current state | Change | Untouched parts |
|---|---|---|---|
| `services/aiService.ts` | Offline clinical fallback on ANY error (D17) | Backend failure → `{sourceType:'SYSTEM_FAILURE'/'SOURCE_UNAVAILABLE', retryable}` + retry affordance; NO clinical content substitution for clinical questions; map structured error codes; keep bundled KB only for non-evidence contexts | sendMessageByText signature; Pearls; local fuzzy KB used elsewhere |
| `app/(tabs)/ChatTab.tsx` | Single spinner; partial badges (D18) | Staged loading labels (Understanding… → Searching… → Verifying…); add badge states CLARIFICATION_REQUIRED / SOURCE_UNAVAILABLE / RETRIEVAL_TIMEOUT; retry keeps history & message; render clarification question inline | All visual design/theme/navigation; message persistence |

### Explicitly untouched
Navigation, auth/profile, Med Center, Pearls, Map UI, theme/tailwind, `chatRoutes.js` (v1), `adminRoutes.js`, `topicRoutes.js`, `autonomousScientistService.js`, `notificationService.js`, admin panel, `android/` (Gradle/Kotlin/SDK), `app.json`, `eas.json`, all `constants/` data, DB schema unless a gap is proven (then: additive migration only).

## 5. Implementation order (matches spec §77)

Phase 1 schema/interpreter → 2 language/entity → 3 context → 4 decomposition → 5 hybrid RAG → 6 normalization/freshness → 8 deep retrieval → 9 coverage → 10 claims → 11 composer → 12 failure/retry/budget → 13 cache → 15 UI states → 16 tests → 17 benchmark → 18 Android build. Commit after each phase; typecheck + backend smoke test between phases.

## 6. Risks / open items to verify during implementation

1. `gemini-embedding-2` model name validity (D8) — verify with a live call before touching fallback logic.
2. Supabase `match_custom_knowledge` RPC is vector-only; lexical fallback needs either a new RPC or client-side ilike query — prefer an additive SQL function via new migration (additive only).
3. Render free-tier cold start affects latency budgets; request budget must tolerate cold start or surface RETRIEVAL_TIMEOUT honestly.
4. Test A/B/C acceptance depends on internal knowledge containing hypertension-in-obesity and pregnancy content — verify `custom_knowledge` corpus coverage before benchmark.
