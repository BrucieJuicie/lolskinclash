// /app/api/draft/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";

export async function GET(_, { params }) {
  const { id } = params;
  await connectDB();

  const draft = await Draft.findOne({ id });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json(draft);
}

export async function PATCH(req, { params }) {
  const { id } = params;
  const { championName } = await req.json();

  await connectDB();
  const draft = await Draft.findOne({ id });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const allTaken = [...draft.bans, ...draft.teamA, ...draft.teamB].map(c => c.name);
  const available = draft.pool.find(c => c.name === championName && !allTaken.includes(c.name));

  if (!available) {
    return NextResponse.json({ error: "Champion not available" }, { status: 400 });
  }

  if (draft.phase === "ban") {
    draft.bans.push(available);
    if (draft.bans.length >= 4) draft.phase = "pick";
    draft.turn = draft.turn === "A" ? "B" : "A";
  } else {
    if (draft.turn === "A") draft.teamA.push(available);
    else draft.teamB.push(available);
    draft.turn = draft.turn === "A" ? "B" : "A";
  }

  if (draft.teamA.length + draft.teamB.length >= 10) {
    draft.phase = "done";
  }

  await draft.save();
  return NextResponse.json(draft);
}
