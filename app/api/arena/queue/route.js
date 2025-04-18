// /app/api/arena/queue/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { connectDB } from "@/utils/mongodb";
import { QueueEntry } from "@/models/QueueEntry";
import { Draft } from "@/models/Draft";
import { generateDraftPool } from "@/utils/championData"; // ✅ This is all you need
import { v4 as uuidv4 } from "uuid";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const userId = session.user.id;
  const username =
    session.user.username || session.user.name || session.user.email?.split("@")[0] || "Unknown";

  // 🧹 Remove old queue entries
  const now = Date.now();
  const MAX_IDLE = 1000 * 60 * 2;
  await QueueEntry.deleteMany({ timestamp: { $lt: now - MAX_IDLE } });

  // ✅ Check for active draft
  const activeDraft = await Draft.findOne({
    $or: [{ "players.A.id": userId }, { "players.B.id": userId }],
    status: "active",
  });

  if (activeDraft) {
    return NextResponse.json({ redirect: `/draft?id=${activeDraft.id}` });
  }

  // 🚫 Already queued?
  const existing = await QueueEntry.findOne({ userId });
  if (existing) {
    return NextResponse.json({ message: "Already in queue" });
  }

  // 🆚 Try to match with opponent
  const opponent = await QueueEntry.findOneAndDelete({ userId: { $ne: userId } });
  if (opponent) {
    const draftId = uuidv4();
    const draft = await Draft.create({
      id: draftId,
      players: {
        A: { id: opponent.userId, name: opponent.username },
        B: { id: userId, name: username },
      },
      pool: generateDraftPool(), // ✅ Now pulling from /utils/championData
      bans: [],
      teamA: [],
      teamB: [],
      phase: "ban",
      turn: "A",
      result: null,
      status: "active",
    });

    return NextResponse.json({ redirect: `/draft?id=${draft.id}` });
  }

  // ➕ Add self to queue
  await QueueEntry.create({ userId, username, timestamp: now });
  return NextResponse.json({ message: "Queued. Waiting for opponent..." });
}
