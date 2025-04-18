import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpiry: Date,
    votesCast: {
      type: Number,
      default: 0,
    },
    mostVotedForSkin: {
      type: String,
      default: "",
    },
    mostVotedAgainstSkin: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "266",
    },
    profileViews: {
      type: Number,
      default: 0,
    },

    // Achievement tracking
    achievements: {
      type: [String], // store strings like "vote_100", "champion_master", etc.
      default: [],
    },

    // Logs for intelligent tracking
    voteTimestamps: {
      type: [Date],
      default: [],
    },
    votedChampions: {
      type: [String],
      default: [],
    },
    votedSkins: {
      type: [String], // championName-skinNum format
      default: [],
    },
    championVoteCounts: {
      type: Map,
      of: Number,
      default: {}, // e.g. { "Ahri": 142, "Yasuo": 25 }
    },
    favoriteChampion: {
      type: String,
      default: "",
    },

  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
