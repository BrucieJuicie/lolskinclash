// models/RiftPost.js
import mongoose from "mongoose";

const RiftPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // [cite: 254]
    username: {
      type: String,
      required: true,
    }, // [cite: 254]
    avatar: {
      type: String, // URL or identifier for the avatar
      required: true, // Assuming it's always set, adjust if optional
    }, // [cite: 254]
    text: {
      type: String,
      required: true,
      maxlength: 200, // As per your schema (Source 254) though page 53 textarea uses 280.
                      // You might want to make these consistent.
    }, // [cite: 254]
    type: {
      type: String,
      enum: ["message", "achievement"],
      default: "message",
    }, // [cite: 254]
    // createdAt and updatedAt are automatically added by { timestamps: true }
  },
  { timestamps: true } // [cite: 255]
);

// --- Index Definitions ---
RiftPostSchema.index({ createdAt: -1 }); // For sorting posts by newest first
RiftPostSchema.index({ userId: 1 });      // For potentially fetching posts by a specific user

export const RiftPost =
  mongoose.models.RiftPost || mongoose.model("RiftPost", RiftPostSchema); // [cite: 256]