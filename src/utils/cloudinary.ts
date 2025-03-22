import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath:string)=> {
    try {
        if(!localFilePath)
        {
            return null;
        }
        // upload the file on cloudniary
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
                folder: "music",
            }
        )

        // file has been uploaded successfully
        await fs.unlinkSync(localFilePath);
        console.log("File is uploaded on cloudinary: ",response);
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Error uploading file to Cloudinary: ", error);
        return null;
        // remove the locally saved tempory file as the upload operation was not completed
        return null;
    }
}

export {uploadOnCloudinary};