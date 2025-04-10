import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/database.js";
import logger from "./logger/winston.logger.js";

dotenv.config({
  path: "./.env",
});

const PORT = Number(process.env.PORT) || 8080;
const majorNodeVersion = +process.env.NODE_VERSION?.split(".")[0] || 0;

const startServer = () => {
  app.listen(PORT, () => logger.info(`⚙️  Server is running on PORT: ${PORT}`));
};

if (majorNodeVersion >= 14) {
  try {
    await connectDB();
    startServer();
  } catch (error) {
    logger.error("ERROR while connecting DB: ", error);
  }
} else {
  connectDB()
    .then(() => {
      startServer();
    })
    .catch(error => {
      logger.error("ERROR while connecting DB: ", error);
    });
}
