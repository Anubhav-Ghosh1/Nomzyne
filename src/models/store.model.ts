import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

interface IStore extends Document {
  name: string;
  email: string;
  password: string;
  productVersion: "free" | "paid";
  role?: "user" | "admin";
  employee: mongoose.Types.ObjectId[];
}

const storeSchema = new mongoose.Schema<IStore>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // make search fast
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    employee: [{
      type: mongoose.Types.ObjectId,
      ref: "Store",
    }],
    role: {
      type: String,
      enum: ["user", "admin"],
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IStore>("Store", storeSchema);