// /app/api/draft/[id]/ping/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";

export async function POST(req, { params }) {
  const { id } = params;
  const { userId } = await req.json();

  if (!id || !userId) {
    return NextResponse.json({ error: "Missing draft ID or user ID." }, { status: 400 });
  }

  await connectDB();

  const draft = await Draft.findOne({ id });
  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  const now = Date.now();
  if (draft.players?.A?.id === userId) {
    draft.players.A.lastSeen = now;
  } else if (draft.players?.B?.id === userId) {
    draft.players.B.lastSeen = now;
  } else {
    return NextResponse.json({ error: "User not part of this draft." }, { status: 403 });
  }

  await draft.save();
  return NextResponse.json({ success: true });
}