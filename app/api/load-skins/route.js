import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";

// Load new skins into database
export async function POST(req) {
  const skins = await req.json();

  try {
    await connectDB();
    await Skin.insertMany(skins);
    return NextResponse.json({ message: "Skins Loaded" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error loading skins" },
      { status: 500 }
    );
  }
}

// Fetch all skins from database
export async function GET() {
  try {
    await connectDB();
    const skins = await Skin.find({});
    return NextResponse.json(skins);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching skins" },
      { status: 500 }
    );
  }
}
