import mongoose from "mongoose";

const SkinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  champion: {
    type: String,
    required: true,
  },
  num: {  // REQUIRED FOR IMAGE URL
    type: Number,
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
});

export const Skin = mongoose.models.Skin || mongoose.model("Skin", SkinSchema);