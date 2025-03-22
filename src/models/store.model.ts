import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

interface IStore extends Document {
  name: string;
  email: string;
  password: string;
  owner: mongoose.Types.ObjectId;
  productVersion: "free" | "paid";
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    employee: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IStore>("Store", storeSchema);