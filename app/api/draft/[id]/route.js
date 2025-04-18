import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GET /api/draft/[id]
export async function GET(request, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "app", "data", `draft-${id}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}

// PATCH /api/draft/[id]
export async function PATCH(request, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "app", "data", `draft-${id}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  const draft = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { championName } = await request.json();

  const taken = [...draft.bans, ...draft.teamA, ...draft.teamB].some(
    champ => champ.name === championName
  );
  if (taken) {
    return NextResponse.json({ error: "Champion already picked or banned." }, { status: 400 });
  }

  const champ = draft.pool.find(c => c.name === championName);
  if (!champ) {
    return NextResponse.json({ error: "Champion not found in pool." }, { status: 404 });
  }

  if (draft.phase === "ban") {
    draft.bans.push(champ);
    draft.turn = draft.turn === "A" ? "B" : "A";
    if (draft.bans.length === 2) {
      draft.phase = "pick";
      draft.turn = "A";
    }
  } else if (draft.phase === "pick") {
    const totalPicks = draft.teamA.length + draft.teamB.length;
    const pickOrder = ["A", "B", "B", "A", "A", "B", "B", "A", "A", "B"];
    const currentTeam = pickOrder[totalPicks];

    if (draft.turn !== currentTeam) {
      return NextResponse.json({ error: "Not your turn." }, { status: 403 });
    }

    if (draft.turn === "A") {
      draft.teamA.push(champ);
    } else {
      draft.teamB.push(champ);
    }

    if (totalPicks + 1 === 10) {
      draft.phase = "done";
      draft.turn = null;
    } else {
      draft.turn = pickOrder[totalPicks + 1];
    }
  } else {
    return NextResponse.json({ error: "Draft is already complete." }, { status: 400 });
  }

  fs.writeFileSync(filePath, JSON.stringify(draft, null, 2));
  return NextResponse.json(draft);
}
