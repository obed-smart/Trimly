import redis from '../config/redis.config.js';
import analysisRepository from '../repository/analysis.repository.js';
import urlRepository from '../repository/url.repository.js';
import logger from '../utils/logger.js';

export async function syncToDb() {
  const items = await redis.lrange('analysis:queues', 0, 99);

  if (items.length > 0) {
    const parsed = items.map(JSON.parse);


    // Bulk insert analysis data into the database
    await analysisRepository.createAnalysis(parsed);

    await redis.ltrim('analysis:queues', items.length, -1);
  }

  // Sync click counts from Redis to the database
  
  const clickKeys = await redis.sca('url:*:clicks');

  logger.info(`Found ${clickKeys.length} click keys to sync`);

  for (const key of clickKeys) {
    const clicks = await redis.get(key);

    if (!clicks) continue;

    const shortCode = key.split(':')[1];

    // Update click count in the database
    await urlRepository.incrementClickCount(shortCode, Number(clicks));

    await redis.del(key);
  }
}

