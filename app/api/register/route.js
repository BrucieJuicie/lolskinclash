import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Filter from "bad-words";

const filter = new Filter();

export async function POST(req) {
  await connectDB();

  const { username, email, password } = await req.json();

  // Username length check
  if (username.length < 3 || username.length > 16) {
    return NextResponse.json(
      { message: "Username must be between 3 and 16 characters." },
      { status: 400 }
    );
  }

  // Profanity filter
  if (filter.isProfane(username)) {
    return NextResponse.json(
      { message: "Inappropriate username." },
      { status: 400 }
    );
  }

  // Check for existing user
  const existing = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existing) {
    return NextResponse.json(
      { message: "Username or Email already exists." },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return NextResponse.json({ message: "User registered!" });
}
