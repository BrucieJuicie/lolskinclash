// /app/api/draft/[id]/message/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";

export async function GET(_, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
  }

  await connectDB();

  const draft = await Draft.findOne({ id });
  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  return NextResponse.json({ message: draft.message || null });
}

export async function POST(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
  }

  const { type, text } = await req.json();
  if (!type || !text) {
    return NextResponse.json({ error: "Missing message content." }, { status: 400 });
  }

  await connectDB();

  const draft = await Draft.findOne({ id });
  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  draft.message = { type, text };
  await draft.save();

  return NextResponse.json({ success: true });
}
