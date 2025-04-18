// /app/api/draft/[id]/simulate/route.js
import fs from "fs/promises"; // ✅ Use async fs for better performance
import path from "path";
import { NextResponse } from "next/server";

import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";

const ROLE_MAP = {
  Top: ["Fighter", "Tank"],
  Jungle: ["Assassin", "Fighter"],
  Mid: ["Mage", "Assassin"],
  ADC: ["Marksman"],
  Support: ["Support", "Mage"],
};

function getTeamRoles(team) {
  const assigned = { Top: false, Jungle: false, Mid: false, ADC: false, Support: false };
  for (const champ of team) {
    for (const [role, tags] of Object.entries(ROLE_MAP)) {
      if (!assigned[role] && champ.roles.some((r) => tags.includes(r))) {
        assigned[role] = true;
        break;
      }
    }
  }
  return assigned;
}

function computeStatTotals(team) {
  return team.reduce(
    (acc, champ) => {
      acc.offense += champ.stats.offense;
      acc.durability += champ.stats.durability;
      acc.mobility += champ.stats.mobility;
      acc.difficulty += champ.stats.difficulty;
      return acc;
    },
    { offense: 0, durability: 0, mobility: 0, difficulty: 0 }
  );
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function narratePlay(team, name, time, winA, winB) {
  const champ = team[Math.floor(Math.random() * team.length)];
  const ability = champ.ultimate || champ.abilities?.[Math.floor(Math.random() * champ.abilities.length)] || "a powerful strike";
  const templates = [
    "{champ} uses {ability} under tower!",
    "{champ} casts {ability} from the river brush!",
    "{champ} opens with {ability} during a full team engage!",
    "{champ} fires off {ability} to catch the retreat!",
    "{champ} dives in with {ability}!",
    "{champ} counters with {ability} just in time!",
    "{champ} lands a perfect {ability}!",
    "{champ} whiffs {ability} into thin air!",
    "{champ} unleashes {ability} onto 3 enemies!",
    "{champ} zones the enemy team with {ability}!",
  ];
  const line = templates[Math.floor(Math.random() * templates.length)]
    .replace("{champ}", `${champ.name} (${name})`)
    .replace("{ability}", `**${ability}**`);

  return `⏱ [${formatTime(time)}] ${line} 🟡 Win Chance: ${name} ${winA}% vs Opponent ${winB}%`;
}

export async function POST(_, { params }) {
  const { id } = await params; // ✅ Await params and destructure

  const filePath = path.join(process.cwd(), "app", "data", `draft-${id}.json`);
  let draft;
  try {
    draft = JSON.parse(await fs.readFile(filePath, "utf-8")); // ✅ Async file read
  } catch (err) {
    console.error("Error reading draft file:", err);
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  if (draft.phase !== "done") {
    return NextResponse.json({ error: "Draft not complete" }, { status: 400 });
  }
  if (draft.result) {
    return NextResponse.json(draft); // Already simulated
  }

  const log = [];
  const aRoles = getTeamRoles(draft.teamA);
  const bRoles = getTeamRoles(draft.teamB);

  const aStats = computeStatTotals(draft.teamA);
  const bStats = computeStatTotals(draft.teamB);

  let aScore = aStats.offense + aStats.durability + Math.floor(aStats.mobility / 5);
  let bScore = bStats.offense + bStats.durability + Math.floor(bStats.mobility / 5);

  for (const [role, filled] of Object.entries(aRoles)) aScore += filled ? 2 : -2;
  for (const [role, filled] of Object.entries(bRoles)) bScore += filled ? 2 : -2;

  const aName = draft.players["A"]?.name || "Team A";
  const bName = draft.players["B"]?.name || "Team B";

  log.push("🧠 Role Strategy Bonuses:");
  for (const [role, filled] of Object.entries(aRoles)) log.push(`${aName} ${filled ? `✅ has` : `❌ missing`} ${role}`);
  for (const [role, filled] of Object.entries(bRoles)) log.push(`${bName} ${filled ? `✅ has` : `❌ missing`} ${role}`);

  log.push("📊 Stat Summary:");
  log.push(`${aName} — Offense: ${aStats.offense}, Durability: ${aStats.durability}, Mobility: ${aStats.mobility}`);
  log.push(`${bName} — Offense: ${bStats.offense}, Durability: ${bStats.durability}, Mobility: ${bStats.mobility}`);

  log.push("⚔️ The battle begins!");

  let time = 60;
  let winA = 50;
  let winB = 50;

  for (let i = 0; i < 5; i++) {
    const teamTurn = Math.random() < 0.5 ? "A" : "B";
    const team = teamTurn === "A" ? draft.teamA : draft.teamB;
    const name = teamTurn === "A" ? aName : bName;

    const swing = Math.floor(Math.random() * 6) + 3;
    if (teamTurn === "A") {
      winA = Math.min(100, winA + swing);
      winB = 100 - winA;
    } else {
      winB = Math.min(100, winB + swing);
      winA = 100 - winB;
    }

    log.push(narratePlay(team, name, time, winA, winB));
    time += Math.floor(Math.random() * 40) + 20;
  }

  const total = aScore + bScore;
  const winnerTeam = Math.random() < aScore / total ? "A" : "B";
  const winnerName = draft.players[winnerTeam]?.name || `Team ${winnerTeam}`;

  log.push(`🏆 ${winnerName} is victorious!`);

  draft.result = {
    winner: winnerTeam,
    log,
  };

  draft.status = "complete";

  try {
    await fs.writeFile(filePath, JSON.stringify(draft, null, 2)); // ✅ Async file write
  } catch (err) {
    console.error("Error writing draft file:", err);
    return NextResponse.json({ error: "Failed to save simulation result" }, { status: 500 });
  }

  try {
    await connectDB();
    const winId = draft.players[winnerTeam]?.id;
    const loseTeam = winnerTeam === "A" ? "B" : "A";
    const loseId = draft.players[loseTeam]?.id;

    if (winId) await User.findByIdAndUpdate(winId, { $inc: { wins: 1, matchesPlayed: 1 } });
    if (loseId) await User.findByIdAndUpdate(loseId, { $inc: { losses: 1, matchesPlayed: 1 } });
  } catch (err) {
    console.error("Failed to record match result:", err);
    // Not returning an error here to avoid failing the response
  }

  return NextResponse.json(draft);
}