import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    const skins = await Skin.aggregate([
      { $sort: { appearances: 1, lastSeen: 1 } },
      { $limit: 50 },
      { $sample: { size: 2 } },
    ]);

    if (skins.length < 2) {
      return NextResponse.json({ error: "Not enough skins." }, { status: 400 });
    }

    return NextResponse.json(skins);
  } catch (error) {
    console.error("Random skin route error:", error);
    return NextResponse.json({ error: "Failed to fetch random skins." }, { status: 500 });
  }
}
