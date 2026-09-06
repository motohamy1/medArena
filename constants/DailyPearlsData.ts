export type ClinicalPearl = {
  id: string;
  title: string;
  category: string;
  specialtyId: string;
  specialtyName: string;
  specialtyColor: string;
  specialtyIcon: string;
  badge: string;
  rule: string;
  action: string;
  pitfall: string;
  citation: string;
};

// Pure dynamic pool — populated from Supabase & on-demand AI synthesis
export const CLINICAL_PEARLS_POOL: ClinicalPearl[] = [];

export function getDailyPearls(
  seedDateStr?: string,
  count: number = 5,
  offset: number = 0,
  pool: ClinicalPearl[] = []
): ClinicalPearl[] {
  const total = pool.length;
  if (total === 0) return [];

  const dateKey = seedDateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }

  const baseIndex = Math.abs(hash + offset * 5) % total;
  const selected: ClinicalPearl[] = [];
  const selectedIds = new Set<string>();

  for (let i = 0; i < total && selected.length < Math.min(count, total); i++) {
    const idx = (baseIndex + i * 3) % total;
    const item = pool[idx];
    if (!selectedIds.has(item.id)) {
      selectedIds.add(item.id);
      selected.push(item);
    }
  }

  return selected;
}
