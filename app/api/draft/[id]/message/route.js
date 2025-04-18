import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id } = await params; // ✅ Await params and destructure

  if (!id) {
    return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
  }

  const messagePath = path.join(process.cwd(), "app", "data", `message-${id}.json`); // ✅ Use id instead of draftId
  if (!fs.existsSync(messagePath)) {
    return NextResponse.json({ message: null }); // No message, just return null
  }

  try {
    const messageData = JSON.parse(fs.readFileSync(messagePath, "utf-8"));
    return NextResponse.json({ message: messageData.message });
  } catch (err) {
    return NextResponse.json({ error: "Failed to read message." }, { status: 500 });
  }
}