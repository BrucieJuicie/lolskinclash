import Link from "next/link";
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";

async function getTopSkins() {
  await connectDB();

  const skins = await Skin.find().sort({ votesFor: -1, appearances: -1 }).limit(20);

  return skins;
}

export default async function LeaderboardPage() {
  const skins = await getTopSkins();

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>
      <div className="grid gap-4 max-w-3xl mx-auto">
        {skins.map((skin, index) => (
          <div
            key={skin._id}
            className="flex justify-between items-center bg-gray-900 rounded-xl p-4 border border-gray-700"
          >
            <div>
              <span className="text-lg font-bold">{index + 1}. {skin.name}</span>
              <p className="text-sm text-gray-400">{skin.champion}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Wins: {skin.votesFor}</p>
              <p className="text-sm">Losses: {skin.votesAgainst}</p>
              <p className="text-sm">Appearances: {skin.appearances}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="text-blue-400 hover:underline">
          Back to Voting
        </Link>
      </div>
    </main>
  );
}
