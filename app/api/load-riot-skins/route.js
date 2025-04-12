import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  // Clear Existing Skins
  await Skin.deleteMany({});

  // Fetch Champion List
  const res = await fetch("http://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion.json");
  const data = await res.json();
  const championsArray = Object.values(data.data);

  // Fetch Detailed Champion Data
  const champions = await Promise.all(
    championsArray.map(async (champion) => {
      const res = await fetch(
        `http://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion/${champion.id}.json`
      );
      const champData = await res.json();
      return champData.data[champion.id];
    })
  );

  // Build Skins Array with num for Image
  const skins = champions.flatMap((champ) =>
    champ.skins.map((skin) => ({
      name: skin.name === "default" ? champ.name : skin.name,
      champion: champ.name,
      num: skin.num, // REQUIRED
      image: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${skin.num}.jpg`,
    }))
  );

  await Skin.insertMany(skins);

  return NextResponse.json({ message: "Skins Loaded Successfully" });
}
