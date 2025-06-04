import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request, context) {
  await connectDB();

  const { id } = await context.params;  // Required in Next.js 14+

  await User.findByIdAndUpdate(id, { $inc: { profileViews: 1 } });

  return NextResponse.json({ message: "Profile view incremented" });
}
