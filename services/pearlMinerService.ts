import { SPECIALTY_KNOWLEDGE, TopicItem, SpecialtyData } from '../constants/SpecialtyData';
import { SURGICAL_SPECIALTY_KNOWLEDGE } from '../constants/SurgicalSpecialtiesData';
import { ClinicalPearl } from '../constants/DailyPearlsData';

let _minedPearlsCache: ClinicalPearl[] | null = null;

function extractPearlFromTopic(
  topic: TopicItem,
  spec: { id: string; name: string; scientificName?: string; color: string; icon: string },
  categoryTitle: string
): ClinicalPearl | null {
  if (!topic.clinicalContent || topic.clinicalContent.length === 0) return null;

  const sections = topic.clinicalContent;
  const findSection = (keywords: string[]) =>
    sections.find((s) => keywords.some((k) => s.title.toLowerCase().includes(k)))?.content;

  const pitfallRaw = findSection(['pitfall', 'warning', 'malpractice', 'contraindication', 'caution']);
  const actionRaw = findSection(['pharmacotherapy', 'dosing', 'management', 'algorithm', 'treatment', 'resuscitation', 'protocol']);
  const ruleRaw = findSection(['triage', 'red flag', 'criteria', 'definition', 'overview', 'pathophysiology']);
  const citationRaw = findSection(['citation', 'reference', 'guideline', 'evidence']);
  const scoringRaw = findSection(['scoring', 'criteria', 'diagnostic']);

  // Must have actionable clinical guidance
  if (!pitfallRaw && !actionRaw) return null;

  const rule = (ruleRaw || actionRaw || '').split('\n')[0].replace(/^•\s*/, '').trim();
  const action = (actionRaw || ruleRaw || '')
    .split('\n')
    .filter((l) => l.trim().length > 10)
    .slice(0, 2)
    .join(' ')
    .replace(/^•\s*/, '')
    .trim();
  const pitfall = (pitfallRaw || 'Avoid delayed initiation of protocol or missing emergency red flags.')
    .split('\n')[0]
    .replace(/^•\s*/, '')
    .trim();
  const citation = (citationRaw || 'Evidence-Based International Clinical Guidelines')
    .split('\n')[0]
    .replace(/^•\s*/, '')
    .trim();

  // Extract punchy badge from subtitle or scoring
  let badge = '';
  const searchStr = `${topic.subtitle || ''} ${scoringRaw || ''}`;
  const badgeMatch = searchStr.match(
    /(\b[A-Za-z0-9\-\/]+\s*[≥≤><=]\s*[0-9]+(?:\.[0-9]+)?(?:\s*[a-zA-Z%µ/]+)?|\bHour-[0-9]\s*Bundle|\bMAP\s*≥\s*65|\bDoor-to-[A-Za-z]+\s*<\s*[0-9]+m?|\b[0-9]+mg(?:\/[a-zA-Z]+)?|\b[0-9]+(?:-[0-9]+)?\s*g\b)/i
  );

  if (badgeMatch) {
    badge = badgeMatch[1].trim();
  } else if (topic.subtitle && topic.subtitle.length <= 26) {
    badge = topic.subtitle;
  } else {
    badge = 'Key Metric';
  }

  return {
    id: `mined_${spec.id}_${topic.id}`,
    title: topic.title,
    category: categoryTitle || topic.subtitle || 'Clinical Protocol',
    specialtyId: spec.id,
    specialtyName: spec.scientificName || spec.name,
    specialtyColor: spec.color || '#3B82F6',
    specialtyIcon: (spec.icon as string) || 'medkit',
    badge: badge.slice(0, 32),
    rule: rule.slice(0, 240),
    action: action.slice(0, 240),
    pitfall: pitfall.slice(0, 240),
    citation: citation.slice(0, 100),
  };
}

export const pearlMinerService = {
  /**
   * Mines all verified topics across internal and surgical specialties.
   */
  getAllMinedPearls(): ClinicalPearl[] {
    if (_minedPearlsCache && _minedPearlsCache.length > 0) {
      return _minedPearlsCache;
    }

    const mined: ClinicalPearl[] = [];
    const allCatalogs: Record<string, SpecialtyData>[] = [
      SPECIALTY_KNOWLEDGE,
      SURGICAL_SPECIALTY_KNOWLEDGE,
    ];

    for (const catalog of allCatalogs) {
      for (const [specId, spec] of Object.entries(catalog)) {
        if (!spec || !spec.categories) continue;
        for (const cat of spec.categories) {
          if (!cat.topics) continue;
          for (const topic of cat.topics) {
            const pearl = extractPearlFromTopic(
              topic,
              {
                id: spec.id || specId,
                name: spec.name,
                scientificName: spec.scientificName,
                color: spec.color,
                icon: spec.icon,
              },
              cat.title
            );
            if (pearl) {
              mined.push(pearl);
            }
          }
        }
      }
    }

    _minedPearlsCache = mined;
    return mined;
  },

  /**
   * Retrieves pearls filtered by specialty or randomized rotation.
   */
  getMinedPearls(specialtyId?: string, count: number = 5): ClinicalPearl[] {
    const all = this.getAllMinedPearls();
    let filtered = all;
    if (specialtyId && specialtyId !== 'all') {
      filtered = all.filter(
        (p) =>
          p.specialtyId.toLowerCase() === specialtyId.toLowerCase() ||
          p.specialtyName.toLowerCase().includes(specialtyId.toLowerCase())
      );
    }
    if (filtered.length === 0) filtered = all;

    // Randomize selection
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },
};
