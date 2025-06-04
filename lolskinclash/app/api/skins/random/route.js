// /app/api/skins/random/route.js
import { connectDB } from "@/utils/mongodb";
import { Skin } from "@/models/Skin";
import { NextResponse } from "next/server";

// await connectDB(); // connectDB will be called inside the handler now.

export async function GET() {
  try {
    await connectDB(); // Ensure DB connection for each request in serverless.

    // Use MongoDB's $sample to efficiently get 2 random documents
    const randomSkins = await Skin.aggregate([{ $sample: { size: 2 } }]);

    if (randomSkins.length < 2) {
      return NextResponse.json(
        { error: "Not enough skins to select two." }, // More specific error
        { status: 400 }
      );
    }

    // The $sample stage returns an array of documents, so skin1 and skin2 are directly available.
    // No need for manual shuffling or slicing if pure randomness is acceptable.
    // const [skin1, skin2] = randomSkins; // This would assign them directly

    // The API is expected to return an array of two skins
    return NextResponse.json(randomSkins);

  } catch (error) {
    console.error("Random skin route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random skins." },
      { status: 500 }
    );
  }
}