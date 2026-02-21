import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { evaluateAchievements } from "@/utils/evaluateAchievements";

const K = 32;

export async function POST(req) {
  await connectDB();

  const { winnerId, loserId } = await req.json();

  if (!winnerId || !loserId) {
    return NextResponse.json({ error: "Invalid vote data." }, { status: 400 });
  }

  try {
    const [winner, loser] = await Promise.all([
      Skin.findById(winnerId, {
        _id: 1,
        name: 1,
        champion: 1,
        num: 1,
        popularityRating: 1,
      }).lean(),
      Skin.findById(loserId, {
        _id: 1,
        name: 1,
        champion: 1,
        num: 1,
        popularityRating: 1,
      }).lean(),
    ]);

    if (!winner || !loser) {
      return NextResponse.json({ error: "Skin not found." }, { status: 404 });
    }

    const winnerExpected = 1 / (1 + Math.pow(10, (loser.popularityRating - winner.popularityRating) / 400));
    const loserExpected = 1 / (1 + Math.pow(10, (winner.popularityRating - loser.popularityRating) / 400));

    const winnerRatingDelta = Math.round(K * (1 - winnerExpected));
    const loserRatingDelta = Math.round(K * (0 - loserExpected));

    await Skin.bulkWrite([
      {
        updateOne: {
          filter: { _id: winner._id },
          update: {
            $inc: {
              popularityRating: winnerRatingDelta,
              votesFor: 1,
              appearances: 1,
            },
            $set: { lastSeen: new Date() },
          },
        },
      },
      {
        updateOne: {
          filter: { _id: loser._id },
          update: {
            $inc: {
              popularityRating: loserRatingDelta,
              votesAgainst: 1,
              appearances: 1,
            },
            $set: { lastSeen: new Date() },
          },
        },
      },
    ]);

    const session = await getServerSession(authOptions);

    if (session?.user) {
      const user = await User.findById(session.user.id);

      if (user) {
        user.votesCast += 1;
        user.mostVotedForSkin = winner.name;
        user.mostVotedAgainstSkin = loser.name;

        const now = new Date();
        user.voteTimestamps.push(now);

        if (!user.votedChampions.includes(winner.champion)) {
          user.votedChampions.push(winner.champion);
        }
        if (!user.votedChampions.includes(loser.champion)) {
          user.votedChampions.push(loser.champion);
        }

        const winnerKey = `${winner.champion}-${winner.num}`;
        const loserKey = `${loser.champion}-${loser.num}`;

        if (!user.votedSkins.includes(winnerKey)) {
          user.votedSkins.push(winnerKey);
        }
        if (!user.votedSkins.includes(loserKey)) {
          user.votedSkins.push(loserKey);
        }

        user.championVoteCounts.set(winner.champion, (user.championVoteCounts.get(winner.champion) || 0) + 1);
        user.championVoteCounts.set(loser.champion, (user.championVoteCounts.get(loser.champion) || 0) + 1);

        const mostVotedChampion = [...user.championVoteCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

        if (mostVotedChampion) {
          user.favoriteChampion = mostVotedChampion;
        }

        await evaluateAchievements(user);
        await user.save();
      }
    }

    const webhookUrl = process.env.VOTE_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "vote.recorded",
          timestamp: new Date().toISOString(),
          winner: {
            id: winner._id,
            name: winner.name,
            champion: winner.champion,
          },
          loser: {
            id: loser._id,
            name: loser.name,
            champion: loser.champion,
          },
        }),
      }).catch((error) => console.error("Vote webhook failed:", error));
    }

    return NextResponse.json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
