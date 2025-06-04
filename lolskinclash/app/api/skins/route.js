// /app/api/skins/route.js
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const skins = await Skin.find(); // Get ALL skins

    return NextResponse.json({ skins });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Failed to load skins." }, { status: 500 });
  }
}