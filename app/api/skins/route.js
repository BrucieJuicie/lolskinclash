import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";

export async function GET() {
  try {
    await connectDB();

    const count = await Skin.countDocuments();
    const random = Math.floor(Math.random() * count);

    const skins = await Skin.find().skip(random).limit(2);

    return NextResponse.json(skins);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching skins" },
      { status: 500 }
    );
  }
}
