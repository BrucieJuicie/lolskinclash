import { connectDB } from "@/utils/mongodb";
import { RiftPost } from "@/models/RiftPost";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { NextResponse } from "next/server";
import { Filter } from "bad-words";

const filter = new Filter();

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string" || text.length > 200) {
    return NextResponse.json({ message: "Invalid post content." }, { status: 400 });
  }

  if (filter.isProfane(text)) {
    return NextResponse.json({ message: "Post contains inappropriate language." }, { status: 400 });
  }

  if (/https?:\/\/\S+/gi.test(text)) {
    return NextResponse.json({ message: "Links are not allowed in posts." }, { status: 400 });
  }

  // ✅ Get full user data from DB
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const newPost = new RiftPost({
    userId: user._id,
    username: user.username,
    avatar: user.avatar || "266",
    text: text.trim(),
    type: "message",
    createdAt: new Date(),
  });

  await newPost.save();

  return NextResponse.json({ message: "Post submitted!", post: newPost });
}
