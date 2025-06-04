import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Automatically creates a unique index
      trim: true,
    }, // [cite: 260]
    email: {
      type: String,
      required: true,
      unique: true, // Automatically creates a unique index
      trim: true,
    }, // [cite: 260]
    password: {
      type: String,
      required: true,
    }, // [cite: 260, 261]
    resetToken: String, // [cite: 261]
    resetTokenExpiry: Date, // [cite: 261]
    votesCast: {
      type: Number,
      default: 0,
    }, // [cite: 261]
    mostVotedForSkin: {
      type: String,
      default: "",
    }, // [cite: 261]
    mostVotedAgainstSkin: {
      type: String,
      default: "",
    }, // [cite: 261]
    avatar: {
      type: String,
      default: "266", // Default avatar or placeholder
    }, // [cite: 261]
    profileViews: {
      type: Number,
      default: 0,
    }, // [cite: 261]
    achievements: {
      type: [String], // e.g., "vote_100", "champion_master"
      default: [],
    }, // [cite: 261]
    voteTimestamps: {
      type: [Date],
      default: [],
    }, // [cite: 261]
    votedChampions: {
      type: [String],
      default: [],
    }, // [cite: 261]
    votedSkins: {
      type: [String], // championName-skinNum format
      default: [],
    }, // [cite: 261, 262]
    championVoteCounts: {
      type: Map,
      of: Number,
      default: {}, // e.g. { "Ahri": 142, "Yasuo": 25 }
    }, // [cite: 262]
    favoriteChampion: {
      type: String,
      default: "",
    }, // [cite: 262]
  },
  { timestamps: true } // [cite: 263]
);

// --- Index Definitions ---
UserSchema.index({ resetToken: 1 }); // For password reset lookups
UserSchema.index({ votesCast: -1 }); // For sorting user leaderboard

export const User = mongoose.models.User || mongoose.model("User", UserSchema); // [cite: 263]