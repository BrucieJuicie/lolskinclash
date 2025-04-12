import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const skins = await Skin.find();

  const data = skins.map((skin) => {
    const totalVotes = skin.votesFor + skin.votesAgainst;
    const winPercent = totalVotes > 0 ? ((skin.votesFor / totalVotes) * 100).toFixed(2) : "0.00";

    return {
      id: skin._id,
      name: skin.name,
      champion: skin.champion,
      votesFor: skin.votesFor,
      votesAgainst: skin.votesAgainst,
      appearances: skin.appearances,
      winPercent,
    };
  });

  return NextResponse.json(data);
}
