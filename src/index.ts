import app from "./server.ts";
import logger from "./utils/logger.ts";

const startServer = async () => {
  //   await connectDB();

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} 🚀`);
  });
};

startServer();
