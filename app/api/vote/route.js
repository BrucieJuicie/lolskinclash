import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  const { winnerId, loserId } = await req.json();

  if (!winnerId || !loserId) {
    return NextResponse.json({ error: "Invalid vote data." }, { status: 400 });
  }

  try {
    // Update Skin Votes
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

    // Get user session
    const session = await getServerSession(authOptions);

    // If logged in, update user vote stats
    if (session?.user) {
      const user = await User.findById(session.user.id);

      if (user) {
        user.votesCast += 1;

        // Optional: Get skin names for tracking
        const winnerSkin = await Skin.findById(winnerId);
        const loserSkin = await Skin.findById(loserId);

        if (winnerSkin) {
          user.mostVotedForSkin = winnerSkin.name;
        }

        if (loserSkin) {
          user.mostVotedAgainstSkin = loserSkin.name;
        }

        await user.save();
      }
    }

    return NextResponse.json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
