// /app/api/skins/random/route.js
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

await connectDB();  // OUTSIDE handler — reuse connection

export async function GET() {
  try {
    const count = await Skin.estimatedDocumentCount();

    if (count < 2) {
      return NextResponse.json({ error: "Not enough skins." }, { status: 400 });
    }

    const randomIndexes = [
      Math.floor(Math.random() * count),
      Math.floor(Math.random() * count),
    ];

    // Ensure two different skins
    while (randomIndexes[0] === randomIndexes[1]) {
      randomIndexes[1] = Math.floor(Math.random() * count);
    }

    const skins = await Skin.find()
      .skip(randomIndexes[0])
      .limit(1)
      .lean();

    const skins2 = await Skin.find()
      .skip(randomIndexes[1])
      .limit(1)
      .lean();

    return NextResponse.json([skins[0], skins2[0]]);
  } catch (error) {
    console.error("Random API error:", error);
    return NextResponse.json({ error: "Failed to load skins." }, { status: 500 });
  }
}
