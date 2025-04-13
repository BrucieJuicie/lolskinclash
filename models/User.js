import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    
    
  },
  { timestamps: true }
);

// Auto hash password on save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
