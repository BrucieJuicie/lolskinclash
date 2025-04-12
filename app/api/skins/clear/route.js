import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const ADMIN_KEY = process.env.ADMIN_KEY;
  const urlKey = req.nextUrl.searchParams.get("key");

  if (process.env.NODE_ENV === "production" && urlKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Skin.deleteMany({});
  return NextResponse.json({ message: "Skins cleared." });
}
