import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const count = await Skin.countDocuments();

  if (count < 2) {
    return NextResponse.json(
      { error: "Not enough skins in the database." },
      { status: 400 }
    );
  }

  const randomIndexes = new Set();

  while (randomIndexes.size < 2) {
    randomIndexes.add(Math.floor(Math.random() * count));
  }

  const indexesArray = Array.from(randomIndexes);

  const skins = await Skin.find({
    _id: { $in: await Promise.all(indexesArray.map(async (index) => {
      const doc = await Skin.findOne().skip(index).select("_id");
      return doc._id;
    })) },
  });

  return NextResponse.json(skins);
}
