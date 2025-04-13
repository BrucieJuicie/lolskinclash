import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  await connectDB();

  const params = await context.params;  // Correct for Next.js 14+

  const user = await User.findByIdAndUpdate(
    params.id,
    { $inc: { profileViews: 1 } }, // Increment view count
    { new: true }  // Return the updated user document
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
