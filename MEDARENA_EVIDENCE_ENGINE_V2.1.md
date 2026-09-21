# Med Arena — Evidence Engine V2.1
## Implementation Blueprint & Guardrail Specification for a Weaker Coding Agent

**Revision:** V2.1 — Reliability, bilingual/mixed-language intelligence, and production recovery hardening
**Date:** 2026-09-17
**Precedence:** This V2.1 document supersedes any conflicting behavior described in V2. V2 remains the baseline blueprint; the V2.1 reliability and bilingual/mixed-language requirements below are mandatory overrides.

**Document purpose:** This is an implementation contract for an IDE coding agent. The agent must implement the design below exactly, in small verified stages, without changing product scope, UI design language, framework, or architectural decisions unless an explicit blocker is documented.

**Repository:** `https://github.com/motohamy1/medArena`

**Primary goal:** Transform Med Arena from `LLM + best-effort retrieval` into an **evidence-first clinical intelligence system** where the LLM is a clinical reasoning / natural-language synthesis layer and is never silently allowed to substitute its own memory for missing medical evidence.

---

# 0. NON-NEGOTIABLE AGENT CONTRACT

The coding agent is assumed to be weaker than the author of this specification. It must therefore prefer explicit instructions over inference.

## 0.1 Do not redesign the product

Do NOT:
- rewrite the project in another framework
- migrate Expo/React Native to another stack
- migrate Express to NestJS
- replace Supabase unless explicitly instructed
- remove pgvector
- redesign the existing visual identity
- rewrite the whole app from scratch
- add social/community features
- add unrelated AI features
- replace the current specialty navigation model
- remove existing working screens merely because backend work is being done

The current product stack is Expo/React Native + Express + Supabase/Postgres + pgvector + external medical APIs. Preserve it.

## 0.2 Work incrementally

For every milestone:
1. inspect existing code;
2. make the smallest coherent change;
3. run type/lint/build/tests relevant to that change;
4. inspect failures;
5. fix only the introduced/regressed problems;
6. continue to the next milestone.

Never modify many unrelated files in one blind pass.

## 0.3 Preserve working behavior unless this specification explicitly replaces it

Existing UI rendering, chat history, specialty pages, and topic browsing should remain functional.

The major behavioral replacement is specifically the AI/evidence pipeline.

## 0.4 Never reintroduce silent LLM-memory fallback

Forbidden behavior:

```text
retrieval fails -> ask LLM from general knowledge -> label answer as evidence based
```

Allowed behavior:

```text
retrieval fails
 -> expand query/search
 -> retry with alternate source family
 -> if still insufficient, abstain transparently
```

An LLM may summarize and reason over retrieved evidence. It must not invent a source, cite a source it did not receive, or silently answer from parametric memory for a clinical factual claim.

## 0.5 No fake citations

Never generate synthetic citations such as:
- generic PubMed homepage links
- invented guideline committees
- placeholder PMIDs
- invented publication years
- invented journal names
- citations copied from model output without source validation

Every citation shown to the user must correspond to an actual retrieved source record.

## 0.6 No automatic publication of AI-generated knowledge

The existing knowledge review queue remains the human gate. New or revised canonical knowledge may be proposed by automation but must remain `PENDING` until reviewed/approved according to the existing review workflow.

## 0.7 Never put provider secrets in the mobile bundle

Clinical model-provider keys must remain backend-only. Remove/disable client-side direct model calls as part of the migration, but do not break the app before backend parity exists.

## 0.8 Do not assume the model is always available

The system must degrade safely when AI providers fail.

`AI provider failure` and `evidence retrieval failure` are different states. The app must not convert one into the other.

---


# V2.1 OVERRIDE LAYER — MANDATORY ADDITIONS FROM REAL-WORLD FAILURE TESTING

This section is mandatory. It was added after a real app test exposed a critical failure mode: a mixed Arabic/English clinical question reached Med Arena, the evidence pipeline did not return usable live evidence quickly enough, and the application surfaced an offline/bundled response instead of recovering through intelligent retrieval. The underlying question was understandable to a modern LLM, but the Med Arena retrieval orchestration was too brittle.

The lesson is not to restore unrestricted LLM answering. The lesson is to build a retrieval system that is both evidence-first and operationally resilient.

## V2.1.1 Core architecture law

```text
Evidence determines clinical facts.
The LLM determines interpretation, synthesis, and expression.
```

The LLM is never the clinical source of truth.

## V2.1.2 Retrieval failure is NOT evidence absence

The backend must distinguish at minimum:

```text
SOURCE_FAILED
NETWORK_TIMEOUT
RATE_LIMITED
BACKEND_UNREACHABLE
DATABASE_ERROR
EMBEDDING_ERROR
NO_MATCH_FOUND
INSUFFICIENT_EVIDENCE
CONFLICTING_EVIDENCE
```

Infrastructure errors must trigger recovery paths first. Only genuine evidence insufficiency after bounded recovery may produce an evidence-limited response.

## V2.1.3 Eliminate the global short retrieval cutoff

The current approximately 2.5-second global `Promise.race` pattern is too aggressive for multi-source clinical retrieval. A slow but healthy source can be incorrectly treated as unavailable.

Replace it with:

- fast-lane budget;
- deep-lane budget;
- per-source timeouts;
- bounded retries;
- source health state;
- cache lookup;
- partial-result continuation;
- final evidence sufficiency decision.

A timeout applies to a single attempt, not to the entire clinical answer lifecycle.

## V2.1.4 One bad source must never block the entire answer

A PubMed timeout must not block internal RAG.

An Europe PMC failure must not block guideline retrieval.

ClinicalTrials.gov failure must not block a guideline answer.

The orchestrator continues with healthy sources and records unhealthy sources.

## V2.1.5 Evidence badges must be server-authoritative

The UI must not display `Evidence-Based`, `Verified`, or `Verified Recent` merely because a response is clinical or contains citation-shaped data. The server must explicitly assign the verified status after evidence and claim validation.

Use explicit states such as:

```text
VERIFIED
VERIFIED_RECENT
PARTIAL
CONFLICTING
CACHED_VERIFIED
OUTDATED
NO_EVIDENCE
SYSTEM_FAILURE
```

The client renders the state returned by the backend.

## V2.1.6 Remove the silent direct-provider escape hatch

The mobile app must not bypass the backend evidence engine and call Gemini/Groq/NVIDIA/OpenRouter directly for clinical answers. Provider keys remain server-side.

Direct model calls may exist only inside backend provider adapters or controlled development diagnostics.

## V2.1.7 Cached verified evidence is a legitimate recovery path

When live sources are temporarily unavailable, the system may answer from a previously verified cache if and only if the evidence package contains:

- source identity;
- version;
- publication/update date;
- last verification time;
- cache age;
- supersession state.

Never label cached evidence as live-verified.

## V2.1.8 Simple question does not mean simple retrieval

A short question such as:

```text
"طب بالنسبة للجرعة في الحمل؟"
```

can depend on active drug, diagnosis, pregnancy state, trimester, route, and prior discussion. The query interpreter must recover the clinical context before planning the search.

## V2.1.9 Mixed Arabic/English is a first-class mode

Support natively:

- Egyptian Arabic;
- Modern Standard Arabic;
- English;
- Arabic/English mixed medical speech;
- transliterated medical terms;
- typos;
- Egyptian brand names;
- abbreviations;
- context-dependent follow-ups.

Do not require the physician to reformulate the query into textbook English.

## V2.1.10 Search language and answer language are separate

```text
User language
  ↓
Clinical normalization
  ↓
Canonical medical entities
  ↓
Search formulation
  ↓
Evidence retrieval
  ↓
Evidence verification
  ↓
Natural-language composition
  ↓
User language
```

## V2.1.11 Natural language is a first-class response requirement

Internal response schemas must not force the user-visible prose to look like a search engine. Internal structural markers such as `##GREETING##`/`##END##` must be migrated toward typed response blocks. The model writes natural language inside those blocks.

## V2.1.12 Diagnose before rewriting

For every reported failure, the agent must identify whether it is:

```text
connectivity
retrieval
normalization
ranking
evidence sufficiency
generation
validation
UI rendering
release/APK configuration
```

Never “fix” retrieval by weakening grounding.

# 1. CURRENT SYSTEM: WHAT MUST BE PRESERVED AND WHAT MUST CHANGE

## 1.1 Existing strengths to preserve

The repository already contains:
- Expo Router mobile application
- specialty/topic organization
- Express backend
- Supabase/Postgres
- pgvector custom knowledge store
- Europe PMC retrieval
- ClinicalTrials.gov retrieval
- OpenFDA retrieval
- knowledge gaps
- knowledge review queue
- scientific ledger
- autonomous scientist / ingestion pipeline
- bilingual Egyptian Arabic/English normalization
- conversation history handling

The current project documentation describes Med Arena as a clinical decision-support application for physicians/residents, with a knowledge layer, AI chat, and drug reference workflow.

## 1.2 Existing architecture defects to eliminate

Current defects include:
1. retrieval is best-effort and can be bypassed by direct model fallback;
2. only a few extracted keywords may drive retrieval;
3. vector search alone is insufficient for exact clinical concepts;
4. source authority is not modeled strongly enough;
5. publication year is used ahead of relevance in the existing pgvector ordering;
6. guidelines are chunked as generic prose rather than recommendation-aware clinical units;
7. citations are not claim-level evidence links;
8. the answer is allowed to continue even when evidence is insufficient;
9. source freshness/version/supersession is not operationally enforced;
10. UI section markers are embedded in model text, contributing to rigid output;
11. client-side direct LLM fallback can bypass the backend evidence policy;
12. the Hugging Face medical reasoning dataset is not an authoritative clinical source and must not be treated as one.

---

# 2. TARGET PRODUCT PRINCIPLE

Med Arena must implement this contract:

> **Evidence first. Natural language second.**

The LLM is not the source of truth.

The system of record is the evidence layer.

The model's job is to:
- understand the clinician's intent;
- plan retrieval;
- synthesize retrieved evidence;
- explain it naturally;
- preserve conversation context;
- identify uncertainty/conflicts;
- produce a user-appropriate response.

The model must not be the final authority for unsupported clinical facts.

---

# 3. TARGET ARCHITECTURE

```text
Mobile App
  |
  | POST /api/chat
  v
Express Clinical Orchestrator
  |
  +--> Clinical Query Interpreter
  |
  +--> Session Clinical State
  |
  +--> Retrieval Planner
          |
          +--> Internal Guideline RAG
          +--> PubMed / NCBI
          +--> Europe PMC
          +--> ClinicalTrials.gov
          +--> Regulatory sources
          +--> Drug evidence sources
          +--> Optional approved specialty sources
          |
          v
     Hybrid Retrieval
     (lexical + vector + metadata)
          |
          v
     Candidate Pool
          |
          v
     Reranker
          |
          v
     Evidence Selector
          |
          v
     Sufficiency + Conflict Check
        /                    \
    sufficient            insufficient
       |                      |
       v                      v
Evidence-linked          Search Expansion
context                    / Retry
       |                      |
       v                      v
Natural-language        If still insufficient:
Clinical Composer              ABSTAIN
       |
       v
Claim Extraction
       |
       v
Claim Verification
       |
    /       \
 supported  unsupported
    |           |
    v           v
  answer      remove/qualify
    |
    v
Response Contract
    |
    v
Mobile Renderer
```

---

# 4. RESPONSE CONTRACT: SEPARATE DATA FROM PROSE

Do not make control tags such as `##SECTION##` part of the primary model response contract.

The backend should return structured JSON. Natural language remains plain text inside fields.

Recommended response contract:

```json
{
  "answer": {
    "type": "clinical_guidance",
    "text": "Natural language answer...",
    "sections": [
      {
        "id": "initial-assessment",
        "title": "Initial assessment",
        "text": "Natural language content..."
      }
    ]
  },
  "evidence": {
    "status": "verified",
    "checked_at": "2026-09-13T20:00:00.000Z",
    "freshness": "current",
    "sources_used": 4,
    "primary_source_id": "src_123",
    "sufficiency_score": 0.91
  },
  "claims": [
    {
      "id": "claim_1",
      "text": "...",
      "support_level": "direct",
      "source_ids": ["src_123"]
    }
  ],
  "sources": [
    {
      "id": "src_123",
      "source_type": "guideline",
      "organization": "ACG",
      "title": "...",
      "version": "...",
      "publication_date": "2026-...",
      "retrieved_at": "2026-09-13T...",
      "url": "https://...",
      "pmid": null,
      "doi": null,
      "excerpt": "Exact retrieved supporting excerpt..."
    }
  ],
  "conflicts": [],
  "limitations": [],
  "query_metadata": {
    "language": "ar-EG",
    "intent": "clinical_management",
    "difficulty": "complex"
  }
}
```

The current mobile renderer may initially adapt this contract to its current component structure. Do not perform a UI rewrite before backend correctness is established.

---

# 5. EVIDENCE STATUS MODEL

Every clinical response must have one status:

## `VERIFIED`
Enough high-authority/current evidence exists to answer the material claims.

## `PARTIAL`
Some claims can be supported, but not the full request.

## `CONFLICTING`
Reliable sources disagree materially.

## `OUTDATED`
Relevant evidence exists, but currentness cannot be established.

## `NO_EVIDENCE`
No adequate authoritative evidence was retrieved.

## `SYSTEM_FAILURE`
Evidence may exist, but a system/provider/network failure prevented retrieval. Do not fabricate an answer.

These states must be represented separately from model/provider status.

---

# 6. SOURCE HIERARCHY

The source registry must assign each source family a default authority tier.

## Tier 1 — Primary clinical authority

Examples:
- WHO
- NICE
- CDC
- IDSA
- AHA/ACC
- ESC
- KDIGO
- ADA
- GOLD
- GINA
- ACG
- AGA
- ECCO
- ESGE
- EASL
- AASLD
- AAP
- ACOG
- RCOG
- EAU
- ESMO
- ASCO
- FDA
- EMA
- MHRA

Important: source membership alone does not guarantee that a specific document is current. Version and status still matter.

## Tier 2 — High-quality clinical evidence

- systematic reviews
- meta-analyses
- randomized controlled trials
- major prospective comparative studies

## Tier 3 — Secondary evidence/consensus

- high-quality narrative reviews
- consensus statements
- institutional guidance

## Tier 4 — Discovery/educational sources

Useful for discovering concepts, synonyms, or leads; not acceptable as sole authority for material clinical recommendations.

The existing Hugging Face medical reasoning dataset must be treated as a discovery/model-behavior resource only, not authoritative clinical evidence.

---

# 7. SOURCE REGISTRY

Create a central backend configuration/module, e.g.

`backend/config/sourceRegistry.js`

Each source should contain:

```js
{
  id: 'nice',
  name: 'NICE',
  type: 'guideline',
  tier: 1,
  authorityScore: 1.0,
  jurisdictions: ['UK', 'international'],
  capabilities: ['guideline', 'recommendation', 'surveillance'],
  enabled: true
}
```

Do not hard-code source ranking in multiple services.

The registry is the single source of source-authority configuration.

---

# 8. INITIAL EXTERNAL SOURCES

## 8.1 PubMed / NCBI

Add a dedicated service rather than relying exclusively on Europe PMC.

Use NCBI E-utilities for search/retrieval and obey NCBI request policies. NCBI recommends providing `tool` and `email`, and API keys can raise default request throughput. For large retrieval tasks, batch operations through the history server are preferable. citeturn260626search1turn260626search5

Required capabilities:
- search
- article metadata
- PMID
- publication type
- MeSH terms
- publication date
- abstract
- DOI where present
- batch fetch

Use PubMed as a core biomedical literature source, not as the sole guideline source.

## 8.2 Europe PMC

Keep the existing integration.

Improve it so that it returns normalized evidence objects and supports:
- exact query
- expanded query
- publication date filters
- article type filters
- full metadata
- abstract
- PMID/DOI
- source provenance

## 8.3 ClinicalTrials.gov

Keep the existing integration as a research/emerging-evidence source.

Do not use registry entries as direct treatment recommendations unless a published evidence source supports the recommendation.

Use it for:
- active trials
- recently updated trials
- trial discovery
- emerging evidence

## 8.4 FDA

Keep as regulatory evidence.

Use for:
- official labeling
- warnings
- boxed warnings
- approved indications
- regulatory safety information

Do not substitute FDA labeling for specialty-specific clinical guidelines when the question requires clinical management guidance.

## 8.5 EMA

Add a regulatory service for European regulatory information and safety/labeling context.

## 8.6 MHRA

Add a regulatory safety-update source where practical, especially for medicine safety alerts.

## 8.7 WHO

Include WHO official guidelines and publications in the authoritative source registry. WHO states that its guidelines contain recommendations for clinical practice/public health and are subject to a formal quality-assurance process. citeturn260626search0turn260626search3

## 8.8 Specialty guideline sources

Do not scrape everything at once.

Start with the specialties already represented in Med Arena, then expand source coverage systematically.

The source ingestion system must store the official URL, version/date, organization, status, and retrieval timestamp.

---

# 9. SOURCE INGESTION LIFECYCLE

```text
DISCOVER
  ↓
FETCH
  ↓
VALIDATE METADATA
  ↓
PARSE STRUCTURE
  ↓
NORMALIZE
  ↓
CHUNK BY CLINICAL STRUCTURE
  ↓
EXTRACT RECOMMENDATIONS
  ↓
GENERATE EMBEDDINGS
  ↓
INDEX
  ↓
ACTIVATE ONLY WHEN VALID
```

A malformed source must not partially activate as if it were complete.

---

# 10. DATABASE MODEL V2

Do not destroy the existing `custom_knowledge` table during the first migration.

Add/introduce normalized tables alongside it, then migrate progressively.

Recommended logical entities:

## `evidence_sources`

Fields:
- id
- source_key
- organization
- source_type
- authority_tier
- authority_score
- jurisdiction
- canonical_url
- enabled
- created_at
- updated_at

## `evidence_documents`

Fields:
- id
- source_id
- title
- document_type
- version_tag
- publication_date
- effective_date
- retrieved_at
- superseded_at
- is_current
- supersedes_document_id
- canonical_url
- doi
- pmid
- checksum/content_hash
- raw_metadata JSONB

## `evidence_sections`

Fields:
- id
- document_id
- parent_section_id nullable
- heading
- section_path
- sequence_number
- text

## `evidence_recommendations`

Fields:
- id
- document_id
- section_id
- recommendation_text
- population
- condition
- intervention
- comparator
- outcome
- recommendation_strength
- evidence_certainty
- exceptions
- sequence_number

## `evidence_chunks`

Fields:
- id
- document_id
- section_id nullable
- recommendation_id nullable
- content
- embedding
- lexical_text / searchable text
- chunk_type
- token_count
- created_at

## `clinical_entities`

Fields:
- id
- canonical_name
- entity_type
- aliases JSONB
- mesh_id nullable
- icd_codes JSONB nullable
- arabic_names JSONB
- egyptian_terms JSONB
- normalized_name

## `evidence_entity_links`

Fields:
- evidence_id
- entity_id
- relationship_type

The exact table implementation may be adapted to the current Supabase schema, but the conceptual relationships must remain.

---

# 11. VERSIONING RULES

A document can be:
- CURRENT
- SUPERSEDED
- WITHDRAWN
- UNKNOWN_STATUS

Never delete old evidence merely because a new guideline exists.

When a newer official version is confirmed:
1. mark old document superseded;
2. link `superseded_by_document_id`;
3. activate the new version;
4. preserve old version for historical comparison;
5. remove old version from default current retrieval unless the query explicitly asks historical context.

---

# 12. STRUCTURE-AWARE CHUNKING

The current sentence-size chunker is not sufficient for guidelines.

Implement different chunk types:
- section
- recommendation
- definition
- diagnostic criterion
- dosing block
- contraindication
- table-derived fact where legally/technically safe
- evidence summary
- reference block

Do NOT separate a recommendation from critical qualifiers such as:
- population
- age
- severity
- contraindication
- strength
- certainty
- exception

A recommendation should ideally be embedded with the minimum context required to preserve its clinical meaning.

---

# 13. HYBRID RETRIEVAL

Do not use vector search alone.

Implement:

```text
lexical retrieval
+
semantic retrieval
+
metadata filtering
+
entity matching
```

The candidate pool can be larger than the final answer context.

Recommended initial budgets:
- simple factual: 5–10 candidates
- standard clinical question: 10–20
- complex clinical workflow: 20–40
- research/deep dive: 40–80 candidates

Then rerank/select the most relevant evidence.

These are starting values, not sacred constants. Instrument them and adjust after evaluation.

---

# 14. CLINICAL QUERY INTERPRETER

Replace the conceptual role of `extractEnglishKeywords()` with a richer interpreter.

Create:

`backend/services/clinicalQueryInterpreter.js`

It should produce structured data such as:

```json
{
  "language": "ar-EG",
  "intent": "clinical_management",
  "task": "dose",
  "condition": "...",
  "population": {
    "age": 5,
    "weight": 15,
    "sex": null,
    "pregnancy": false
  },
  "medications": ["amoxicillin"],
  "symptoms": [],
  "labs": [],
  "clinical_state": [],
  "follow_up": false,
  "temporal_request": "current",
  "search_terms": [],
  "entities": []
}
```

The interpreter must normalize:
- English
- Modern Standard Arabic
- Egyptian Arabic
- common misspellings
- Egyptian brand names
- abbreviations
- medical synonyms

The dictionary currently present in the code is useful, but it must become one layer of a broader normalization system, not the entire system.

---

# 15. EGYPTIAN/ARABIC SEARCH NORMALIZATION

Maintain a bilingual clinical lexicon.

Example:

```text
"سخونية" -> fever
"ترجيع" -> vomiting
"نهجان" -> dyspnea / shortness of breath
"كرشة نفس" -> dyspnea
"كتافلام" -> diclofenac potassium
"فولتارين" -> diclofenac
"اوجمنتين" -> amoxicillin/clavulanate
"انتينال" -> nifuroxazide
```

But also derive:
- entity
- disease
- drug
- symptom
- dose
- population
- clinical intent

The search language may be English/MeSH while the response language follows the user's language.

Pipeline:

```text
User Arabic/English
→ normalized clinical representation
→ expanded biomedical search representation
→ evidence retrieval
→ natural-language answer in user language
```

---

# 16. QUERY EXPANSION

For every clinical question, generate multiple retrieval formulations when needed.

Example:

User:

`ينفع كتافلام لمريض عنده قرحة؟`

Potential expanded searches:

```text
diclofenac peptic ulcer contraindication
NSAID peptic ulcer guideline
NSAID gastrointestinal bleeding risk
diclofenac gastrointestinal safety
```

Do not use generated expansion as evidence. Expansion only improves retrieval.

Never allow the expansion model to invent diagnoses or patient facts.

---

# 17. SEARCH INTENTS

Implement explicit retrieval strategies.

## `guideline_question`
Priority:
1. official guideline
2. specialty consensus
3. systematic review/meta-analysis
4. recent supporting studies

## `drug_question`
Priority:
1. regulatory label
2. trusted drug evidence
3. clinical guideline
4. high-quality literature

## `diagnosis_question`
Priority:
1. guideline/validated criteria
2. diagnostic studies
3. relevant reviews

## `latest_evidence`
Priority:
1. latest official update
2. recent RCTs/systematic reviews
3. major new evidence

## `research_question`
Priority:
1. PubMed
2. Europe PMC
3. ClinicalTrials.gov
4. systematic evidence

## `complex_case`
Use all relevant families with structured context.

---

# 18. SESSION CLINICAL STATE

Conversation history alone is not enough.

Create a structured session state that can contain:
- active condition
- patient age
- weight
- sex
- pregnancy status
- renal/hepatic context
- current medication
- previous treatment
- response/failure state
- key laboratory values
- question chain

Follow-up:

`طب وبديله؟`

must resolve against the active structured state.

Do not invent missing patient attributes.

If a missing attribute is essential to answer safely, ask for it or clearly state the limitation.

---

# 19. RETRIEVAL PLANNER

Create:

`backend/services/retrievalPlanner.js`

Input:
- ClinicalQuery
- SessionClinicalState
- source registry

Output:
- search plans
- filters
- query variants
- source families
- retrieval budget
- stop criteria

Example:

```json
{
  "intent": "clinical_management",
  "plans": [
    {
      "source_family": "guidelines",
      "queries": ["...", "..."],
      "max_candidates": 20
    },
    {
      "source_family": "literature",
      "queries": ["..."],
      "max_candidates": 20
    }
  ],
  "minimum_required_authority": 1,
  "require_current_evidence": true
}
```

---

# 20. RETRIEVAL SCORE

Do not sort solely by publication year.

Build a composite score conceptually:

```text
final_score =
  relevance_score * 0.45
  + authority_score * 0.20
  + population_match * 0.15
  + freshness_score * 0.10
  + evidence_type_score * 0.10
```

Implementation must normalize each component to `[0,1]`.

These initial weights are defaults, not final scientific truth. Keep them in configuration so benchmark results can tune them later.

For a guideline-specific query, authority should dominate more heavily.

For a “what changed recently?” query, freshness can receive more weight.

For dosing, population and exact drug/indication match receive greater weight.

---

# 21. METADATA FILTERS

Before ranking, filter when the query provides reliable constraints:
- specialty
- disease
- population
- age group
- pregnancy
- condition state
- source type
- source status
- publication date
- current/superseded status

Do not over-filter when the metadata is uncertain.

---

# 22. RERANKER

Initial implementation can use deterministic scoring without adding another paid model.

Later, an optional reranker model may be introduced.

The reranker must compare:
- query ↔ evidence content
- condition match
- intervention match
- population match
- direct recommendation match
- source authority
- freshness

The reranker must not rewrite evidence.

---

# 23. EVIDENCE SELECTOR

After reranking, choose the smallest evidence set that can support the answer.

Each selected evidence item must have:
- stable ID
- source metadata
- exact content/excerpt
- document version
- retrieval timestamp
- similarity/relevance information
- authority tier

The context passed to the LLM must be clearly delimited.

---

# 24. EVIDENCE SUFFICIENCY ENGINE

Create:

`backend/services/evidenceSufficiencyService.js`

It should answer:

1. Is there at least one authoritative source?
2. Does it directly address the question?
3. Are required patient/population attributes represented?
4. Are major claims supported?
5. Is there an unresolved conflict?
6. Is the source current enough for the request?
7. Does the evidence support recommendations versus merely discuss them?

Return:

```json
{
  "status": "VERIFIED",
  "score": 0.91,
  "missing": [],
  "conflicts": [],
  "support_coverage": 0.94
}
```

Do not expose arbitrary numeric “confidence” to users unless it has been validated. Internal diagnostic scores are safer initially.

---

# 25. RECURSIVE / DEEP RETRIEVAL

A single search pass is not enough for deep questions.

Implement bounded recursive retrieval.

Example:

```text
Question
→ search
→ evidence found
→ identify missing dimension
→ second search
→ compare
→ identify unresolved detail
→ third search
→ stop when evidence sufficient
```

Maximum retrieval rounds should be bounded, e.g. 3–5 initially, to avoid latency/cost explosion.

Every additional retrieval round needs a reason:
- missing population
- missing dose
- unresolved contradiction
- insufficient source authority
- missing current update

Never recurse indefinitely.

---

# 26. TOOL-BASED RESEARCH

The LLM should have access to backend tools/functions conceptually equivalent to:

```text
search_guidelines()
search_pubmed()
search_europe_pmc()
search_trials()
search_regulatory()
search_internal_knowledge()
get_document_section()
get_recommendation()
compare_sources()
```

Do not expose raw provider credentials to the model.

Tool execution belongs to the backend.

The model requests a tool; the orchestrator executes it and returns normalized evidence.

---

# 27. GUIDELINE QUESTION ANSWERING

For a guideline question, response generation should prefer:

```text
Primary recommendation
→ exact supporting evidence
→ important qualifiers
→ alternative if guideline says so
→ conflict if present
→ source metadata
```

Do not produce a generic “textbook answer” first and attach citations later.

---

# 28. NATURAL LANGUAGE COMPOSER

Create a separate answer composition layer.

Conceptual module:

`backend/services/clinicalAnswerComposer.js`

It receives:
- query
- session state
- evidence set
- conflicts
- limitations
- user language
- response policy

It must produce natural language.

Rules:

### Simple factual question
Direct answer in 1–3 short paragraphs or a few bullets.

### Clinical management question
Use only sections that materially help.

### Complex case
Use logical clinical sections.

### Follow-up question
Continue the existing conversation naturally. Do not restart with generic headings.

### Conflicting evidence
Explicitly state disagreement.

### Insufficient evidence
Say so.

The answer must not feel like a search-engine output.

---

# 29. DYNAMIC RESPONSE POLICY

The response shape should be determined by intent + complexity.

Suggested policy:

```text
short_fact
→ direct_answer

clinical_management
→ recommendation + rationale + relevant sections

diagnostic_workup
→ reasoning-oriented workup

drug_dosing
→ deterministic data + concise explanation

follow_up
→ conversational continuation

research
→ evidence synthesis + sources + uncertainty

comparison
→ source-by-source comparison
```

Do not force a fixed set of headers on every question.

---

# 30. CLAIM EXTRACTION

Create:

`backend/services/claimExtractionService.js`

Convert generated output into clinically meaningful atomic claims.

Example:

```text
Claim 1: Drug X is recommended...
Claim 2: Dose is...
Claim 3: Avoid in...
```

Do not split harmless prose unnecessarily; focus on clinically consequential assertions.

---

# 31. CLAIM VERIFICATION

Create:

`backend/services/claimVerificationService.js`

For each material claim:

```text
SUPPORTED_DIRECT
SUPPORTED_INDIRECT
CONFLICTING
UNSUPPORTED
```

A claim should be `SUPPORTED_DIRECT` when the evidence explicitly supports it.

`SUPPORTED_INDIRECT` may be used cautiously when reasoning from evidence is legitimate and transparent.

`UNSUPPORTED` claims must not be silently displayed as facts.

---

# 32. UNSUPPORTED CLAIM POLICY

If a response contains unsupported material claims:
1. remove the unsupported claim; or
2. rewrite it into a clearly qualified statement supported by evidence; or
3. state that evidence was insufficient.

Never invent a citation to rescue a claim.

---

# 33. CONFLICT DETECTION

When reliable sources disagree, store:

```json
{
  "topic": "...",
  "sources": ["src_a", "src_b"],
  "summary": "Meaningful disagreement...",
  "possible_reason": "population/date/jurisdiction/evidence base",
  "resolved": false
}
```

The final response should say that guidelines differ when that matters.

Never average conflicting recommendations into an unsupported hybrid.

---

# 34. NO-EVIDENCE / ABSTENTION RESPONSE

Approved behavior:

```text
I couldn't retrieve sufficient authoritative evidence to verify that point.
```

For partial retrieval:

```text
I found evidence supporting X, but I could not verify Y from a current authoritative source.
```

For system failure:

```text
The evidence service could not be reached right now, so I can't verify this answer safely.
```

Do not add generic medical filler just to avoid an empty response.

---

# 35. DRUG / DOSE ENGINE

Drug dosing is a high-priority special path.

Create a deterministic structure for:
- drug
- indication
- age
- weight
- renal function
- hepatic context where relevant
- route
- frequency
- duration
- max dose
- contraindications

The LLM explains the structured result; it should not calculate a high-stakes dose from memory when authoritative structured evidence is available.

If required inputs are absent, do not fabricate them.

---

# 36. WHAT CHANGED FEATURE BACKEND

Create backend support for evidence change tracking.

Given current and previous guideline documents:

```text
OLD recommendation
NEW recommendation
WHAT CHANGED
CLINICAL IMPACT
SOURCE
```

The Scientist Agent should prioritize discovery and comparison rather than silently writing AI-authored “truth” into production knowledge.

---

# 37. SCIENTIST AGENT V2

The current Autonomous Scientist should become an evidence-surveillance and curation system.

Responsibilities:
1. detect knowledge gaps;
2. find new evidence;
3. detect new guideline versions;
4. detect supersession;
5. detect safety updates;
6. compare previous/current evidence;
7. generate review proposals;
8. populate the review queue;
9. log all operations to the scientific ledger.

It must not bypass human review for canonical knowledge publication.

---

# 38. REVIEW QUEUE CONTRACT

Every automated update should include:

```text
trigger
source(s)
old version
new version
exact changes
AI synthesis
supporting excerpts
risk flags
status=PENDING
```

Human approval is required before activation.

---

# 39. SOURCE FRESHNESS SERVICE

Create:

`backend/services/sourceFreshnessService.js`

Store:
- `retrieved_at`
- `publication_date`
- `effective_date`
- `last_checked_at`
- `is_current`
- `superseded_at`

A currentness check must never be inferred merely from publication year.

A 2026 paper is not automatically better than a 2025 official guideline.

---

# 40. CACHING

Use caching to preserve performance.

Cache:
- normalized query
- search results
- document metadata
- evidence chunks
- source freshness metadata

Never cache a response in a way that makes an outdated guideline appear current.

Cache keys must include relevant source/version parameters.

---

# 41. OBSERVABILITY

Each request should receive a `request_id`.

Log:
- request start/end
- interpretation
- retrieval rounds
- source services called
- candidate count
- selected evidence count
- retrieval failures
- sufficiency state
- provider used
- claim verification summary
- total latency

Do not log sensitive patient information unnecessarily.

Use structured logs rather than only console strings where practical.

---

# 42. ERROR TAXONOMY

Create explicit error types:

```text
QUERY_PARSE_ERROR
RETRIEVAL_TIMEOUT
SOURCE_UNAVAILABLE
RATE_LIMITED
NO_RELEVANT_EVIDENCE
INSUFFICIENT_EVIDENCE
CONFLICTING_EVIDENCE
MODEL_FAILURE
VALIDATION_FAILURE
DATABASE_FAILURE
```

Do not collapse all of them into “AI failed.”

---

# 43. TIMEOUT / RETRY POLICY

External evidence services can fail transiently.

Implement bounded retries with exponential backoff for safe retryable failures.

Recommended starting policy:
- max 2 retries for transient 5xx/network errors
- no retry for clearly invalid requests
- respect upstream rate limits
- use per-source timeouts
- do not make the entire request fail because one optional source failed

Evidence source availability must be represented in diagnostics.

---

# 44. SOURCE PARALLELISM

Run independent sources in parallel where safe.

Example:

```text
Guidelines ─┐
PubMed ─────┼→ candidate pool
EuropePMC ──┤
Trials ─────┤
FDA ────────┘
```

Then rerank centrally.

Do not invoke every source for every trivial question. The retrieval planner chooses the source budget.

---

# 45. SIMPLE QUESTION DEEP SEARCH POLICY

A simple-looking question can still require deep retrieval.

Example:

`What is the current first-line treatment for X?`

The system should classify the task as `current_guideline_recommendation`, not merely `simple_question`.

The user sees a simple answer; the backend may perform multiple evidence lookups.

Important:

**Response simplicity must not imply retrieval simplicity.**

---

# 46. UI BEHAVIOR

Do not expose internal search noise.

During retrieval, show concise states such as:

```text
Understanding the clinical question…
Checking authoritative guidelines…
Reviewing recent evidence…
Cross-checking sources…
Preparing the answer…
```

These should correspond to actual backend stages when streamed.

The final answer should remain natural.

---

# 47. EVIDENCE UI

Each answer should eventually expose:

### Evidence status
`Verified`

### Checked
`13 September 2026`

### Primary source
`Organization — Guideline — Version`

### Supporting evidence
`N sources`

Each source should be expandable to show exact excerpt/section and URL.

Do not dump raw retrieval logs into the user interface.

---

# 48. CITATION RULES

A citation is valid only when:
- the source was actually retrieved;
- the source has stable metadata;
- the URL/identifier resolves to that source;
- the cited excerpt supports the associated claim;
- version/date metadata is known where available.

No citation should be displayed merely because the model typed `[1]`.

---

# 49. MOBILE CLIENT MIGRATION

The current mobile `services/aiService.ts` has direct provider fallback paths.

Migration strategy:

### Stage A
Keep existing paths only temporarily while backend V2 is being tested.

### Stage B
Add `sourceType/evidence` response handling.

### Stage C
Switch production chat to backend-only.

### Stage D
Remove or disable direct client-side model provider usage.

### Stage E
Verify release build has no provider secrets or direct clinical model endpoints beyond intended backend URLs.

Do not remove the old path until backend V2 has parity and release testing succeeds.

---

# 50. BACKEND FILE ORGANIZATION

Use clear modules instead of adding all logic to one large route.

Recommended structure:

```text
backend/
  routes/
    chatRoutes.js
  services/
    clinicalQueryInterpreter.js
    sessionClinicalState.js
    retrievalPlanner.js
    retrievalService.js
    guidelineService.js
    pubmedService.js
    europePmcService.js
    clinicalTrialsService.js
    regulatoryService.js
    evidenceRankingService.js
    evidenceSufficiencyService.js
    claimExtractionService.js
    claimVerificationService.js
    clinicalAnswerComposer.js
    sourceFreshnessService.js
    evidenceConflictService.js
    knowledgeService.js
    scientist...
  config/
    sourceRegistry.js
  models/
    responseContracts.js
```

Do not blindly create all files at once. Introduce only what is needed per milestone.

---

# 51. CHAT ROUTE RESPONSIBILITY

`chatRoutes.js` should become an orchestrator, not a giant business-logic file.

Conceptual flow:

```js
const query = interpretQuery(...)
const state = updateSessionState(...)
const plan = createRetrievalPlan(query, state)
const evidence = await retrieveEvidence(plan)
const sufficient = assessEvidence(evidence, query, state)

if (!sufficient && canExpand(plan)) {
  const moreEvidence = await retrieveMore(...)
  ...
}

if (!sufficient) {
  return abstentionResponse(...)
}

const draft = await composeAnswer(...)
const verified = await verifyClaims(draft, evidence)
const final = buildResponseContract(...)
return res.json(final)
```

This is illustrative. Preserve existing error handling and route compatibility.

---

# 52. MODEL PROVIDER POLICY

Keep multiple providers only as model execution fallbacks.

Provider fallback is allowed for **generation availability**, not for bypassing evidence.

Correct:

```text
Evidence retrieved
→ Gemini fails
→ Groq synthesizes same evidence
```

Incorrect:

```text
Evidence retrieval fails
→ Gemini from memory
```

Generation providers must receive the same evidence context and policy contract.

---

# 53. PROMPT CONTRACT FOR THE CLINICAL COMPOSER

The system prompt should explicitly state:

1. The supplied evidence is authoritative context for this response.
2. Use only facts supported by supplied evidence for material clinical claims.
3. Never invent citations.
4. Never claim a source was checked unless it is present in the evidence payload.
5. If evidence is insufficient, say so.
6. If evidence conflicts, report the conflict.
7. Preserve patient context from structured session state.
8. Match user's language.
9. Keep answer natural and conversational.
10. Do not emit UI control markup.
11. Produce the requested structured JSON schema only.

---

# 54. DO NOT ASK THE MODEL TO “USE ITS MEDICAL KNOWLEDGE”

Do not write prompts such as:

```text
When sources are unavailable, rely on your medical knowledge.
```

Instead:

```text
When the provided evidence is insufficient, do not invent a medical fact.
Return a limitation/abstention state.
```

This rule is absolute for evidence-grounded clinical answers.

---

# 55. MEDICAL KNOWLEDGE BASE INGESTION

For curated guidelines:

1. download official document
2. preserve source URL
3. identify version/date
4. parse document structure
5. extract recommendations
6. attach population/condition/strength/certainty when explicitly available
7. create semantic + lexical index
8. mark active only after validation
9. record ingestion event

Do not flatten everything into anonymous chunks without source lineage.

---

# 56. INGESTION QUALITY GATES

Before a document becomes active:

- title exists
- organization exists
- version/date is known where possible
- source URL exists
- content is non-empty
- parsing succeeds
- chunk count > 0
- embeddings exist
- no malformed record detected
- source status is valid
- duplicate/version relation resolved

If any required gate fails, keep it outside active retrieval.

---

# 57. INGESTION RESUMABILITY

The existing project already encountered malformed/truncated LLM outputs, provider failures, and interrupted long runs.

The new ingestion pipeline must persist run state:

```text
RUN_CREATED
→ DOCUMENT_FETCHED
→ PARSED
→ CHUNKED
→ EMBEDDED
→ INDEXED
→ VALIDATED
→ PENDING_REVIEW
→ ACTIVE
```

A process restart must allow continuation from the last durable checkpoint.

Never rely on in-memory loop state for correctness.

---

# 58. KNOWLEDGE GAP LOOP

When a user asks a question that cannot be answered from current evidence:

1. record `knowledge_gap`;
2. do not fabricate an answer;
3. optionally queue it for scientist research;
4. research with sources;
5. create review proposal;
6. human review;
7. activate if approved.

This creates the desired self-improving evidence layer without allowing autonomous hallucinations to become canonical knowledge.

---

# 59. EVIDENCE GRAPH

If the existing graph infrastructure is retained, connect entities conceptually as:

```text
Condition
 ├── treated_by → Intervention
 ├── diagnosed_by → DiagnosticCriterion
 ├── recommended_in → Guideline
 ├── studied_in → Trial
 ├── reviewed_by → SystematicReview
 └── safety_signal → RegulatoryUpdate
```

Recommendations should link to the document/section that produced them.

The graph is an additional retrieval structure, not a replacement for source documents.

---

# 60. RESEARCH MODE

When the user explicitly asks for research/deep evidence:

Use a larger retrieval budget.

Return:
- question interpretation
- evidence landscape
- primary guidelines
- systematic reviews
- RCTs
- recent updates
- conflicts
- evidence gaps
- citations

Do not collapse a deep research request into a single paragraph.

---

# 61. “LATEST” SEMANTICS

If the query contains:
- latest
- current
- newest
- updated
- what changed
- recent
- today/current-year wording

the system must enable a freshness-sensitive retrieval strategy.

The response should show an evidence check date.

Do not infer currentness from model knowledge.

---

# 62. TIME WINDOW POLICY

A request such as:

`latest evidence in the last 5 years`

must result in explicit publication-date constraints, not just a query string containing the phrase “last 5 years”.

For “latest guideline”, prioritize official documents with current status.

For “recent RCTs”, prioritize trial/article publication date and trial type.

---

# 63. PUBMED IMPLEMENTATION NOTES

When integrating NCBI E-utilities:
- send `tool` identifier
- send contact email where appropriate
- use API key when configured
- rate-limit requests
- batch retrieval when possible
- cache stable metadata

NCBI documentation states that E-utilities provide a stable programmatic interface to Entrez/PubMed and describes request-rate/API-key guidance. citeturn260626search1turn260626search5

---

# 64. PERFORMANCE TARGETS

Initial targets:

### Simple clinical lookup
Prefer < 3–5 seconds backend time under normal network conditions.

### Standard clinical question
Prefer < 6–10 seconds.

### Deep/research request
Longer latency is acceptable if the UI shows meaningful progress and the final evidence quality improves.

Do not make latency the reason to bypass evidence.

Use parallel source retrieval and caching to reduce latency safely.

---

# 65. TESTING STRATEGY

The new system is medical software; testing must not be limited to “does the screen open?”

Create test categories:

## A. Unit tests
- Arabic normalization
- entity extraction
- query classification
- score calculation
- date handling
- status handling
- source ranking
- response schema validation
- citation validation
- claim support checks

## B. Integration tests
- Supabase retrieval
- pgvector search
- PubMed search
- Europe PMC
- ClinicalTrials.gov
- regulatory source adapters
- response composer

## C. Contract tests
Verify every `/api/chat` response conforms to schema.

## D. Regression tests
Existing chat cases must still render correctly.

## E. Retrieval benchmark
Build a gold set of at least 100 clinical queries, preferably 200–300 as the project grows.

---

# 66. RETRIEVAL BENCHMARK

Create a benchmark set across:
- guideline lookup
- dosing
- contraindications
- diagnosis
- emergencies
- pediatrics
- pregnancy
- renal adjustment
- drug interaction
- “latest evidence”
- RCT discovery
- conflicting guidelines
- Egyptian Arabic queries
- follow-up questions

For each query store:
- expected entities
- expected source type
- preferred source(s)
- acceptable sources
- expected evidence status
- important claims

---

# 67. METRICS

Measure:

### Retrieval Recall
Did the correct evidence enter the candidate pool?

### Citation Precision
Does each citation support the claim?

### Claim Support Coverage
What percentage of material claims are supported?

### Source Authority
How often do high-tier sources support the answer?

### Freshness Accuracy
Did current questions retrieve current evidence?

### Abstention Accuracy
Did the system abstain when evidence was inadequate?

### Conflict Detection Accuracy
Did it identify meaningful source disagreement?

### Latency
How long did retrieval/generation take?

Do not optimize only for answer similarity or “sounds good”.

---

# 68. GOLD-STANDARD ACCEPTANCE TARGETS

These are engineering targets, not claims about clinical accuracy until measured.

Before calling V2 production-ready, aim for:
- >= 95% valid response-schema rate
- >= 95% valid citation metadata rate
- >= 90% material-claim evidence linkage on benchmark questions
- >= 90% correct primary-source retrieval for guideline benchmark questions
- 0 fabricated citation placeholders in automated tests
- 0 silent evidence-to-memory fallback paths
- 100% safe abstention when required benchmark evidence is intentionally unavailable

The exact targets can be tightened after real evaluation.

---

# 69. ADVERSE TEST CASES

The agent MUST test at least these cases:

1. internet unavailable
2. PubMed unavailable
3. Europe PMC unavailable
4. Supabase unavailable
5. one source returns malformed data
6. all evidence sources return no relevant result
7. model provider unavailable
8. one model provider fails
9. contradictory guidelines
10. outdated guideline only
11. follow-up without restating condition
12. Egyptian colloquial query
13. English typo-heavy query
14. pediatric dose without weight
15. dose question with weight
16. question containing a drug brand
17. user asks for “latest” evidence
18. research query requiring multiple sources
19. evidence source retrieved but does not actually support the drafted claim
20. duplicate guideline versions

---

# 70. ANDROID / GRADLE RELEASE SAFETY

This is mandatory.

The project must still work in the development environment and in a release Android build.

## 70.1 Before modifying native/config code

Record current versions/configuration.

Do not upgrade Expo, React Native, Gradle, Kotlin, Android SDK, or native packages unless required and explicitly documented.

## 70.2 Environment separation

Verify:
- development backend URL
- production HTTPS backend URL
- no localhost backend in release config
- no LAN IP backend in release config
- no model API key embedded in app
- no development-only flags required for production chat

## 70.3 Release endpoint test

A release build must be able to reach the public HTTPS backend.

Do not depend on:
- localhost
- `192.168.x.x`
- emulator-only hostnames
- development cleartext HTTP

## 70.4 Gradle verification sequence

On Windows, from the project root, use the repository's existing Gradle wrapper where available:

```bat
cd android
gradlew.bat clean
cd ..
npm run lint
npx tsc --noEmit
npx expo-doctor
```

Then build the release artifact using the project's established Android release task/profile. Do not invent a new Gradle task without inspecting the current Android configuration.

Typical wrapper commands, only if supported by the current project:

```bat
cd android
gradlew.bat assembleRelease
```

The agent must inspect `android/build.gradle`, `android/app/build.gradle`, `gradle.properties`, `gradle/wrapper/gradle-wrapper.properties`, Expo config, and any build profile before selecting the exact release command.

## 70.5 APK functional test

After successful build:
1. install APK on a real Android device or emulator;
2. open app;
3. authenticate if applicable;
4. open Home;
5. open each existing specialty route;
6. open Chat;
7. ask an English clinical question;
8. ask an Egyptian Arabic question;
9. ask a follow-up question;
10. verify evidence panel/citations;
11. test a no-evidence case;
12. test backend unavailable behavior;
13. test app restart;
14. verify no crash on chat/history screens.

## 70.6 Release security check

Inspect the final Android bundle/APK configuration for:
- accidental provider secrets
- development URLs
- debug-only flags
- cleartext endpoint assumptions
- development logging

Never put secrets in final output.

---

# 71. BUILD REGRESSION GATE

A milestone is NOT complete until:

```text
TypeScript PASS
Lint PASS
Backend starts PASS
Database migration PASS
Retrieval integration PASS
Chat API contract PASS
Existing UI routes PASS
Android debug build PASS
Android release build PASS
APK smoke test PASS
```

If one fails, stop the milestone and fix before proceeding.

---

# 72. DATABASE MIGRATION SAFETY

Do not make destructive schema changes in the first pass.

For every SQL migration:
- use `create table if not exists` where appropriate
- add columns before code depends on them
- backfill carefully
- add indexes after correctness is confirmed
- preserve old columns temporarily when compatibility is needed
- verify RLS/security impact
- document migration order

Never delete the existing knowledge table merely to simplify implementation.

---

# 73. ROLLBACK STRATEGY

Before each major milestone:
- create a Git commit/checkpoint
- record migration IDs
- keep old endpoint behavior accessible during transition if safe

Recommended checkpoints:

```text
V1_BASELINE
V2_DB_SCHEMA
V2_RETRIEVAL
V2_EVIDENCE
V2_COMPOSER
V2_CLAIM_VERIFY
V2_CLIENT_MIGRATION
V2_RELEASE_VALIDATED
```

If a milestone breaks the Android build or chat contract, revert that milestone rather than stacking additional patches blindly.

---

# 74. IMPLEMENTATION ORDER

This exact order should be followed.

## Milestone 1 — Baseline & inventory

Tasks:
- inspect current code
- identify all AI direct-call paths
- identify all retrieval paths
- identify current DB tables
- identify current route contracts
- add/confirm logging hooks
- create benchmark skeleton

Acceptance:
- no functionality changed
- current app still builds

## Milestone 2 — Evidence/source data model

Tasks:
- add source/document/section/recommendation/chunk structures
- preserve current tables
- add migration
- seed source registry

Acceptance:
- migrations apply cleanly
- old app still runs

## Milestone 3 — Normalize existing custom knowledge

Tasks:
- migrate current `custom_knowledge` metadata into normalized evidence structures where practical
- preserve IDs/lineage
- validate active/current states

Acceptance:
- existing knowledge still searchable

## Milestone 4 — Query interpreter

Tasks:
- language detection
- Arabic/Egyptian normalization
- entity extraction
- intent classification
- session state extraction
- query expansion

Acceptance:
- benchmark normalization tests pass

## Milestone 5 — Retrieval adapters

Tasks:
- improve internal pgvector retrieval
- add lexical retrieval
- add PubMed
- normalize Europe PMC
- normalize ClinicalTrials.gov
- normalize FDA
- add source registry

Acceptance:
- adapter integration tests pass

## Milestone 6 — Hybrid ranking

Tasks:
- composite scoring
- metadata filters
- candidate reranking
- evidence selection

Acceptance:
- benchmark retrieval recall improves over baseline

## Milestone 7 — Recursive retrieval + sufficiency

Tasks:
- sufficiency engine
- retrieval expansion
- bounded recursive rounds
- explicit no-evidence state

Acceptance:
- no-answer tests abstain safely

## Milestone 8 — Natural-language composer

Tasks:
- structured response contract
- dynamic response policy
- natural language sections
- conflict handling
- limitations

Acceptance:
- answers no longer require UI control tags

## Milestone 9 — Claim verification

Tasks:
- claim extraction
- claim-to-source mapping
- unsupported claim removal/qualification
- citation validation

Acceptance:
- benchmark unsupported claims are blocked

## Milestone 10 — Scientist Agent V2

Tasks:
- surveillance
- version comparison
- freshness checks
- review queue proposals
- resumability

Acceptance:
- no automatic publication

## Milestone 11 — Client migration

Tasks:
- consume new response contract
- render evidence state
- render source cards
- preserve old UI behavior
- disable direct model fallback after backend parity

Acceptance:
- development chat fully functional

## Milestone 12 — Release hardening

Tasks:
- production HTTPS config
- no secrets in mobile
- lint/typecheck
- backend checks
- Expo doctor
- Android debug build
- Android release APK
- device smoke test

Acceptance:
- release APK works end to end

---

# 75. WHAT THE AGENT MUST NOT DO DURING THIS PROJECT

Never:

```text
- replace evidence retrieval with a stronger model
- lower evidence rules just to make answers appear
- add fake citations
- call generic LLM knowledge “verified”
- silently use old guidelines for a “latest” query
- treat a trial registry record as a treatment recommendation
- use a review abstract as if it were a guideline recommendation
- discard source version metadata
- auto-publish scientist output
- expose provider secrets to mobile
- remove existing UI routes without reason
- alter native build versions casually
- claim the APK works without actually building/testing it
```

---

# 76. AGENT WORKING STYLE

At the start of every milestone, write a concise internal checklist:

```text
Files to inspect
Files allowed to change
DB objects affected
API contract affected
Tests required
Build check required
```

After implementation:

```text
Changed files
Why each changed
Tests run
Results
Known limitations
```

Do not claim success without actual verification.

---

# 77. FIRST TASK FOR THE AGENT

Do NOT start by rewriting `chatRoutes.js`.

First create:

```text
.planning/evidence-engine-v2/
  00-baseline.md
  01-source-registry.md
  02-data-model.md
  03-query-interpreter.md
  04-retrieval.md
  05-ranking.md
  06-sufficiency.md
  07-composer.md
  08-claim-verification.md
  09-scientist.md
  10-client-migration.md
  11-release-checklist.md
```

These implementation notes are for the agent's own consistency and are not a substitute for this master blueprint.

Then implement Milestone 1 only.

---

# 78. FIRST CODE CHANGE RESTRICTION

The first code milestone must NOT change user-visible answer behavior.

Its purpose is to:
- inventory paths
- establish contracts
- introduce logging/test scaffolding
- prepare migrations safely

This prevents the agent from simultaneously changing architecture and debugging UI regressions.

---

# 79. DEFINITION OF DONE

Med Arena V2 is considered complete only when the following statement is true in actual tests:

> For a clinical question, Med Arena can understand Arabic/Egyptian/English phrasing, perform targeted and potentially multi-round retrieval across authoritative/internal evidence sources, rank and compare that evidence, determine whether the evidence is sufficient/current, generate a natural-language answer from the retrieved evidence, attach valid claim-level citations, explicitly surface conflicts/limitations, abstain when evidence is inadequate, and continue to work correctly in a production Android release APK.

The phrase “AI answered the question” is not the success criterion.

The success criterion is:

> **The system retrieved the right evidence, proved the answer was grounded in it, and then communicated it naturally.**

---

# 80. REFERENCE SOURCES FOR IMPLEMENTATION

Use authoritative API/source documentation for integrations rather than undocumented scraping behavior.

NCBI E-utilities provide the official programmatic interface to Entrez/PubMed and current documentation covers request parameters, API keys, batching, and usage guidance. citeturn260626search1turn260626search5

WHO maintains an official guideline repository and describes its guideline quality-assurance process. citeturn260626search0turn260626search3

The repository's own current implementation should remain the source of truth for existing local file paths, framework versions, route names, database compatibility, and mobile build configuration. Do not infer those details from this document when the repository can be inspected directly.

---

# FINAL AGENT INSTRUCTION

**Implement this blueprint as a controlled migration, not as a creative rewrite.**

When there is ambiguity:
1. inspect the current repository;
2. preserve existing behavior;
3. choose the smallest implementation consistent with this document;
4. write a test;
5. run the test;
6. continue only after passing.

When an evidence source is unavailable:

```text
search another appropriate source
→ retry within budget
→ report limitation
```

Never:

```text
source unavailable
→ hallucinate
```

When a coding decision conflicts with this blueprint, stop and treat this blueprint as the higher-level product/architecture contract.

When a build error appears, fix the actual compatibility issue rather than changing the architecture to avoid the error.

When an Android release build fails, do not declare the feature complete until the release build is rebuilt successfully and smoke-tested.

**End state: Evidence Engine V2 + Natural Clinical Composer + Verified Citations + Safe Abstention + Release-validated Android APK.**

# APPENDIX V2.1-A — RELIABILITY LAYER IMPLEMENTATION

## A.1 Reliability state machine

Implement this explicitly:

```text
REQUEST_RECEIVED
      ↓
REQUEST_NORMALIZED
      ↓
FAST_RETRIEVAL
   ├── sufficient → EVIDENCE_READY
   └── insufficient → DEEP_RETRIEVAL
                         ├── sufficient → EVIDENCE_READY
                         └── insufficient → RECOVERY_SEARCH
                                              ├── sufficient → EVIDENCE_READY
                                              └── insufficient → ABSTAIN
```

Source infrastructure failures never directly equal `ABSTAIN`.

## A.2 Source-health contract

Every adapter returns data plus health metadata. Recommended TypeScript shape:

```ts
type SourceHealth = {
  sourceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  errorType?: string;
  statusCode?: number;
  checkedAt: string;
};
```

## A.3 Per-source timeout starting targets

These are engineering starting targets, not clinical guarantees:

```text
Local cache: 100–300 ms target
Internal retrieval: 300–1000 ms target
PubMed/NCBI: 2–5 s per attempt
Europe PMC: 2–5 s per attempt
ClinicalTrials.gov: 3–6 s per attempt
Regulatory source: 2–5 s per attempt
Model generation: provider-specific bounded timeout
```

Tune using observed latency distributions. Do not solve latency problems by making all requests wait indefinitely.

## A.4 Fast and deep lanes

### Fast lane

1. Parse and normalize query.
2. Resolve session context.
3. Check verified cache.
4. Search internal RAG.
5. Search the highest-priority source family for the intent.
6. Evaluate sufficiency.

### Deep lane

Trigger when the fast lane is insufficient or the intent requires it, including:

- latest/current/update questions;
- complex management;
- dosing/safety;
- pregnancy/pediatrics;
- contradictory evidence;
- research requests;
- low first-pass relevance;
- explicit “deep search” requests.

## A.5 Recovery order

```text
1. use suitable verified cache
2. retry failed source within budget
3. use alternate endpoint/source family
4. broaden/reformulate search
5. continue with successful sources
6. evaluate evidence sufficiency
7. abstain only if evidence remains insufficient
```

## A.6 Circuit breaker

Implement per-source `CLOSED → OPEN → HALF_OPEN` state. Repeated 429/5xx/timeouts must temporarily stop wasting request time against the unhealthy source while other sources continue.

## A.7 Partial evidence

If 3 sources succeed and 2 fail, preserve the 3. Return `PARTIAL` only when the surviving evidence cannot fully satisfy the question. Do not convert partial retrieval into a total failure.

# APPENDIX V2.1-B — RELEASE CONNECTIVITY AND APK HARDENING

## B.1 Reproduce the failure before fixing it

Use a representative mixed-language clinical test such as:

```text
“دلوقتي لو عايز نعطي فيتامينات لمريض adult كان الفترة الماضية يعاني من jaundice بسبب acute cholangitis والتعب والضعف مستمرين...”
```

The test validates pipeline behavior, not a hard-coded medical answer.

## B.2 Release connectivity contract

Before release build verify:

```text
EXPO_PUBLIC_BACKEND_URL points to public HTTPS backend
physical Android device can reach backend
/health succeeds
/api/system/status succeeds
TLS valid
no localhost/LAN dependency
no provider API key bundled in APK
```

## B.3 `/api/system/status`

Implement a non-secret diagnostics endpoint. Example:

```json
{
  "backend": true,
  "database": true,
  "embedding": true,
  "internalRag": true,
  "pubmed": true,
  "europePmc": true,
  "clinicalTrials": true,
  "regulatory": true,
  "aiProvider": true
}
```

Never expose API keys, environment variables, authorization headers, or secrets.

## B.4 APK acceptance gate

The actual repository-compatible sequence must be used. Minimum verification:

```text
expo doctor / repository-equivalent
typecheck/lint
backend tests
retrieval integration tests
production environment check
clean release build as appropriate
Gradle release task / Expo release task
APK exists
APK installs
APK launches
clinical query reaches backend
evidence status renders
citation opens
follow-up query works
history persists
background/resume does not crash
```

The agent must report the actual APK path and actual test result.

## B.5 No false build claims

If the release APK was not built and exercised, the agent must not claim that it “works in release”.

# APPENDIX V2.1-C — BILINGUAL / MIXED-LANGUAGE INTELLIGENCE

## C.1 Normalization pipeline

```text
raw user text
 ↓
language detection
 ↓
Arabic/script normalization
 ↓
Egyptian colloquial normalization
 ↓
medical entity extraction
 ↓
brand/generic normalization
 ↓
abbreviation expansion
 ↓
context resolution
 ↓
canonical ClinicalQuery
```

## C.2 Current Egyptian dictionary remains a fallback, not the main intelligence

Preserve existing mappings such as:

```text
سخونية → fever
حرارة → fever
ترجيع → vomiting
نهجان → dyspnea
كرشة نفس → shortness of breath / dyspnea
مغص → abdominal pain / colic
كتافلام → diclofenac potassium
فولتارين → diclofenac
أوجمنتين → amoxicillin/clavulanate
فلاجيل / امريزول → metronidazole
انتينال → nifuroxazide
بنادول / باراسيتامول / سيتال → paracetamol/acetaminophen
```

The dictionary is only a safety net. Ambiguous terms must retain ambiguity until context or evidence resolves them.

## C.3 Example mixed-language interpretation

Input:

```text
“المريض adult وعنده صفرا بسبب acute cholangitis وعايز أعرف موضوع vitamins”
```

Expected internal representation:

```text
population = adult
condition = acute cholangitis / ascending cholangitis when context supports it
clinical_context = jaundice
question_focus = vitamin supplementation
uncertainties = exact vitamin; deficiency status; relevant cholestatic/nutritional context
```

Do not invent missing patient data.

## C.4 Follow-up context

Input:

```text
“طب بالنسبة للجرعة في الطفل ده؟”
```

Resolve “الطفل ده” from the structured session state. Do not search that sentence literally.

## C.5 Mixed medical English

Input:

```text
“what about metronidazole لو renal function ضعيف؟”
```

Expected:

```text
drug = metronidazole
context = renal impairment
intent = dosing/safety/adjustment
```

# APPENDIX V2.1-D — QUERY INTERPRETER AND SEARCH PLANNER

## D.1 Replace keyword-only planning

Keep `extractEnglishKeywords()` only as a compatibility or emergency fallback. The main flow must call a richer interpreter.

Recommended modules:

```text
clinicalQueryInterpreter.js
searchPlanner.js
```

## D.2 ClinicalQuery contract

```ts
type ClinicalQuery = {
  originalText: string;
  language: 'ar-eg' | 'ar' | 'en' | 'mixed' | 'unknown';
  intent: string;
  entities: ClinicalEntity[];
  patientContext?: PatientContext;
  activeTopic?: string;
  focus: string;
  uncertainties: string[];
  canonicalTerms: string[];
  expandedSearchTerms: string[];
};
```

## D.3 Search plan contract

```ts
type SearchTask = {
  sourceFamily: string;
  query: string;
  priority: number;
  purpose: 'guideline' | 'literature' | 'drug' | 'safety' | 'latest' | 'context';
};

type SearchPlan = {
  tasks: SearchTask[];
  maxRounds: number;
  deep: boolean;
};
```

## D.4 Query expansion example

For:

```text
“ينفع كتافلام لمريض عنده قرحة؟”
```

Generate bounded searches such as:

```text
diclofenac peptic ulcer contraindication guideline
NSAID peptic ulcer gastrointestinal bleeding risk
diclofenac prescribing information ulcer warning
NSAID gastroprotection guideline
```

## D.5 Preserve numeric clinical facts

Age, weight, creatinine, eGFR, potassium, INR, gestational age, and similar values must stay in structured context even if not copied into every textual search.

# APPENDIX V2.1-E — HYBRID RETRIEVAL AND RERANKING

## E.1 Candidate generation

Run in parallel where appropriate:

```text
vector retrieval
lexical/BM25 retrieval
exact entity match
metadata-filtered retrieval
recommendation lookup
source-priority lookup
```

## E.2 Candidate pool

Initial targets:

```text
simple factual: 5–15
standard clinical: 10–30
complex case: 20–50
research/deep: 30–100 discovery candidates
```

These are candidates for reranking, not automatic LLM context.

## E.3 Example ranking formula

Start with a documented, tunable formula:

```text
finalScore =
  0.35 * relevance
+ 0.20 * authority
+ 0.15 * clinicalContextMatch
+ 0.10 * freshness
+ 0.10 * evidenceType
+ 0.10 * sourceCompleteness
```

Tune from benchmark data and allow intent-specific weighting.

## E.4 Fix current year-first ordering

Do not use publication year as the primary sort before clinical relevance. “Newest” and “most relevant” are different dimensions.

## E.5 Retrieval record

Every candidate should expose enough metadata for ranking and citation:

```text
sourceId
documentId
sectionId
recommendationId
sourceType
organization
title
version
publicationDate
updatedDate
effectiveDate
isCurrent
isSuperseded
vectorScore
lexicalScore
rerankScore
finalScore
excerpt
sourceUrl
```

# APPENDIX V2.1-F — GUIDELINE-AWARE INGESTION

## F.1 Preserve hierarchy

Do not flatten a guideline into unrelated text paragraphs. Preserve:

```text
Guideline
 └── Chapter
      └── Section
           └── Recommendation
                ├── population
                ├── intervention
                ├── comparator
                ├── strength/class
                ├── certainty/level
                ├── exceptions
                └── supporting evidence
```

## F.2 Recommendation units

A guideline recommendation should become a first-class retrieval unit when possible.

## F.3 Chunking rule

Never split a recommendation away from a condition, population, exception, strength, or qualifier that changes its clinical meaning.

# APPENDIX V2.1-G — SOURCE FAMILIES

## G.1 Core source adapters

Implement independently where possible:

```text
NCBI PubMed/Entrez
Europe PMC
ClinicalTrials.gov
FDA/openFDA
EMA
MHRA
WHO
Specialty guideline sources
Internal verified knowledge store
```

The source registry must define adapter type, official endpoint/page, source tier, freshness policy, rate limit policy, and last successful sync.

## G.2 Specialty source families

Candidate official sources include, as applicable:

```text
ACG / AGA / ECCO / ESGE / EASL / AASLD
ESC / AHA / ACC
IDSA
KDIGO
ADA
GOLD / GINA
AAP
ACOG / RCOG
EAU
ESMO / ASCO
NICE
WHO
CDC
```

Do not treat this as a requirement to scrape every website in one milestone. Add adapters incrementally behind a stable interface.

## G.3 Tier semantics

```text
Tier 1 = official guideline / regulator
Tier 2 = systematic review / meta-analysis / RCT
Tier 3 = high-quality review / consensus
Tier 4 = discovery / educational / model-adjacent
```

Tier 4 may assist discovery but does not independently establish a high-risk recommendation.

# APPENDIX V2.1-H — DEEP / RECURSIVE SEARCH

## H.1 Recursive retrieval

If the first retrieval does not answer the exact question, the orchestrator creates focused follow-up searches.

Example:

```text
acute cholangitis guideline
      ↓
no explicit vitamin recommendation
      ↓
cholangitis micronutrient deficiency
      ↓
cholestasis fat-soluble vitamin deficiency
      ↓
nutritional support cholestatic disease guideline
      ↓
evidence sufficiency
```

## H.2 Retrieval budget

Each request has:

- maximum recursive rounds;
- maximum external source calls;
- maximum context/token budget;
- duplicate query detection;
- diminishing-return stop condition.

## H.3 Stop conditions

Stop when clinically material claims are supported, or when further retrieval has negligible expected value.

# APPENDIX V2.1-I — EVIDENCE SUFFICIENCY / ABSTENTION

## I.1 Claim-oriented sufficiency

Do not ask only whether documents were retrieved. Ask whether the required clinical claims are supported.

## I.2 Sufficiency dimensions

```text
authority
relevance
currentness
population match
directness
completeness
conflict status
```

## I.3 High-risk questions use stricter gates

Examples:

```text
pediatric dosing
pregnancy
renal/hepatic dose adjustment
anticoagulation
emergency treatment
contraindications
drug interactions
```

# APPENDIX V2.1-J — CLAIM VERIFICATION

## J.1 Pipeline

```text
evidence
 ↓
draft answer
 ↓
claim extraction
 ↓
claim-to-source matching
 ↓
unsupported claim detection
 ↓
revision/removal
 ↓
final answer
```

## J.2 Support classes

```text
DIRECT
SUPPORTED_INFERENCE
CONFLICTING
UNSUPPORTED
```

`UNSUPPORTED` material clinical claims must not be presented as established fact.

# APPENDIX V2.1-K — NATURAL LANGUAGE RESPONSE CONTRACT

## K.1 Separation of responsibilities

Evidence engine decides:

```text
what is supported
which source supports it
currentness
conflicts
limitations
sufficiency
```

LLM composer decides:

```text
wording
conciseness
organization
Arabic/English style
conversation continuity
explanation
```

## K.2 Response styles

```text
Simple factual → concise direct answer
Clinical management → natural recommendation + rationale + evidence
Complex case → structured clinical sections
Follow-up → conversational continuation
Conflicting evidence → explicitly compare sources
Insufficient evidence → transparent limitation
Research request → evidence synthesis
```

## K.3 Typed response contract

```json
{
  "answer": {
    "text": "Natural clinical prose",
    "style": "direct"
  },
  "sections": [],
  "evidenceStatus": "VERIFIED_RECENT",
  "claims": [],
  "sources": [],
  "conflicts": [],
  "limitations": [],
  "followUp": []
}
```

Maintain a compatibility parser only while migrating existing stored responses.

# APPENDIX V2.1-L — CLINICAL SESSION STATE

## L.1 Structured state

```ts
type ClinicalSessionState = {
  condition?: string;
  patient?: {
    age?: number;
    weightKg?: number;
    sex?: string;
    pregnancy?: { status?: boolean; gestationalAgeWeeks?: number };
    renalFunction?: { creatinine?: number; eGFR?: number };
    hepaticStatus?: string;
  };
  currentTherapies?: string[];
  recentInvestigations?: Record<string, string | number>;
  clinicalProblem?: string;
  currentQuestion?: string;
};
```

Explicit user facts must not be overwritten by model guesses.

# APPENDIX V2.1-M — DRUG / DOSE SAFETY

Prefer deterministic structured logic for:

```text
pediatric calculations
weight-based dosing
renal adjustment rules
maximum dose calculations
concentration conversions
```

The LLM explains the result but does not invent the numeric value.

# APPENDIX V2.1-N — SCIENTIST AGENT SURVEILLANCE

The Scientist Agent should prioritize:

```text
new guideline detection
guideline update detection
safety alerts
major RCT detection
systematic reviews
supersession/withdrawal detection
change reports
review queue creation
```

It should not turn raw literature into canonical clinical truth without review and provenance.

# APPENDIX V2.1-O — KNOWLEDGE GRAPH / GRAPH-RAG

Use graph relationships to improve navigation and retrieval, with provenance on each clinically meaningful edge. Example:

```text
condition
 ├── treated_by → intervention
 ├── contradicted_by → recommendation
 ├── supported_by → evidence
 ├── studied_in → trial
 ├── reviewed_in → review
 └── updated_by → guideline_version
```

Graph structure must not create unsupported clinical facts.

# APPENDIX V2.1-P — OBSERVABILITY

Every request receives an internal trace ID. Record:

```text
requestId
language
normalized entities
intent
search plan
sources attempted
sources succeeded
sources failed
source latency
candidate count
r eranked count
evidence status
claim count
supported count
unsupported count
model provider
final response type
```

The spacing typo above is illustrative; implementation field name must be `rerankedCount`.

Example developer trace:

```text
REQUEST: ar-eg-mixed
INTERPRETATION: acute cholangitis + vitamin supplementation
SEARCH: internal RAG + guidelines + PubMed + Europe PMC + regulatory
RESULTS: 4 + 3 + 7 + 5 + 2
RERANK: 21 → 8
SUFFICIENCY: sufficient
CLAIMS: 7 total / 7 supported
FINAL: VERIFIED_RECENT
```

# APPENDIX V2.1-Q — FAILURE-ORIENTED TEST MATRIX

## Q.1 Language tests

```text
Arabic
Egyptian colloquial
English
mixed Arabic-English
brand + generic
abbreviations
typo-heavy input
numeric clinical input
follow-up with omitted noun
```

## Q.2 Source failure tests

Simulate:

```text
PubMed timeout
Europe PMC 500
ClinicalTrials 429
internal RAG empty
embedding timeout
database failure
one source succeeds while all others fail
all live sources fail but verified cache exists
all live sources + cache fail
```

Expected result is recovery or transparent limitation, never silent model-memory generation.

## Q.3 Exact query classes

Test at minimum:

```text
جرعة اوجمنتين لطفل 15 كيلو
هل كتافلام ينفع مع قرحة؟
what is the current guideline for acute cholangitis?
طب لو creatinine 2.4؟
what changed in the latest guideline?
show me the evidence
```

# APPENDIX V2.1-R — BILINGUAL GOLD BENCHMARK

Build a dedicated benchmark of at least:

```text
50 mixed-language questions
50 Arabic/Egyptian questions
50 English questions
25 follow-up/context cases
25 high-risk dosing/safety cases
25 latest-evidence cases
25 retrieval-adversarial cases
```

Measure:

```text
retrieval success
source authority
answer completeness
claim support
citation precision
freshness
latency
abstention correctness
```

# APPENDIX V2.1-S — FILE RESPONSIBILITY MAP

Preferred responsibilities:

```text
backend/routes/chatRoutes.js
    thin HTTP controller

backend/services/clinicalAnswerService.js
    end-to-end orchestration

backend/services/clinicalQueryInterpreter.js
    language/entity/intent/context

backend/services/searchPlanner.js
    query expansion and source tasks

backend/services/evidenceOrchestrator.js
    fast/deep/recovery lifecycle

backend/services/retrieval/*
    source adapters + retrieval mechanisms

backend/services/evidenceRanker.js
    scoring/reranking

backend/services/evidenceSufficiencyService.js
    evidence sufficiency/conflict readiness

backend/services/claimVerificationService.js
    claim-to-source verification

backend/services/answerComposer.js
    natural-language composition

backend/services/responseValidator.js
    schema/grounding validation

backend/services/sourceHealthService.js
    health/circuit breaker

backend/services/cacheService.js
    caching

backend/services/guidelineIngestionService.js
    structure-aware ingestion
```

Exact filenames may be adapted to repo conventions, but responsibilities must remain separated.

# APPENDIX V2.1-T — SAFE MIGRATION

Do not delete existing retrieval paths until the new path passes its benchmark. Where practical:

```text
old path
  ↓
new path
  ↓
shadow comparison
  ↓
production switch
  ↓
cleanup
```

Do not expose an old weaker answer as an automatic grounding fallback merely because the new path is still under test.

# APPENDIX V2.1-U — EXACT AGENT EXECUTION PROTOCOL

For every milestone:

```text
READ
 ↓
INSPECT
 ↓
PLAN
 ↓
IMPLEMENT SMALLEST COHERENT CHANGE
 ↓
TYPECHECK/LINT
 ↓
UNIT TEST
 ↓
INTEGRATION TEST
 ↓
TARGETED CLINICAL TEST
 ↓
TRACE/LOG REVIEW
 ↓
BUILD
 ↓
RUNTIME VERIFY
 ↓
ONLY THEN CONTINUE
```

After each milestone report:

```text
files changed
files intentionally untouched
tests run
tests passed
tests failed
known limitations
build status
next milestone
```

# APPENDIX V2.1-V — FAILURE DECISION TREE

```text
Request reached backend?
 ├─ NO → fix release connectivity
 └─ YES
     ↓
Query interpreter succeeded?
 ├─ NO → deterministic normalization fallback
 └─ YES
     ↓
Any source returned?
 ├─ NO → health/cache/recovery search
 └─ YES
     ↓
Evidence sufficient?
 ├─ NO → deep/recursive search
 └─ YES
     ↓
Composer valid?
 ├─ NO → retry/alternate provider within policy
 └─ YES
     ↓
Claims verified?
 ├─ NO → revise/remove unsupported claims
 └─ YES
     ↓
UI rendered?
 ├─ NO → response contract/UI fix
 └─ YES → complete
```

# APPENDIX V2.1-W — OBSERVED FAILURE ACCEPTANCE TEST

For the representative mixed Arabic/English cholangitis/vitamin question, successful V2.1 behavior is:

```text
1. detect mixed ar-EG/en
2. resolve active patient/clinical context
3. identify question focus
4. preserve uncertainty where data are missing
5. run fast internal RAG + high-priority guideline search
6. expand search if the first evidence set is insufficient
7. tolerate one or more source failures
8. use verified cache when appropriate
9. determine evidence status
10. compose natural language from evidence
11. verify material claims
12. render evidence/citation metadata
```

The system must not collapse to an offline generic response merely because one retrieval service was unavailable.

# APPENDIX V2.1-X — FINAL ACCEPTANCE GATE

## Reliability

- [ ] no silent model-memory fallback
- [ ] no fake citations
- [ ] no global short retrieval cutoff
- [ ] source failures isolated
- [ ] retries, cache, and circuit breaker implemented

## Bilingual intelligence

- [ ] Egyptian Arabic
- [ ] mixed Arabic/English
- [ ] English
- [ ] brand/generic normalization
- [ ] context-aware follow-ups

## Retrieval

- [ ] hybrid lexical + vector
- [ ] metadata filtering
- [ ] source hierarchy
- [ ] reranking
- [ ] recursive search
- [ ] guideline-aware retrieval
- [ ] current/superseded state

## Evidence

- [ ] claim-level support
- [ ] conflict detection
- [ ] sufficiency engine
- [ ] honest abstention
- [ ] freshness visibility

## Natural language

- [ ] simple questions are concise
- [ ] complex questions are naturally structured
- [ ] follow-ups remain conversational
- [ ] internal parser markers are not user-facing

## Release

- [ ] public HTTPS backend works from Android
- [ ] `/health` works
- [ ] `/api/system/status` works
- [ ] release APK builds
- [ ] APK installs
- [ ] real clinical query works
- [ ] evidence status works
- [ ] citation works
- [ ] history/follow-up works
- [ ] no background/resume crash

# APPENDIX V2.1-Y — DO NOT CHEAT TO PASS TESTS

The agent must not “fix” failures by:

```text
loosening grounding rules
removing evidence labels
using model memory as a hidden fallback
calling cached content live/current without verification
inventing sources
increasing model size as the only change
increasing timeout indefinitely
retrying unhealthy providers forever
removing validation
changing UI labels to hide a backend failure
```

# APPENDIX V2.1-Z — REQUIRED IMPLEMENTATION PRIORITY

```text
P0-1 release/backend connectivity + source health
P0-2 reliability state machine + retry/cache/circuit breaker
P0-3 bilingual/mixed-language query interpreter
P0-4 search planner + query expansion
P0-5 hybrid retrieval + reranking
P0-6 evidence sufficiency + recursive retrieval
P0-7 claim verification + conflict handling
P1-1 natural-language response contract migration
P1-2 guideline-aware ingestion/versioning
P1-3 Scientist surveillance
P1-4 evidence graph
P1-5 clinical-case / comparator / what-changed UX
P2-1 optimization and broader source coverage
```

# V2.1 FINAL AGENT DIRECTIVE

You are implementing a clinical evidence system, not a generic chatbot.

When there is a choice between:

```text
fast but unsupported
```

and:

```text
slightly slower but traceably supported
```

choose the supported path while using parallelism, caching, source-specific timeouts, adaptive retrieval, and bounded retries to keep the experience practical.

When a source fails, recover.
When the question is short, do not assume retrieval is simple.
When the user writes Arabic, Egyptian Arabic, English, or a mixture, understand the clinical meaning rather than the literal string.
When evidence is sufficient and current, answer naturally.
When evidence conflicts, show the conflict.
When evidence is insufficient, say so.
When the release APK fails, diagnose the actual release/configuration problem and rebuild; do not claim success without verification.

**The Med Arena contract is: evidence before assertion, natural language after verification.**
