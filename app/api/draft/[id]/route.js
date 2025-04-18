// /app/api/draft/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";

export async function PATCH(req, { params }) {
  const { id } = params;
  const { championName } = await req.json();

  if (!id || !championName) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

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

  const champ = draft.pool.find((c) => c.name === championName);
  if (!champ || taken.includes(champ.name)) {
    return NextResponse.json({ error: "Invalid champion" }, { status: 400 });
  }

  const turn = draft.turn;

  if (draft.phase === "ban") {
    draft.bans.push(champ);
    if (draft.bans.length >= 4) {
      draft.phase = "pick";
      draft.turn = "A";
    } else {
      draft.turn = turn === "A" ? "B" : "A";
    }
  } else if (draft.phase === "pick") {
    const picksA = draft.teamA.length;
    const picksB = draft.teamB.length;

    if (turn === "A") {
      draft.teamA.push(champ);
    } else {
      draft.teamB.push(champ);
    }

    // Snake pick order logic
    const totalPicks = picksA + picksB + 1;
    const order = ["A", "B", "B", "A", "A", "B", "B", "A", "A", "B"];
    if (totalPicks < order.length) {
      draft.turn = order[totalPicks];
    }

    if (teamA.length + teamB.length === 10) {
        draft.phase = "done";
      }
  }

  await draft.save();
  return NextResponse.json(draft);
}
