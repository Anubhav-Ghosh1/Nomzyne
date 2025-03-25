import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export interface IInventory extends Document {
  name: string;
  barcode: string;
  password: string;
  quantity: number;
  price: number;
  store: mongoose.Types.ObjectId;
}

const inventorySchema = new mongoose.Schema<IInventory>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // make search fast
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>("Inventory", inventorySchema);
