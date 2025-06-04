import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req, context) {
  await connectDB();

  const params = await context.params;  // Correct pattern
  const { avatar } = await req.json();

  console.log("Updating avatar for user:", params.id, "to:", avatar);

  const user = await User.findById(params.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.avatar = avatar;
  await user.save();

  return NextResponse.json({ message: "Avatar updated!" });
}
