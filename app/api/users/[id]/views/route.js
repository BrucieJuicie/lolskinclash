import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request, context) {
  await connectDB();

  const params = await context.params; // <-- THIS IS WHAT YOU NEED.

  await User.findByIdAndUpdate(
    params.id,
    { $inc: { profileViews: 1 } }
  );

  return NextResponse.json({ message: "Profile views incremented." });
}
