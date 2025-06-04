// lolskinclash\app\api\vote\route.js
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions"; // Corrected path from previous steps
import { NextResponse } from "next/server";
import { evaluateAchievements } from "@/utils/evaluateAchievements";

export async function POST(req) { // [cite: 113]
  await connectDB(); // [cite: 113]

  const { winnerId, loserId } = await req.json(); // [cite: 113]

  if (!winnerId || !loserId) { // [cite: 114]
    return NextResponse.json({ error: "Invalid vote data." }, { status: 400 }); // [cite: 114]
  }

  try { // [cite: 115]
    // Fetch winner and loser skins in parallel
    const [winner, loser] = await Promise.all([
      Skin.findById(winnerId), // [cite: 115]
      Skin.findById(loserId)  // [cite: 115]
    ]);

    if (!winner || !loser) { // [cite: 116]
      return NextResponse.json({ error: "Skin not found." }, { status: 404 }); // [cite: 116]
    }

    // --- ELO Rating Logic ---
    const K = 32; // [cite: 117]
    const winnerExpected = 1 / (1 + Math.pow(10, ( (loser.popularityRating || 1000) - (winner.popularityRating || 1000) ) / 400)); // [cite: 117]
    const loserExpected = 1 / (1 + Math.pow(10, ( (winner.popularityRating || 1000) - (loser.popularityRating || 1000) ) / 400)); // [cite: 118]

    winner.popularityRating = (winner.popularityRating || 1000) + Math.round(K * (1 - winnerExpected)); // [cite: 118]
    loser.popularityRating = (loser.popularityRating || 1000) + Math.round(K * (0 - loserExpected)); // [cite: 119]

    winner.votesFor += 1; // [cite: 119]
    winner.appearances += 1; // [cite: 119]
    loser.votesAgainst += 1; // [cite: 119]
    loser.appearances += 1; // [cite: 119]

    // Save skin changes in parallel
    await Promise.all([
        winner.save(), // [cite: 119]
        loser.save()   // [cite: 119]
    ]);

    // --- User Vote + Achievement Tracking ---
    const session = await getServerSession(authOptions); // [cite: 120]
    if (session?.user) { // [cite: 120]
      const user = await User.findById(session.user.id); // [cite: 120]
      if (user) { // [cite: 121]
        user.votesCast += 1; // [cite: 121]
        user.mostVotedForSkin = winner.name; // [cite: 121]
        user.mostVotedAgainstSkin = loser.name; // [cite: 121]

        const now = new Date(); // [cite: 121]
        user.voteTimestamps.push(now); // [cite: 122]

        // Track voted champions (both win/lose)
        if (!user.votedChampions.includes(winner.champion)) { // [cite: 122]
          user.votedChampions.push(winner.champion); // [cite: 122]
        }
        if (!user.votedChampions.includes(loser.champion)) { // [cite: 122]
          user.votedChampions.push(loser.champion); // [cite: 122]
        }

        // Track voted skins (championName-skinNum)
        const winnerKey = `${winner.champion}-${winner.num}`; // [cite: 123]
        const loserKey = `${loser.champion}-${loser.num}`; // [cite: 123]
        if (!user.votedSkins.includes(winnerKey)) { // [cite: 123]
          user.votedSkins.push(winnerKey); // [cite: 123]
        }
        if (!user.votedSkins.includes(loserKey)) { // [cite: 123]
          user.votedSkins.push(loserKey); // [cite: 123]
        }

        // Increment champion vote count
        user.championVoteCounts = user.championVoteCounts || new Map(); // Initialize if undefined
        user.championVoteCounts.set(winner.champion, (user.championVoteCounts.get(winner.champion) || 0) + 1); // [cite: 124]
        user.championVoteCounts.set(loser.champion, (user.championVoteCounts.get(loser.champion) || 0) + 1); // [cite: 124, 125]

        // Update favorite champion if needed
        if (user.championVoteCounts.size > 0) {
            const mostVotedChampionEntry = [...user.championVoteCounts.entries()].sort((a, b) => b[1] - a[1])[0]; // [cite: 125]
            if (mostVotedChampionEntry) { // [cite: 125]
                 user.favoriteChampion = mostVotedChampionEntry[0]; // [cite: 125]
            }
        }
        
        await evaluateAchievements(user); // This function will modify 'user' but not save it. [cite: 126]
        await user.save(); // Single save for all user modifications. [cite: 126]
      }
    }

    return NextResponse.json({ message: "Vote recorded successfully." }); // [cite: 126]

  } catch (error) { // [cite: 127]
    console.error("Vote error:", error); // [cite: 127]
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 }); // [cite: 127]
  }
}