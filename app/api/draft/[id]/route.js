// /app/api/draft/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";

export async function PATCH(req, { params }) {
  const { id } = params;
  const { championName } = await req.json();

  await connectDB();

  const draft = await Draft.findOne({ id });
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const taken = [
    ...draft.bans.map((c) => c.name),
    ...draft.teamA.map((c) => c.name),
    ...draft.teamB.map((c) => c.name),
  ];

  const pick = draft.pool.find((c) => c.name === championName);
  if (!pick || taken.includes(championName)) {
    return NextResponse.json({ error: "Invalid champion pick" }, { status: 400 });
  }

  if (draft.phase === "ban") {
    draft.bans.push(pick);
    if (draft.bans.length >= 4) {
      draft.phase = "pick";
    }
  } else {
    const team = draft.turn === "A" ? draft.teamA : draft.teamB;
    team.push(pick);
    if (draft.teamA.length + draft.teamB.length >= 10) {
      draft.phase = "done";
    } else {
      draft.turn = draft.turn === "A" ? "B" : "A";
    }
  }

  await draft.save();
  return NextResponse.json(draft);
}
