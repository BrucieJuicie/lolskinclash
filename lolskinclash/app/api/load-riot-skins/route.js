// lolskinclash\app\api\load-riot-skins\route.js
import { connectDB } from "@/utils/mongodb"; // [cite: 30]
import { Skin } from "@/models/Skin"; // [cite: 30]
import { NextResponse } from "next/server"; // [cite: 30]

export async function GET(req) { // [cite: 31]
  await connectDB(); // [cite: 31]

  const ADMIN_KEY = process.env.ADMIN_KEY; // [cite: 31]
  const urlKey = req.nextUrl.searchParams.get("key"); // [cite: 31]

  if (process.env.NODE_ENV === "production" && urlKey !== ADMIN_KEY) { // [cite: 32]
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // [cite: 32]
  }

  try { // Added try-catch for robustness
    // Fetch the list of all champions
    const allChampionsRes = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion.json", // [cite: 33]
      { next: { revalidate: 21600 } } // Cache for 6 hours (21600 seconds)
    );
    if (!allChampionsRes.ok) {
      throw new Error(`Failed to fetch champion list: ${allChampionsRes.statusText}`);
    }
    const allChampionsData = await allChampionsRes.json(); // [cite: 33]
    const championsArray = Object.values(allChampionsData.data); // [cite: 33]

    // Fetch details for each champion
    const champions = await Promise.all(
      championsArray.map(async (champion) => {
        const championDetailRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion/${champion.id}.json`, // [cite: 34]
          { next: { revalidate: 21600 } } // Cache for 6 hours
        );
        if (!championDetailRes.ok) {
          // Log error for specific champion and continue if appropriate, or throw
          console.error(`Failed to fetch details for ${champion.id}: ${championDetailRes.statusText}`);
          return null; // Or some other error handling
        }
        const champData = await championDetailRes.json(); // [cite: 34]
        return champData.data[champion.id]; // [cite: 34]
      })
    );
    
    const validChampions = champions.filter(champ => champ !== null); // Filter out any failed fetches

    const newSkins = validChampions.flatMap((champ) => // [cite: 35]
      champ.skins.map((skin) => ({ // [cite: 35]
        name: skin.name === "default" ? champ.name : skin.name, // [cite: 35]
        champion: champ.name, // [cite: 35]
        num: skin.num.toString(), // Ensure num is a string if schema expects string
        image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${skin.num}.jpg`, // [cite: 35]
        // Add default values for votes, appearances, etc., if not set by $setOnInsert fully
        votesFor: 0,
        votesAgainst: 0,
        appearances: 0,
        popularityRating: 1000, // Ensure this matches your schema default
        lastSeen: new Date(),
      }))
    );

    if (newSkins.length > 0) {
      const bulkOps = newSkins.map((skin) => ({ // [cite: 36]
        updateOne: { // [cite: 36]
          filter: { name: skin.name, champion: skin.champion }, // [cite: 36]
          update: { $setOnInsert: skin }, // [cite: 36]
          upsert: true, // [cite: 36]
        },
      }));
      await Skin.bulkWrite(bulkOps); // [cite: 37]
    }

    return NextResponse.json({ // [cite: 37]
      message: `Skins loaded or updated successfully. Processed ${validChampions.length} champions.`,
    });

  } catch (error) {
    console.error("Load Riot Skins Error:", error);
    return NextResponse.json({ error: "Failed to load Riot skins.", message: error.message }, { status: 500 });
  }
}