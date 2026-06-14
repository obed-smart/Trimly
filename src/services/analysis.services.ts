import DeviceDetector from 'node-device-detector';
import geoip from 'geoip-lite';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

import AnalysisRepository from '../repository/analysis.repository.js';

countries.registerLocale(en);

import logger from '../utils/logger.js';
import { AnalysisInput } from '../dtos/analysis.dto.js';
import redis from '../config/redis.config.js';
import { pipe } from 'zod';
import { UpdateShortCodeDto } from '../dtos/url.dto.js';
import { analyticsQueue } from '../queue/  queue.js';

const detector = new (DeviceDetector as any)({
  clientIndexes: true,
  deviceIndexes: true,
  osIndexes: true,
  deviceAliasCode: false,
  deviceTrusted: false,
  deviceInfo: false,
  maxUserAgentSize: 500,
});

export type AnalysisContext = {
  shortCode: string;
  userAgent: string;
  referrer: string | null;
  ipAddress: string | null;
  urlId: string;
};

class AnalysisService {
  async createAnalysis(context: AnalysisContext) {
    const result = detector.detect(context.userAgent);

    console.log(context.ipAddress, 'Context IP address');

    const geo = geoip.lookup('105.112.125.252');

    const countryName = countries.getName(geo?.country as string, 'en');

    const browser = result.client?.name || 'unknown';
    const device = result.device?.type || 'desktop';
    const os = result.os?.name || 'unknown';
    const referrer = context.referrer || 'direct';

    const analysisData = {
      urlId: context.urlId || '',
      shortCode: context.shortCode,
      referrer: referrer,
      ipAddress: context.ipAddress || null,
      country: countryName || null,
      city: geo?.city || null,
      device: device,
      browser: browser,
      os: os,
      latitude: geo?.ll[0],
      longitude: geo?.ll[1],
    };

    const pipeline = redis.pipeline();

    pipeline.rpush(`analysis:queues`, JSON.stringify(analysisData));

    pipeline.incr(`url:clicks:${context.shortCode}`);

    pipeline.hincrby(
      `analysis:${context.shortCode}:countries`,
      countryName || 'unknown',
      1,
    );

    pipeline.hincrby(`analysis:${context.shortCode}:device`, device, 1);
    pipeline.hincrby(`analysis:${context.shortCode}:browser`, browser, 1);
    pipeline.hincrby(`analysis:${context.shortCode}:os`, os, 1);
    pipeline.hincrby(`analysis:${context.shortCode}:referrer`, referrer, 1);

    await pipeline.exec();

    await analyticsQueue.add(
      'flush-analytics',

      {},

      {
        delay: 30000,

        jobId: 'analytics-flush',
      },
    );
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
