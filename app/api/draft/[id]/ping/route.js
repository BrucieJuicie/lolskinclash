import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// POST /api/draft/[id]/ping
export async function POST(req, { params }) {
  const { id } = await params; // ✅ Await params and destructure

  if (!id) {
    return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "app", "data", `draft-${id}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  const draft = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { userId } = await req.json();

  const now = Date.now();
  if (draft.players?.A?.id === userId) {
    draft.players.A.lastSeen = now;
  } else if (draft.players?.B?.id === userId) {
    draft.players.B.lastSeen = now;
  } else {
    return NextResponse.json({ error: "User not part of this draft." }, { status: 403 });
  }

  fs.writeFileSync(filePath, JSON.stringify(draft, null, 2));
  return NextResponse.json({ success: true });
}