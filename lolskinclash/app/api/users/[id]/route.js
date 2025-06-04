import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  await connectDB();

  const { id } = await context.params;  // Required in Next.js 14+

  const user = await User.findById(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
