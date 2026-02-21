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
    popularityRating: {
      type: Number,
      default: 1000,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

SkinSchema.index({ appearances: 1, lastSeen: 1 });
SkinSchema.index({ votesFor: -1 });
SkinSchema.index({ champion: 1, num: 1 }, { unique: true });

export const Skin = mongoose.models.Skin || mongoose.model("Skin", SkinSchema);
