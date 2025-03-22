import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";

interface UserRequest extends Request {
    username: string;
    fullName: string;
    email: string;
    password: string;
    bio?: string | "";
    file?: Express.Multer.File;
    role?: string;
    user?: any;
  }

  const generateAccessAndRefereshTokens = async(userId: string) =>{
    try {
        const user = await User.findById(userId)
        if(!user)
        {
            throw new ApiError(404, "User not found")
        }
        const accessToken = user?.generateAccessToken()
        const refreshToken = user?.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const signup = asyncHandler(async (req: UserRequest, res: Response) => {
    try
    {
        const { username, fullName, email, password, bio, role } = req.body;
        const filePath: string = req.file?.path || "";
        let file = null;
        if (filePath != "") {
            // Upload file to cloudinary
            file = await uploadOnCloudinary(filePath);
        }
        const user = await User.create({
            username,
            fullName,
            email,
            password,
            bio: bio || "",
            avatar: file?.secure_url || "",
            role: role || "user",
        });
        if(!user)
        {
            throw new ApiError(400, "User not created");
        }
        return res.status(201).json(new ApiResponse(201, user, "User created"));
    }
    catch(e)
    {
        if(e instanceof ApiError)
        {
            return res.status(e.statusCode).json(new ApiResponse(e.statusCode, null, e.message));
        }
    }
});

const login = asyncHandler(async (req: UserRequest, res: Response) => {
    try
    {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user)
        {
            throw new ApiError(404, "User not found");
        }
        const checkPassword = await user.isPasswordCorrect(password);
        if(!checkPassword)
        {
            throw new ApiError(400, "Invalid credentials");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id.toString());
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        }

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        return res.status(200).json(new ApiResponse(200, loggedInUser, "User logged in"));
    }
    catch(e)
    {
        if(e instanceof ApiError)
        {
            return res.status(e.statusCode).json(new ApiResponse(e.statusCode, null, e.message));
        }
    }
});

const logoutUser = asyncHandler(async (req: UserRequest, res: Response) => {
    try
    {
        const id = req.user._id;
        const user = await User.findByIdAndUpdate(
            id,
            {
                $unset: { refreshToken: 1 },
            },
            {
                new: true,
            }
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);

        return res.status(200).json(new ApiResponse(200, {}, "User logged out"));
    }
    catch(e)
    {
        if(e instanceof ApiError)
        {
            return res.status(e.statusCode).json(new ApiResponse(e.statusCode, null, e.message));
        }
    }
});

export { signup, login, generateAccessAndRefereshTokens, logoutUser };