// lolskinclash\app\api\skins\load-new\route.js
import { connectDB } from "@/utils/mongodb"; // [cite: 77]
import { Skin } from "@/models/Skin"; // [cite: 77]
import { NextResponse } from "next/server"; // [cite: 77]

export async function GET(req) { // [cite: 78]
  await connectDB(); // [cite: 79]

  const ADMIN_KEY = process.env.ADMIN_KEY; // [cite: 79]
  const urlKey = req.nextUrl.searchParams.get("key"); // [cite: 79]

  if (process.env.NODE_ENV === "production" && urlKey !== ADMIN_KEY) { // [cite: 80]
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // [cite: 80]
  }

  try { // [cite: 81]
    const res = await fetch(
      'https://ddragon.leagueoflegends.com/cdn/14.8.1/data/en_US/champion.json', // [cite: 81]
      { next: { revalidate: 21600 } } // Cache for 6 hours (21600 seconds)
    );
    
    if (!res.ok) { // [cite: 82]
      // Log the response body for more details if possible without exposing too much
      const errorBody = await res.text();
      console.error("Invalid champion response from Riot API:", res.status, errorBody);
      return NextResponse.json({ error: "Invalid Riot API response", details: `Status: ${res.status}` }, { status: res.status === 429 ? 429 : 500 }); // [cite: 82]
    }

    const json = await res.json(); // [cite: 81]

    if (!json?.data) { // [cite: 81]
      console.error("Invalid champion response structure:", json); // [cite: 81]
      return NextResponse.json({ error: "Invalid Riot API response structure" }, { status: 500 }); // [cite: 82]
    }

    // Fetching only champion and num to minimize memory usage
    const existingSkinsData = await Skin.find({}, 'champion num -_id').lean(); // [cite: 82]
    const existingKeys = new Set( // [cite: 83]
      existingSkinsData.map((s) => `${s.champion}-${s.num}`) // [cite: 83]
    );

    const newSkinsList = []; // Renamed from newSkins to avoid conflict with model name [cite: 83]

    for (const champKey in json.data) { // [cite: 83]
      const champ = json.data[champKey]; // [cite: 83]
      if (!champ?.skins) { // [cite: 84]
        console.warn(`Champion ${champKey} has no skins`); // [cite: 85]
        continue; // [cite: 85]
      }

      champ.skins.forEach((skin) => { // [cite: 85]
        const key = `${champ.name}-${skin.num}`; // [cite: 85]
        if (!existingKeys.has(key)) { // [cite: 85]
          newSkinsList.push({ // [cite: 85]
            name: skin.name === "default" ? champ.name : skin.name, // [cite: 85]
            champion: champ.name, // [cite: 85]
            num: skin.num.toString(), // Ensure num is a string if schema expects string [cite: 85]
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${skin.num}.jpg`, // [cite: 85]
            votesFor: 0, // [cite: 85]
            votesAgainst: 0, // [cite: 85]
            appearances: 0, // [cite: 85]
            popularityRating: 1000, // [cite: 85]
            lastSeen: new Date(),
          });
        }
      });
    }

    if (newSkinsList.length > 0) { // [cite: 86]
      await Skin.insertMany(newSkinsList); // [cite: 86]
    }

    return NextResponse.json({ // [cite: 86]
      message: `Added ${newSkinsList.length} new skins.`, // [cite: 86]
    });

  } catch (error) { // [cite: 86]
    console.error("Load New Skins Error:", error); // [cite: 87]
    return NextResponse.json({ error: "Failed to load new skins.", message: error.message }, { status: 500 }); // [cite: 87]
  }
}