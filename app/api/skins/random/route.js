import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    const skins = await Skin.find(
      {},
      {
        _id: 1,
        name: 1,
        champion: 1,
        num: 1,
        image: 1,
        votesFor: 1,
        votesAgainst: 1,
        appearances: 1,
        popularityRating: 1,
      }
    ).lean();

    if (skins.length < 2) {
      return NextResponse.json({ error: "Not enough skins." }, { status: 400 });
    }

    const totalVotesFor = (skin) => (skin.votesFor || 0) + (skin.votesAgainst || 0);

    const weightedPick = (items, getWeight) => {
      const weighted = items.map((item) => ({ item, weight: Math.max(getWeight(item), 0.0001) }));
      const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
      const roll = Math.random() * totalWeight;

      let cursor = 0;
      for (const entry of weighted) {
        cursor += entry.weight;
        if (roll <= cursor) {
          return entry.item;
        }
      }

      return weighted[weighted.length - 1].item;
    };

    const firstSkin = weightedPick(skins, (skin) => {
      const totalVotes = totalVotesFor(skin);
      const votePriority = 1 / (1 + totalVotes);
      const appearancePriority = 1 / (1 + (skin.appearances || 0));

      return votePriority * 0.75 + appearancePriority * 0.25;
    });

    const opponentPool = skins.filter((skin) => String(skin._id) !== String(firstSkin._id));

    const secondSkin = weightedPick(opponentPool, (skin) => {
      const totalVotes = totalVotesFor(skin);
      const eloDistance = Math.abs((skin.popularityRating || 1000) - (firstSkin.popularityRating || 1000));

      const votePriority = 1 / (1 + totalVotes);
      const appearancePriority = 1 / (1 + (skin.appearances || 0));
      const eloPriority = 1 / (1 + eloDistance / 150);

      return votePriority * 0.45 + eloPriority * 0.45 + appearancePriority * 0.1;
    });

    return NextResponse.json([firstSkin, secondSkin]);
  } catch (error) {
    console.error("Random skin route error:", error);
    return NextResponse.json({ error: "Failed to fetch random skins." }, { status: 500 });
  }
}
