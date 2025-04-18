// /app/api/arena/status/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

import { connectDB } from "@/utils/mongodb";
import { QueueEntry } from "@/models/QueueEntry";
import { Draft } from "@/models/Draft";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  await connectDB();

  // Check for any draft this user is a part of
  const draft = await Draft.findOne({
    $or: [
      { "players.A.id": userId },
      { "players.B.id": userId }
    ],
    status: "active"
  });

  if (draft) {
    return NextResponse.json({ redirect: `/draft?id=${draft.id}` });
  }

  // Check if still in queue
  const queueEntry = await QueueEntry.findOne({ id: userId });
  if (queueEntry) {
    return NextResponse.json({ message: "Still waiting..." });
  }

  return NextResponse.json({ message: "Not in queue." });
}