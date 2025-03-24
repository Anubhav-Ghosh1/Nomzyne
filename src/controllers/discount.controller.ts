import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import Store from "../models/store.model";
import Discount from "../models/discount.model";
import Sale from "../models/sale.model";
import { ApiError } from "../utils/ApiError";
import Inventory from "../models/inventory.model";
import mongoose from "mongoose";

interface DiscountRequest extends Request {
  store: mongoose.Types.ObjectId;
  code: string;
  discount: number;
  user: mongoose.Types.ObjectId;
}

const createDiscount = asyncHandler(
  async (req: DiscountRequest, res: Response) => {
    try {
      const { store, code, discount, user } = req.body;
      const storeExists = await Store.findById(store);
      if (!storeExists) {
        throw new ApiError(404, "Store not found");
      }
      const userExists = await User.findById(user);
      if (!userExists) {
        throw new ApiError(404, "User not found");
      }
      const discountExists = await Discount.findOne({
        store,
        code,
      });
      if (discountExists) {
        throw new ApiError(400, "Discount already exists");
      }

      const createDiscount = await Discount.create({
        store,
        code,
        discount,
        user,
      });
      return res
        .status(201)
        .json(
          new ApiResponse(201, createDiscount, "Discount created successfully")
        );
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

export { createDiscount };
