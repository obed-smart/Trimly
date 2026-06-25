import AnalysisRepository from '../repository/analysis.repository.js';

import logger from '../utils/logger.js';
import redis from '../config/redis.config.js';
import { UpdateShortCodeDto } from '../dtos/url.dto.js';
import { analyticsQueue } from '../queue/  queue.js';

export type AnalysisContext = {
  shortCode: string;
  userAgent: string;
  referrer: string | null;
  ipAddress: string | null;
  urlId: string;
};

class AnalysisService {
  async createAnalysis(context: AnalysisContext) {
    const rawPayload = {
      urlId: context.urlId || '',
      shortCode: context.shortCode,
      referrer: context.referrer || 'direct',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: Date.now(),
    };

    const pipeline = redis.pipeline();
    pipeline.rpush(`analysis:queues`, JSON.stringify(rawPayload));
    pipeline.incr(`url:clicks:${context.shortCode}`);

    // inclrement a buffer counter to help track the munber of analysis stored (1k max before flush)
    pipeline.incr(`analysis:buffer:count`);

    const results = await pipeline.exec();

    const currentBufferCount = Number(results?.[2]?.[1] || 0);

    if (currentBufferCount >= 1000) {
      await redis.set(`analysis:buffer:count`, 0);

      await analyticsQueue.add(
        'flush-analytics',
        {},
        {
          jobId: `flush-${Date.now()}`,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    }
  }

  async getAnalysisByShortCode(shortCode: UpdateShortCodeDto) {
    const cacheKey = `analysis:queue`;

    const cachedData = await redis.lrange(cacheKey, 0, -1);

    if (cachedData.length > 0) {
      logger.info(
        { cacheKey, cachedDataLength: cachedData.length },
        'Fetching analysis data from cache:',
      );

      return cachedData.map((item: string) => JSON.parse(item));
    }

    const data = await AnalysisRepository.findAllByShortCode(shortCode);

    await redis.rpush(cacheKey, ...data.map((item) => JSON.stringify(item)));

    logger.info(
      { cacheKey, dataLength: data.length },
      'Fetching analysis data from database:',
    );

    return data;
  }

  async getAnalysisByTopCountries(shortCode: UpdateShortCodeDto) {
    const cacheKey = `analysis:${shortCode}:countries`;

    const cachedData = await redis.hgetall(cacheKey);

    if (Object.keys(cachedData).length > 0) {
      logger.info(
        { cacheKey, cachedData },
        'cache hit for top countries analysis:',
      );

      return cachedData;
    }

    const data = await AnalysisRepository.getTopCountries(shortCode);
    logger.info({ data }, 'Fetched top countries from database:');

    return data;
  }

  async getAnalysisByTopReferrers(shortCode: UpdateShortCodeDto) {
    const cacheKey = `analysis:${shortCode}:referrers`;

    const cachedData = await redis.hgetall(cacheKey);

    if (Object.keys(cachedData).length > 0) {
      logger.info(
        { cacheKey, cachedData },
        'cache hit for top referrers analysis:',
      );

      return cachedData;
    }

    const data = await AnalysisRepository.getTopReferrers(shortCode);
    logger.info({ data }, 'Fetched top referrers from database:');

    return data;
  }

  async getAnalysisByTopDevices(shortCode: UpdateShortCodeDto) {
    const cacheKey = `analysis:${shortCode}:devices`;

    const cachedData = await redis.hgetall(cacheKey);

    if (Object.keys(cachedData).length > 0) {
      logger.info({ cacheKey, cachedData }, 'cache hit for top devices:');

      return cachedData;
    }

    const data = await AnalysisRepository.getTopDevices(shortCode);
    logger.info({ data }, 'Fetching top devices from database:');

    return data;
  }

  async getAnalysisByTopBrowsers(shortCode: UpdateShortCodeDto) {
    const cacheKey = `analysis:${shortCode}:browsers`;

    const cachedData = await redis.hgetall(cacheKey);

    if (Object.keys(cachedData).length > 0) {
      logger.info({ cacheKey, cachedData }, 'cache hit for top browsers:');

      return cachedData;
    }

    const data = await AnalysisRepository.getTopBrowsers(shortCode);
    logger.info({ data }, 'Fetching top browsers from database:');

    return data;
  }

  async getAnalysisByTopOS(shortCode: UpdateShortCodeDto) {
    const cacheKey = `analysis:${shortCode}:os`;

    const cachedData = await redis.hgetall(cacheKey);

    if (Object.keys(cachedData).length > 0) {
      logger.info(
        { cacheKey, cachedData },
        'cache hit for top operating systems:',
      );

      return cachedData;
    }

    const data = await AnalysisRepository.getTopOperatingSystems(shortCode);
    logger.info({ data }, 'Fetching top operating systems from database:');

    return data;
  }
}

export default new AnalysisService();
