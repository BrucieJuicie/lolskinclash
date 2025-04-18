import championStats from "@/app/data/championStats.json";

export const ROLE_MAP = {
  Top: ["Fighter", "Tank"],
  Jungle: ["Assassin", "Fighter"],
  Mid: ["Mage", "Assassin"],
  ADC: ["Marksman"],
  Support: ["Support", "Mage"]
};

export function generateDraftPool() {
  const selected = [];
  const usedIds = new Set();

  for (const tags of Object.values(ROLE_MAP)) {
    const pool = championStats.filter(
      (c) => c.roles.some((r) => tags.includes(r)) && !usedIds.has(c.id)
    );
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, 5);
    chosen.forEach((c) => usedIds.add(c.id));
    selected.push(...chosen);
  }

  return selected.sort(() => 0.5 - Math.random());
}
