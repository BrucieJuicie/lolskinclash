import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const users = await User.find().sort({ votesCast: -1 });

  return NextResponse.json(users);
}
