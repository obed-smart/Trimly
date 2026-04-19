

import connectDb from './config/db.js';
import app from './server.js';
import logger from './utils/logger.js';

const startServer = async () => {
  await connectDb();

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} 🚀`);
  });
};

startServer();
