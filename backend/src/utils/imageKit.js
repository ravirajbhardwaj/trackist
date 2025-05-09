import ImageKit from "imagekit";
import fs from "fs";
import { ApiError } from "./apiError.js";
import logger from "../logger/winston.logger.js";
import dotenv from "dotenv";

dotenv.config();

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadToImageKit(file, fileName) {
  try {
    // Check if the file is an image
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    if (!allowedExtensions.includes(fileExtension)) {
      fs.unlink(file);
      throw new ApiError(
        400,
        "Invalid file type. Only image files are allowed."
      );
    }

    const response = await imageKit.upload({
      file: fs.readFileSync(file),
      fileName,
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95,
        },
      ],
      transformation: {
        pre: "l-text,i-Imagekit,fs-50,l-end",
        post: [
          {
            type: "transformation",
            value: "w-100",
          },
        ],
      },
      isPrivateFile: false,
    });

    logger.info("File uploaded successfully to Imagekit", response);
    fs.unlinkSync(file);

    return response;
  } catch (error) {
    fs.unlinkSync(file);
    throw new ApiError(500, "Failed to upload to Imagekit", error?.message);
  }
}

export { uploadToImageKit };
