import mongoose from "mongoose";

const draftSchema = new mongoose.Schema({
  players: {
    A: { id: String, name: String },
    B: { id: String, name: String },
  },
  pool: [mongoose.Schema.Types.Mixed],
  bans: [mongoose.Schema.Types.Mixed],
  teamA: [mongoose.Schema.Types.Mixed],
  teamB: [mongoose.Schema.Types.Mixed],
  phase: String,
  turn: String,
  result: mongoose.Schema.Types.Mixed,
  status: String,
}, { timestamps: true });

export const Draft = mongoose.models.Draft || mongoose.model("Draft", draftSchema);
