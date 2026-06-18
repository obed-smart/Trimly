import redis from '../config/redis.config.js';
import analysisRepository from '../repository/analysis.repository.js';
import urlRepository from '../repository/url.repository.js';
import logger from '../utils/logger.js';

export async function syncToDb() {
  const items = await redis.lrange('analysis:queues', 0, 99);

  if (items.length > 0) {
    const parsed = items.map((item) => JSON.parse(item));

    // Bulk insert analysis data into the database
    await analysisRepository.createAnalysis(parsed);

    await redis.ltrim('analysis:queues', items.length, -1);
  }

  // Sync click counts from Redis to the database

  const stream = redis.scanStream({ match: 'url:*:clicks', count: 100 });

  for await (const keys of stream) {
    if (keys.length === 0) continue;

    const pipeline = redis.pipeline();
    keys.forEach((key: any) => pipeline.get(key));
    const results = await pipeline.exec();

    const deletePipeline = redis.pipeline();

    results?.forEach(([err, clicks], i) => {
      if (err || !clicks) return;

      const shortCode = keys[i].split(':')[1];
      urlRepository.incrementClickCount(shortCode, Number(clicks));
      deletePipeline.del(keys[i]);
    });

    await deletePipeline.exec();
  }
}
