// /app/api/draft/create/route.js
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";
import { generateDraftPool } from "@/utils/championData";

export async function POST() {
  await connectDB();

  const draftId = uuidv4();
  const pool = generateDraftPool();

  const draft = await Draft.create({
    id: draftId,
    players: {
      A: { id: null, name: null },
      B: { id: null, name: null },
    },
    pool,
    bans: [],
    teamA: [],
    teamB: [],
    phase: "ban",
    turn: "A",
    result: null,
    status: "active",
  });

  return NextResponse.json({ draftId: draft.id });
}
