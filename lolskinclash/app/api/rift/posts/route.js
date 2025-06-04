// /api/rift/posts/route.js
import { connectDB } from "@/utils/mongodb";
import { RiftPost } from "@/models/RiftPost";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const totalCount = await RiftPost.countDocuments();
  const posts = await RiftPost.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return NextResponse.json({
    posts,
    totalCount,
  });
}
