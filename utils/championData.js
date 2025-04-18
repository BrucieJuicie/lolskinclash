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
  for (const tags of Object.values(ROLE_MAP)) {
    const pool = championStats.filter((c) => c.roles.some((r) => tags.includes(r)));
    const shuffled = pool.sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, 5));
  }
  return selected.sort(() => 0.5 - Math.random());
}
