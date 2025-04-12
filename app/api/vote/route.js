import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  const { winnerId, loserId } = await req.json();

  if (!winnerId || !loserId) {
    return NextResponse.json({ error: "Invalid vote data." }, { status: 400 });
  }

  try {
    await Skin.bulkWrite([
      {
        updateOne: {
          filter: { _id: winnerId },
          update: { $inc: { votesFor: 1, appearances: 1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: loserId },
          update: { $inc: { votesAgainst: 1, appearances: 1 } },
        },
      },
    ]);

    return NextResponse.json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
