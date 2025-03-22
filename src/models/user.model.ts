import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const accessTokenSecret: string =
  process.env.ACCESS_TOKEN_SECRET ?? "default_secret";
const refreshTokenSecret: string =
  process.env.REFRESH_TOKEN_SECRET ?? "default_secret";
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("Missing JWT secrets in environment variables");
}

interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  isActive?: boolean;
  store?: mongoose.Types.ObjectId;
  role?: "user" | "admin";
  password: string;
  refreshToken?: string;
  cloudinary_avatar_public_id?: string;

  /** 🔹 Define instance methods */
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
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
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    store: {
      type: mongoose.Types.ObjectId,
      ref: "Store",
    },
    avatar: {
      type: String,
      // cloudinary url
    },
    role: {
      type: String,
      enum: ["user", "admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    cloudinary_avatar_public_id: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // why we used function instead of arrow function because arrow function does not have this content and funtion has this context

  if (!this.isModified("password")) {
    return next();
    // if this was not here the password will be saved each time there is somechanges occur in the user
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    accessTokenSecret,
    <SignOptions>{
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
    }
  );
};
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
    },
    refreshTokenSecret,
    <SignOptions>{
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

export const User = mongoose.model<IUser>("User", userSchema);
