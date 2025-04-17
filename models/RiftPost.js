// models/RiftPost.js

import mongoose from "mongoose";

const RiftPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["message", "achievement"],
      default: "message",
    },
  },
  { timestamps: true }
);

export const RiftPost =
  mongoose.models.RiftPost || mongoose.model("RiftPost", RiftPostSchema);
