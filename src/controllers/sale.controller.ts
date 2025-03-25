import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import Store from "../models/store.model";
import Sale from "../models/sale.model";
import { ApiError } from "../utils/ApiError";
import Inventory from "../models/inventory.model";
import mongoose from "mongoose";

interface SaleRequest extends Request {
  barcode: string;
  phone: string;
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  quantity: number;
  saleMedium: string;
  name?: string | "Temp User";
  employees: mongoose.Types.ObjectId;
  role?: string;
}

const createBill = asyncHandler(async (req: SaleRequest, res: Response) => {
  try {
    // Barcode will be array of products
    const { barcodes, storeId, phone, quantity, saleMedium, name } = req.body;
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

    const sale = await Sale.create({
      name,
      phone,
      quantity,
      store: storeId,
      saleMedium: saleMedium,
      employee: id,
    });

    let total_sale = 0;

    barcodes.forEach(async (barcode: string) => {
      const product = await Inventory.findOne({ barcode });
      if (!product) {
        throw new ApiError(404, "Product not found");
      }
      if (product.quantity < quantity) {
        throw new ApiError(400, "Product out of stock");
      }
      product.quantity -= quantity;
      total_sale += product.price * quantity;
      await product.save();
      const updateSale = await Sale.findByIdAndUpdate(
        sale._id,
        {
          $push: {
            products: product._id,
          },
        },
        { new: true }
      );
    });
    sale.totalSale = total_sale;
    await sale.save();
    return res
      .status(201)
      .json(new ApiResponse(201, sale, "Sale created successfully"));
  } catch (e) {
    if (e instanceof ApiError) {
      return res
        .status(e.statusCode)
        .json(new ApiResponse(e.statusCode, e.message));
    }
  }
});

const allSalesForStore = asyncHandler(
  async (req: SaleRequest, res: Response) => {
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
          "You are not allowed to view sales for this store"
        );
      }
      const storeDetails = await Store.findById(storeId);
      if (!storeDetails) {
        throw new ApiError(404, "Store not found");
      }
      const sales = await Sale.find({ store: storeId }).populate("products");
      return res
        .status(200)
        .json(new ApiResponse(200, sales, "Sales fetched successfully"));
    } catch (e) {
      if (e instanceof ApiError) {
        return res
          .status(e.statusCode)
          .json(new ApiResponse(e.statusCode, e.message));
      }
    }
  }
);

const allSalesForEmployee = asyncHandler(
  async (req: SaleRequest, res: Response) => {
    try {
      const id = req.user._id;
      const { storeId } = req.body;
      const userDetails = await User.findById(id);
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      if (userDetails.store !== storeId) {
        throw new ApiError(
          403,
          "You are not allowed to view sales for this store"
        );
      }

      const storeDetails = await Store.findById(storeId);
      if (!storeDetails) {
        throw new ApiError(404, "Store not found");
      }

      const salesByEmployee = await Sale.find({
        store: storeId,
        employee: id,
      }).populate("products");
      return res
        .status(200)
        .json(
          new ApiResponse(200, salesByEmployee, "Sales fetched successfully")
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

const getSaleById = asyncHandler(async (req: SaleRequest, res: Response) => {
  try {
    const { saleId, storeId } = req.body;
    const saleDetails = await Sale.findOne({ _id: saleId, store: storeId });
    if (!saleDetails) {
      throw new ApiError(404, "Sale not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, saleDetails, "Sale fetched successfully"));
  } catch (e) {
    if (e instanceof ApiError) {
      return res
        .status(e.statusCode)
        .json(new ApiResponse(e.statusCode, e.message));
    }
  }
});

const totalSaleBasedOnPaymentMethod = asyncHandler(
  async (req: SaleRequest, res: Response) => {
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
          "You are not allowed to view sales for this store"
        );
      }

      const saleDetail = await Sale.aggregate([
        { $match: { store: new mongoose.Types.ObjectId(storeId) } },
        { $group: { _id: "$saleMedium", totalSale: { $sum: "$totalSale" } } },
      ]);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            saleDetail,
            "Total sales based on payment method fetched successfully"
          )
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

export { createBill, allSalesForStore, allSalesForEmployee, getSaleById, totalSaleBasedOnPaymentMethod };
