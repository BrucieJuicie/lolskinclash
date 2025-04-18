import championStats from "@/data/championStats.json";

const roleMappings = {
  Top: ["Fighter", "Tank"],
  Jungle: ["Assassin", "Fighter"],
  Mid: ["Mage", "Assassin"],
  ADC: ["Marksman"],
  Support: ["Support", "Mage"]
};

export function generateDraftPool() {
  const selectedMap = new Map(); // championId => champ object

  for (const [role, tags] of Object.entries(roleMappings)) {
    const filtered = championStats.filter(champ =>
      champ.roles.some(roleTag => tags.includes(roleTag))
    );

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    let count = 0;

    for (const champ of shuffled) {
      if (!selectedMap.has(champ.id)) {
        selectedMap.set(champ.id, {
          ...champ,
          possibleRoles: [role]
        });
        count++;
      } else {
        const existing = selectedMap.get(champ.id);
        if (!existing.possibleRoles.includes(role)) {
          existing.possibleRoles.push(role);
        }
      }

      if (count >= 5) break; // Only pick 5 champs per role
    }
  }

  return [...selectedMap.values()].sort(() => 0.5 - Math.random());
}
