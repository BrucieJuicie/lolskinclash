// /app/api/skins/random/route.js
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

await connectDB(); // Reuse DB connection at the module level

export async function GET() {
  try {
    const skins = await Skin.find();

    if (skins.length < 2) {
      return NextResponse.json(
        { error: "Not enough skins." },
        { status: 400 }
      );
    }

    // Sort by lowest appearances first, then add slight randomness
    const shuffled = [...skins]
      .sort((a, b) => a.appearances - b.appearances || Math.random() - 0.5);

    const [skin1, skin2] = shuffled.slice(0, 2);

    return NextResponse.json([skin1, skin2]);
  } catch (error) {
    console.error("Random skin route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random skins." },
      { status: 500 }
    );
  }
}
