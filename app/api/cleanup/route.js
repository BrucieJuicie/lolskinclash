import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Draft } from "@/models/Draft";

export async function GET() {
  await connectDB();

  const now = Date.now();
  const MAX_INACTIVE_MS = 1000 * 60 * 2; // 2 minutes
  const MAX_COMPLETED_AGE = 1000 * 60 * 30; // 30 minutes

  const drafts = await Draft.find({});
  let deletedCount = 0;

  for (const draft of drafts) {
    const isComplete = draft.status === "complete";
    const createdAt = new Date(draft.createdAt).getTime();
    const age = now - createdAt;

    const aLast = draft.players?.A?.lastSeen || 0;
    const bLast = draft.players?.B?.lastSeen || 0;
    const bothAssigned = draft.players?.A?.id && draft.players?.B?.id;

    const inactiveA = now - aLast > MAX_INACTIVE_MS;
    const inactiveB = now - bLast > MAX_INACTIVE_MS;
    const bothInactive = inactiveA && inactiveB;

    const shouldDelete =
      (isComplete && age > MAX_COMPLETED_AGE) ||
      (draft.status === "active" && bothAssigned && bothInactive);

    if (shouldDelete) {
      await Draft.deleteOne({ _id: draft._id });
      deletedCount++;
    }
  }

  return NextResponse.json({ deleted: deletedCount });
}
