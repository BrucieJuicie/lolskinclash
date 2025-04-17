// app/api/rift/get/route.js

import { connectDB } from "@/utils/mongodb";
import { RiftPost } from "@/models/RiftPost";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    // Get up to 50 recent posts, no older than 7 days
    const posts = await RiftPost.find({ createdAt: { $gte: oneWeekAgo } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch Rift posts:", error);
    return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });
  }
}
