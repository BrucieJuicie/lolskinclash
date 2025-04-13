import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const skins = await Skin.find()
    .sort({ votesFor: -1 }) // Highest votesFor first
    .limit(3);

  return NextResponse.json(skins);
}
