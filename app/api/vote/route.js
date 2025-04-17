import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { evaluateAchievements } from "@/utils/evaluateAchievements";

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

    // --- ELO Rating Logic ---
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

    // --- User Vote + Achievement Tracking ---
    const session = await getServerSession(authOptions);

    if (session?.user) {
      const user = await User.findById(session.user.id);

      if (user) {
        user.votesCast += 1;
        user.mostVotedForSkin = winner.name;
        user.mostVotedAgainstSkin = loser.name;

        const now = new Date();

        // Add current vote timestamp
        user.voteTimestamps.push(now);

        // Track voted champions (both win/lose)
        if (!user.votedChampions.includes(winner.champion)) {
          user.votedChampions.push(winner.champion);
        }
        if (!user.votedChampions.includes(loser.champion)) {
          user.votedChampions.push(loser.champion);
        }

        // Track voted skins (championName-skinNum)
        const winnerKey = `${winner.champion}-${winner.skinNum}`;
        const loserKey = `${loser.champion}-${loser.skinNum}`;

        if (!user.votedSkins.includes(winnerKey)) {
          user.votedSkins.push(winnerKey);
        }
        if (!user.votedSkins.includes(loserKey)) {
          user.votedSkins.push(loserKey);
        }

        // Increment champion vote count
        user.championVoteCounts.set(
          winner.champion,
          (user.championVoteCounts.get(winner.champion) || 0) + 1
        );
        user.championVoteCounts.set(
          loser.champion,
          (user.championVoteCounts.get(loser.champion) || 0) + 1
        );

        // Update favorite champion if needed
        const mostVotedChampion = [...user.championVoteCounts.entries()]
          .sort((a, b) => b[1] - a[1])[0]?.[0];

        if (mostVotedChampion) {
          user.favoriteChampion = mostVotedChampion;
        }

        // Evaluate achievements (adds to user.achievements array)
        await evaluateAchievements(user);

        await user.save();
      }
    }

    return NextResponse.json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
