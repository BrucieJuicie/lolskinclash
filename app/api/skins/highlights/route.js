import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  await connectDB();

  try {
    const skins = await Skin.find({}, { name: 1, image: 1, votesFor: 1 })
      .sort({ votesFor: -1 })
      .limit(3)
      .lean();

    return NextResponse.json(skins);
  } catch (error) {
    console.error("Highlights route error:", error);
    return NextResponse.json({ error: "Failed to fetch highlights." }, { status: 500 });
  }
}
