import mongoose from "mongoose";

const SkinSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    }, // [cite: 257]
    champion: {
      type: String,
      required: true,
    }, // [cite: 257]
    num: {
      type: String, // Changed from Number based on context like `${s.champion}-${s.skinNum}`
      required: true,
    }, // [cite: 257]
    image: {
      type: String,
      required: true,
    }, // [cite: 257]
    votesFor: {
      type: Number,
      default: 0,
    }, // [cite: 257]
    votesAgainst: {
      type: Number,
      default: 0,
    }, // [cite: 257]
    appearances: {
      type: Number,
      default: 0,
    }, // [cite: 257]
    popularityRating: {
      type: Number,
      default: 1000, // Base starting rating
    }, // [cite: 258]
    lastSeen: {
      type: Date,
      default: Date.now, // When a skin is created or last appeared
    }, // [cite: 258]
  },
  { timestamps: true } // [cite: 259]
);

// --- Index Definitions ---
SkinSchema.index({ popularityRating: -1 }); // For main skin leaderboard
SkinSchema.index({ votesFor: -1 });         // For skin highlights
SkinSchema.index({ name: 1, champion: 1 }); // For lookups and upserts
SkinSchema.index({ appearances: 1 });       // For random skin selection sorting

export const Skin = mongoose.models.Skin || mongoose.model("Skin", SkinSchema); // [cite: 259]