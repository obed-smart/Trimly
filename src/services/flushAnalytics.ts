import redis from '../config/redis.config.js';
import DeviceDetector from 'node-device-detector';
import geoip from 'geoip-lite';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json' with { type: 'json' };

import analysisRepository from '../repository/analysis.repository.js';
import urlRepository from '../repository/url.repository.js';
import logger from '../utils/logger.js';
import { analyticsQueue } from '../queue/  queue.js';

countries.registerLocale(en);

const detector = new (DeviceDetector as any)({
  clientIndexes: true,
  deviceIndexes: true,
  osIndexes: true,
  deviceAliasCode: false,
  deviceTrusted: false,
  deviceInfo: false,
  maxUserAgentSize: 500,
});

export async function syncToDb() {
  const items = await redis.lrange('analysis:queues', 0, 1500);

  if (items.length > 0) {
    const processedData = items.map((item) => {
      const raw = JSON.parse(item);

      const result = detector.detect(raw.userAgent);
      const geo = raw.ipAddress ? geoip.lookup(raw.ipAddress) : null;
      const countryName = geo ? countries.getName(geo.country, 'en') : null;

      return {
        urlId: raw.urlId,
        shortCode: raw.shortCode,
        referrer: raw.referrer,
        ipAddress: raw.ipAddress || null,
        country: countryName || null,
        city: geo?.city || null,
        device: result.device?.type || 'desktop',
        browser: result.client?.name || 'unknown',
        os: result.os?.name || 'unknown',
        latitude: geo?.ll?.[0] || null,
        longitude: geo?.ll?.[1] || null,
        clickedAt: raw.timestamp ? new Date(raw.timestamp) : new Date(),
      };
    });

    await analysisRepository.createAnalysis(processedData);

    await redis.ltrim('analysis:queues', items.length, -1);
  }

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

export const setupAnalyticsCron = async () => {
  try {
    const schedulerId = 'fallback-flush-scheduler';

    await analyticsQueue.removeJobScheduler(schedulerId).catch(() => {});

    await analyticsQueue.upsertJobScheduler(
      schedulerId,
      {
        pattern: '*/5 * * * *',
      },
      {
        name: 'flush-analytics',
        data: {},
        opts: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      },
    );

    logger.info('Analytics background scheduler initialized cleanly ⏱️');
  } catch (error) {
    logger.error(`Failed to setup analytics scheduler: ${error}`);
  }
};
