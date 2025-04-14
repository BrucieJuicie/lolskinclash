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
    const winner = await Skin.findById(winnerId);
    const loser = await Skin.findById(loserId);

    if (!winner || !loser) {
      return NextResponse.json({ error: "Skin not found." }, { status: 404 });
    }

    // Calculate new Popularity Ratings (ELO Style)
    const K = 32;
    const winnerExpected = 1 / (1 + Math.pow(10, (loser.popularityRating - winner.popularityRating) / 400));
    const loserExpected = 1 / (1 + Math.pow(10, (winner.popularityRating - loser.popularityRating) / 400));

    winner.popularityRating += Math.round(K * (1 - winnerExpected));
    loser.popularityRating += Math.round(K * (0 - loserExpected));

    winner.votesFor += 1;
    winner.appearances += 1;
    loser.votesAgainst += 1;
    loser.appearances += 1;

    await winner.save();
    await loser.save();

    // Get user session
    const session = await getServerSession(authOptions);

    if (session?.user) {
      const user = await User.findById(session.user.id);

      if (user) {
        user.votesCast += 1;
        user.mostVotedForSkin = winner.name;
        user.mostVotedAgainstSkin = loser.name;
        await user.save();
      }
    }

    return NextResponse.json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
