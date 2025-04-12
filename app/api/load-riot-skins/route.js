import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const ADMIN_KEY = process.env.ADMIN_KEY;
  const urlKey = req.nextUrl.searchParams.get("key");

  if (process.env.NODE_ENV === "production" && urlKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    "https://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion.json"
  );
  const data = await res.json();
  const championsArray = Object.values(data.data);

  const champions = await Promise.all(
    championsArray.map(async (champion) => {
      const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion/${champion.id}.json`
      );
      const champData = await res.json();
      return champData.data[champion.id];
    })
  );

  const newSkins = champions.flatMap((champ) =>
    champ.skins.map((skin) => ({
      name: skin.name === "default" ? champ.name : skin.name,
      champion: champ.name,
      num: skin.num,
      image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${skin.num}.jpg`,
    }))
  );

  const bulkOps = newSkins.map((skin) => ({
    updateOne: {
      filter: { name: skin.name, champion: skin.champion },
      update: { $setOnInsert: skin },
      upsert: true,
    },
  }));

  await Skin.bulkWrite(bulkOps);

  return NextResponse.json({ message: "Skins loaded or updated successfully" });
}
