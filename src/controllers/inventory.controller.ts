import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import Store from "../models/store.model";
import { ApiError } from "../utils/ApiError";
import Inventory from "../models/inventory.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import mongoose from "mongoose";

interface InventoryRequest extends Request {
  name: string;
  email: string;
  employees: mongoose.Types.ObjectId[];
  role?: string;
  user?: any;
}

const addProduct = asyncHandler(
  async (req: InventoryRequest, res: Response) => {
    try {
      const { name, barcode, quantity, storeId } = req.body;
      const id = req.user._id;
      const userDetails = await User.findById(id);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }

      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to add product to this store"
        );
      }

      const product = await Inventory.create({
        name,
        barcode,
        quantity,
        store: storeId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, product, "Product added successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

const updateProduct = asyncHandler(
  async (req: InventoryRequest, res: Response) => {
    try {
      const { name, barcode, quantity, storeId } = req.body;
      const id = req.user._id;
      const userDetails = await User.findById(id);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to update product in this store"
        );
      }
      let updatedDetails: { name?: string; quantity?: number } = {};
      if (name) {
        updatedDetails.name = name;
      }
      if (quantity) {
        updatedDetails.quantity = quantity;
      }
      const product = await Inventory.findOneAndUpdate(
        { barcode },
        updatedDetails,
        { new: true }
      );
      return res
        .status(200)
        .json(new ApiResponse(200, product, "Product updated successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

const deleteProduct = asyncHandler(
  async (req: InventoryRequest, res: Response) => {
    try {
      const { barcode, storeId } = req.body;
      const id = req.user._id;
      const userDetails = await User.findById(id);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to delete product in this store"
        );
      }
      const product = await Inventory.findOneAndDelete({ barcode });
      return res
        .status(200)
        .json(new ApiResponse(200, product, "Product deleted successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

const getAllProducts = asyncHandler(
  async (req: InventoryRequest, res: Response) => {
    try {
      const { storeId } = req.body;
      const id = req.user._id;
      const userDetails = await User.findById(id);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to view products of this store"
        );
      }
      const products = await Inventory.find({ store: storeId });
      return res
        .status(200)
        .json(new ApiResponse(200, products, "Products fetched successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

const getProductById = asyncHandler(
  async (req: InventoryRequest, res: Response) => {
    try {
      const { storeId, barcode } = req.body;
      const id = req.user._id;
      const userDetails = await User.findById(id);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to view products of this store"
        );
      }
      const product = await Inventory.findOne({ store: storeId, barcode });
      return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

const searchProduct = asyncHandler(
  async (req: InventoryRequest, res: Response) => {
    try {
      const { storeId, search, page = 0, limit = 20 } = req.body;
      const userId = req.user._id;

      if (!storeId || !search) {
        return res
          .status(400)
          .json(new ApiResponse(400, "storeId and search query are required"));
      }

      const userDetails = await User.findById(userId);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to view products of this store"
        );
      }

      // Sanitize and use prefix regex
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp("^" + sanitizedSearch, "i");

      const query = {
        storeId,
        userId,
        barcode: regex,
      };

      const products = await Inventory.find(query)
        .limit(limit)
        .skip(page * limit)
        .lean();

      return res
        .status(200)
        .json(new ApiResponse(200, products, "Products fetched successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      } else {
        return res
          .status(500)
          .json(new ApiResponse(500, "Internal Server Error"));
      }
    }
  }
);

export {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProduct,
};
