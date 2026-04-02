import mongoose from "mongoose";
import logger from "../utils/logger.js";

const dbUrl = process.env.DATABASE_LOCAL as string;

const connectDb = async () => {
  logger.info("connecting to the Database....");
  try {
    await mongoose.connect(dbUrl);
    logger.info("Database connected successfully");
  } catch (err: string | any) {
    logger.error("Error connecting to the Database", err);
    process.exit(1);
  }
};

export default connectDb;
