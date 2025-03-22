import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";
import dotenv from "dotenv";
dotenv.config();
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DATABASE_URI: string;
      }
    }
  }
const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (e) {
        console.log("Error: ", e);
        process.exit(1);
    }
}

export default connectDB;