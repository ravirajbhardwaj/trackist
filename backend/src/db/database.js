import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../logger/winston.logger.js";

/** @type {typeof mongoose || undefined} */
export let dbInstance = undefined;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    dbInstance = connectionInstance;
    logger.info(
      `\n MongoDB CONNECTED! DB HOST: ", ${connectionInstance.connection.host}\n`
    );
    console.log("Connection Instance DB:");
  } catch (error) {
    location.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
