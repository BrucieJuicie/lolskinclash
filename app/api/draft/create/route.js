import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const roleMappings = {
  Top: ["Fighter", "Tank"],
  Jungle: ["Assassin", "Fighter"],
  Mid: ["Mage", "Assassin"],
  ADC: ["Marksman"],
  Support: ["Support", "Mage"]
};

function generateDraftPool() {
  const selectedPool = [];

  for (const tags of Object.values(roleMappings)) {
    const filtered = championData.filter(champ =>
      champ.roles.some(role => tags.includes(role))
    );
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    selectedPool.push(...shuffled.slice(0, 5));
  }

  return selectedPool.sort(() => 0.5 - Math.random());
}

export async function POST() {
  const draftId = uuidv4();
  const pool = generateDraftPool();

  const filePath = path.join(process.cwd(), "app", "data", `draft-${draftId}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ draftId, pool, teamA: [], teamB: [], bans: [], phase: "ban", turn: "A" }, null, 2));

  return NextResponse.json({ draftId });
}
