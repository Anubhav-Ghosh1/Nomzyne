import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

interface ISale extends Document {
  name: string;
  phone: string;
  barcode: string;
  quantity: number;
  products: mongoose.Types.ObjectId[];
  totalSale: number;
  saleMedium: string;
  store: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
}

const saleSchema = new mongoose.Schema<ISale>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    totalSale: {
      type: Number,
      required: true,
      default: 0,
    },
    saleMedium: {
      type: String,
      enum: ["Online","Cash","Card"],
      default: "Cash",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", saleSchema);
