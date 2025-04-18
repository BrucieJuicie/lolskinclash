// /models/QueueEntry.js
import mongoose from "mongoose";

const QueueEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const QueueEntry =
  mongoose.models.QueueEntry || mongoose.model("QueueEntry", QueueEntrySchema);
