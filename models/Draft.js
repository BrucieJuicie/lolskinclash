// /models/Draft.js
import mongoose from "mongoose";

const DraftSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // ✅ Required for URL-based lookup
  players: {
    A: {
      id: String,
      name: String,
      lastSeen: Number,
    },
    B: {
      id: String,
      name: String,
      lastSeen: Number,
    },
  },
  pool: Array,
  bans: Array,
  teamA: Array,
  teamB: Array,
  phase: String,
  turn: String,
  result: {
    winner: String,
    log: [String],
  },
  status: String,
}, {
  timestamps: true
});

export const Draft = mongoose.models.Draft || mongoose.model("Draft", DraftSchema);
