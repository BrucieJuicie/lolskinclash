import mongoose from "mongoose";

const SkinSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    champion: {
      type: String,
      required: true,
    },
    num: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    votesFor: {
      type: Number,
      default: 0,
    },
    votesAgainst: {
      type: Number,
      default: 0,
    },
    appearances: {
      type: Number,
      default: 0,
    },

    // NEW: Popularity Rating (MMR/Elo Style)
    popularityRating: {
      type: Number,
      default: 1000, // Base starting rating
    },

    // NEW: Last Seen Timestamp (For Stale Priority System)
    lastSeen: {
      type: Date,
      default: Date.now, // When a skin is created
    },
  },
  { timestamps: true }
);

export const Skin = mongoose.models.Skin || mongoose.model("Skin", SkinSchema);