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

  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/14.8.1/data/en_US/champion.json');
    const json = await res.json();

    if (!json?.data) {
      console.error("Invalid champion response:", json);
      return NextResponse.json({ error: "Invalid Riot API response" }, { status: 500 });
    }

    const existingSkins = await Skin.find();
    const existingKeys = new Set(
      existingSkins.map((s) => `${s.champion}-${s.skinNum}`)
    );

    const newSkins = [];

    for (const champKey in json.data) {
      const champ = json.data[champKey];

      if (!champ?.skins) {
        console.warn(`Champion ${champKey} has no skins`);
        continue;
      }

      champ.skins.forEach((skin) => {
        const key = `${champ.name}-${skin.num}`;
        if (!existingKeys.has(key)) {
          newSkins.push({
            name: skin.name === "default" ? champ.name : skin.name,
            champion: champ.name,
            num: skin.num,
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${skin.num}.jpg`,
            votesFor: 0,
            votesAgainst: 0,
            appearances: 0,
            popularityRating: 1000,
          });
        }
      });
    }

    if (newSkins.length > 0) {
      await Skin.insertMany(newSkins);
    }

    return NextResponse.json({
      message: `Added ${newSkins.length} new skins.`,
    });
  } catch (error) {
    console.error("Load New Skins Error:", error);
    return NextResponse.json({ error: "Failed to load new skins." }, { status: 500 });
  }
}
