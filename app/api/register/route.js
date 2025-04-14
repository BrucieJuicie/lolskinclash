import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  const { username, email, password } = await req.json();

  const existing = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existing) {
    return NextResponse.json(
      { message: "Username or Email already exists." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return NextResponse.json({ message: "User registered!" });
}
