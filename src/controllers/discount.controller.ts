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

const updateDiscount = asyncHandler(
  async (req: DiscountRequest, res: Response) => {
    try {
      const { code, discount, discountCode, storeId } = req.body;
      const id = req.user._id;
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        throw new ApiError(404, "Store not found");
      }
      const userExists = await User.findById(id);
      if (!userExists) {
        throw new ApiError(404, "User not found");
      }
      const discountDetails = await Discount.findById(discountCode);
      if (!discountDetails) {
        throw new ApiError(400, "Error while fetching discount details");
      }

      if (discountDetails.store !== storeId) {
        throw new ApiError(403, "You are not allowed to update this discount");
      }

      const updatedDiscount = await Discount.findByIdAndUpdate(
        discountCode,
        { code: code, discount: discount },
        { new: true }
      );

      return res
        .status(201)
        .json(
          new ApiResponse(201, updatedDiscount, "Discount updated successfully")
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

const deleteDiscount = asyncHandler(
  async (req: DiscountRequest, res: Response) => {
    try {
      const { discountCode, storeId } = req.body;
      const id = req.user._id;
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        throw new ApiError(404, "Store not found");
      }
      const userExists = await User.findById(id);
      if (!userExists) {
        throw new ApiError(404, "User not found");
      }
      const discountDetails = await Discount.findById(discountCode);
      if (!discountDetails) {
        throw new ApiError(400, "No discount associated with provided id");
      }

      if (discountDetails.store !== storeId) {
        throw new ApiError(403, "You are not allowed to update this discount");
      }

      const updatedDiscount = await Discount.findByIdAndDelete(discountCode, {
        new: true,
      });

      return res
        .status(201)
        .json(
          new ApiResponse(201, updatedDiscount, "Discount deleted successfully")
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

export { createDiscount, updateDiscount, deleteDiscount };
