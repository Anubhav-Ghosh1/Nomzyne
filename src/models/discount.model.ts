import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

interface IDiscount extends Document {
  store: mongoose.Types.ObjectId;
  code: string;
  discount: number;
  user: mongoose.Types.ObjectId;
}

const discountSchema = new mongoose.Schema<IDiscount>(
  {
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    code: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
  },
  { timestamps: true }
);

export default mongoose.model<IDiscount>("Discount", discountSchema);