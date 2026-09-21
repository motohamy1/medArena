// Keep the public backend available in locally generated Gradle release builds
// where process.env.EXPO_PUBLIC_* may not be injected from .env.
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'https://medarena-33zm.onrender.com';

// Spec V2.1 §V2.1.6 / §49 Stage D: provider keys stay backend-only. The
// client never calls Gemini/Groq (or any model provider) directly.

// A dev-machine backend (localhost/LAN IP over cleartext http) is unreachable
// from a release build: mobile data can't route 192.168.x.x and Android blocks
// cleartext in release. Trying it anyway stalls every message for ~10s, so in
// production we only attempt the backend when it's a real public HTTPS URL.
const PRIVATE_HOST =
  /localhost|127\.0\.0\.1|10\.0\.2\.2|\b192\.168\.|\b172\.(1[6-9]|2\d|3[01])\.|\[::1\]/i;
const USE_BACKEND =
  __DEV__ || (!PRIVATE_HOST.test(BACKEND_URL) && BACKEND_URL.startsWith('https://'));

export type DoctorCategory = 'physicians';

export type Citation = {
  id: string;
  title: string;
  author: string;
  journal: string;
  year: string;
  url: string;
};

export const aiService = {
  /**
   * Sends a message through the evidence-first pipeline (spec V3 §33):
   * the remote Express evidence backend is the ONLY path for clinical answers.
   *
   * Spec V3 §33: on backend failure the client MUST NOT substitute bundled
   * clinical content or generate an unverified answer from model memory. It
   * reports the failure state ("Evidence retrieval is currently unavailable")
   * and offers Retry. The offline bundled-knowledge path was removed.
   */
  async sendMessageByText(
    message: string,
    mode: 'general' | 'fast_recap' = 'general',
    category: DoctorCategory | string = 'physicians',
    topicId?: string,
    categoryContext?: string,
    history: { text: string; isUser: boolean }[] = []
  ): Promise<{
    reply: string;
    citations?: Citation[];
    suggestions?: string[];
    sourceType?: string;
    evidence?: unknown;
    claims?: unknown[];
    sources?: unknown[];
    limitations?: string[];
  }> {
    const normalizedMessage = message.replace(/\bhylobacter\b/gi, 'helicobacter');
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|سلام|اهلا|أهلا)[!.,\s]*$/i.test(message.trim());

    if (isGreeting) {
      return {
        reply: 'Hello! How can I help you with a clinical question today?',
        citations: [],
        suggestions: [],
        sourceType: 'conversation',
      };
    }

    // Spec V3 §33: never a generic clinical answer when the evidence backend
    // fails. Each failure state is distinct and honestly labeled (spec §90).
    const evidenceUnavailable = (sourceType: string, limitation: string): {
      reply: string;
      citations: Citation[];
      suggestions: string[];
      sourceType: string;
      limitations: string[];
    } => ({
      reply: 'Evidence retrieval is currently unavailable. I have not generated an unverified clinical answer from model memory. Please retry in a moment.',
      citations: [],
      suggestions: [],
      sourceType,
      limitations: [limitation],
    });

    if (!USE_BACKEND || !BACKEND_URL) {
      return evidenceUnavailable('SYSTEM_FAILURE', 'backend_not_configured');
    }

    try {
      const controller = new AbortController();
      // Backend performs multi-source evidence retrieval and may cold-start
      // (Render free tier); 10s aborted healthy requests mid-retrieval.
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const response = await fetch(`${BACKEND_URL}/api/chat/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalizedMessage, mode, category, topicId, categoryContext, history }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Spec V3 §93: validate the response shape — never assume answer exists.
      let data: any;
      try {
        data = await response.json();
      } catch {
        return evidenceUnavailable('SYSTEM_FAILURE', 'malformed_response');
      }

      if (!response.ok) {
        // Spec V3 §38: backend structured errors carry {error:{code,message,retryable}}.
        const code = String(data?.error?.code || '');
        if (code === 'QUERY_PARSE_ERROR') {
          return {
            reply: 'I could not interpret that as a clinical question. Could you rephrase it?',
            citations: [],
            suggestions: [],
            sourceType: 'CLARIFICATION_REQUIRED',
            limitations: ['query_parse_error'],
          };
        }
        return evidenceUnavailable(code === 'SOURCE_UNAVAILABLE' ? 'SOURCE_UNAVAILABLE' : 'SYSTEM_FAILURE', code ? `backend_error_${code}` : 'backend_http_error');
      }

      const status = data.evidence?.status;
      if (!data.answer?.text) {
        return evidenceUnavailable('SYSTEM_FAILURE', 'missing_answer_text');
      }
      const answer = data.answer.text;
      return {
        reply: answer,
        citations: (data.sources || []).map((source: any) => ({
          id: source.id,
          title: source.title,
          author: source.organization || '',
          journal: source.source_type || '',
          year: source.publication_date || '',
          url: source.url || (source.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/` : ''),
        })),
        suggestions: [],
        sourceType: status || 'SYSTEM_FAILURE',
        evidence: data.evidence,
        claims: data.claims,
        sources: data.sources,
        limitations: data.limitations,
      } as any;
    } catch (error: any) {
      // Spec V3 §93/§95: failures are reported honestly, never substituted
      // with clinical content. A timeout is a retrieval failure, not evidence
      // absence — it is retryable.
      const isAbort = error?.name === 'AbortError' || /abort/i.test(String(error?.message || ''));
      if (isAbort) {
        return evidenceUnavailable('RETRIEVAL_TIMEOUT', 'client_timeout');
      }
      return evidenceUnavailable('SYSTEM_FAILURE', 'backend_unreachable');
    }
  },

  /**
   * Dynamically synthesizes high-yield, verified Clinical Pearls & Tips & Tricks
   * via Groq or Gemini, with seamless fallback to the bundled Knowledge Base Miner.
   */
  async generateClinicalPearls(
    specialtyId?: string,
    count: number = 3
  ): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    return generateDynamicPearls(specialtyId, count);
  },
};

// ──────────────────────────────────────────────────────────────────────
// CLINICAL PEARLS — bundled miner only (spec V2.1 §V2.1.6): pearls were the
// last client path that called model providers directly. All generation now
// stays backend-side; the client mines its curated bundled knowledge base.
// ──────────────────────────────────────────────────────────────────────

export async function generateDynamicPearls(
  specialtyId?: string,
  count: number = 3
): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
  // Bundled miner only: pearls are derived from the curated local knowledge
  // base without any client-side model calls (spec V2.1 §V2.1.6).
  const { pearlMinerService } = await import('./pearlMinerService');
  return pearlMinerService.getMinedPearls(specialtyId, count);
}
