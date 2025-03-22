import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import Store from "../models/store.model";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import mongoose from "mongoose";

interface StoreRequest extends Request {
  name: string;
  email: string;
  employees: mongoose.Types.ObjectId[];
  role?: string;
  user?: any;
}

const createStore = asyncHandler(async (req: StoreRequest, res: Response) => {
  try {
    const { name, email, employees, role } = req.body;
    const id = req.user._id;
    const userDetails = await User.findById(id);
    if (!userDetails) {
      throw new ApiError(404, "User not found");
    }
    if (userDetails.role !== "admin") {
      throw new ApiError(403, "You are not allowed to create a store");
    }
    const store = await Store.create({
      name,
      email,
      owner: id,
    });

    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        set: {
          store: store._id,
        },
      },
      { new: true }
    );
    return res
      .status(201)
      .json(new ApiResponse(201, store, "Store created successfully"));
  } catch (e) {
    if (e instanceof ApiError) {
      return res
        .status(e.statusCode)
        .json(new ApiResponse(e.statusCode, e.message));
    }
  }
});

const addEmployee = asyncHandler(async (req: StoreRequest, res: Response) => {
  try {
    const id = req.user._id;
    const { storeId, employee } = req.body;
    if (!id) {
      throw new ApiError(404, "User not found");
    }
    const userDetails = await User.findById(id);
    if (!userDetails) {
      throw new ApiError(404, "User not found");
    }

    if (userDetails.role !== "admin") {
      throw new ApiError(403, "You are not allowed to add an employee");
    }

    const store = await Store.findById(storeId);
    if (!store) {
      throw new ApiError(404, "Store not found");
    }

    if (store.owner !== id) {
      throw new ApiError(403, "You are not allowed to add an employee");
    }

    for (let i = 0; i < employee.length; i++) {
      const userDetails = await User.findById({ email: employee[i] });
      if (!userDetails) {
        throw new ApiError(404, "User not found");
      }
      const store = await Store.findByIdAndUpdate(
        storeId,
        {
          $addToSet: { employees: userDetails._id },
        },
        { new: true }
      );

      const updateUser = await User.findByIdAndUpdate(
        userDetails._id,
        {
          $set: { store: storeId },
        },
        { new: true }
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, store, "Employee added successfully"));
  } catch (e) {
    if (e instanceof ApiError) {
      return res
        .status(e.statusCode)
        .json(new ApiResponse(e.statusCode, e.message));
    }
  }
});

export { createStore, addEmployee };
