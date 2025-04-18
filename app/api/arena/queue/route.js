// /app/api/arena/queue/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { connectDB } from "@/utils/mongodb";
import { QueueEntry } from "@/models/QueueEntry";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const championPath = path.join(process.cwd(), "app", "data", "championStats.json");
const championData = JSON.parse(fs.readFileSync(championPath, "utf-8"));
const dataDir = path.join(process.cwd(), "app", "data");

function generateDraftPool() {
  const ROLE_MAP = {
    Top: ["Fighter", "Tank"],
    Jungle: ["Assassin", "Fighter"],
    Mid: ["Mage", "Assassin"],
    ADC: ["Marksman"],
    Support: ["Support", "Mage"],
  };

  const selected = [];
  for (const tags of Object.values(ROLE_MAP)) {
    const pool = championData.filter((c) => c.roles.some((r) => tags.includes(r)));
    const shuffled = pool.sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, 5));
  }

  return selected.sort(() => 0.5 - Math.random());
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const userId = session.user.id;
  const username =
    session.user.username || session.user.name || session.user.email?.split("@")[0] || "Unknown";

  const files = fs.readdirSync(dataDir);

  // 🔥 Clean up completed drafts for this user
  for (const file of files) {
    if (!file.startsWith("draft-") || !file.endsWith(".json")) continue;

    const filePath = path.join(dataDir, file);
    try {
      const draft = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const isInDraft = draft?.players?.A?.id === userId || draft?.players?.B?.id === userId;
      const isComplete = draft?.status === "complete" || draft?.phase === "done" || draft?.result;
      if (isInDraft && isComplete) {
        fs.unlinkSync(filePath);
      }
    } catch {}
  }

  // Check if in active draft
  const activeDraftFile = files.find((file) => {
    if (!file.startsWith("draft-") || !file.endsWith(".json")) return false;

    const filePath = path.join(dataDir, file);
    try {
      const draft = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const isInDraft = draft?.players?.A?.id === userId || draft?.players?.B?.id === userId;
      const isComplete = draft?.status === "complete" || draft?.phase === "done" || draft?.result;
      const isValid = draft?.players?.A?.id && draft?.players?.B?.id && Array.isArray(draft.pool);
      return isInDraft && !isComplete && isValid;
    } catch {
      return false;
    }
  });

  if (activeDraftFile) {
    const draftId = activeDraftFile.replace("draft-", "").replace(".json", "");
    return NextResponse.json({ redirect: `/draft?id=${draftId}` });
  }

  // 🧹 Clean up stale queue entries (older than 2 mins)
  const now = Date.now();
  const MAX_IDLE_TIME = 1000 * 60 * 2;
  await QueueEntry.deleteMany({ timestamp: { $lt: now - MAX_IDLE_TIME } });

  // Check if already in queue
  const existing = await QueueEntry.findOne({ userId });
  if (existing) {
    return NextResponse.json({ message: "Already in queue" });
  }

  const opponent = await QueueEntry.findOneAndDelete({ userId: { $ne: userId } });

  if (opponent) {
    const draftId = uuidv4();
    const draftFile = path.join(dataDir, `draft-${draftId}.json`);

    const draft = {
      id: draftId,
      players: {
        A: { id: opponent.userId, name: opponent.username },
        B: { id: userId, name: username },
      },
      pool: generateDraftPool(),
      bans: [],
      teamA: [],
      teamB: [],
      phase: "ban",
      turn: "A",
      result: null,
      status: "active",
    };

    fs.writeFileSync(draftFile, JSON.stringify(draft, null, 2));
    return NextResponse.json({ redirect: `/draft?id=${draftId}` });
  }

  // Otherwise, add to queue
  await QueueEntry.create({ userId, username, timestamp: now });
  return NextResponse.json({ message: "Queued. Waiting for opponent..." });
}