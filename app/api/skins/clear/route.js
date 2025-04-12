import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  await Skin.deleteMany({});
  return NextResponse.json({ message: "Skins Cleared" });
}