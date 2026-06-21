import urlRepository from '../repository/url.repository.js';
import AnalysisServices, { AnalysisContext } from './analysis.services.js';
import AppError from '../utils/appErros.js';
import { generateId, RESERVED_SHORTCODES } from '../utils/utils.js';
import { CreateUrlDto } from '../dtos/url.dto.js';
import logger from '../utils/logger.js';
import redis from '../config/redis.config.js';
import mongoose from 'mongoose';
import {
  cacheHitsCounter,
  cacheMissesCounter,
  createdUrlLinks,
  redirectRequestCounter,
  redisErrorCounter,
} from '../config/matries.js';

export interface IreqBody {
  userId: mongoose.Types.ObjectId | null;
  anonymousId: string | null;
}

class UrlService {
  async createShortUrl(
    createUrlData: CreateUrlDto,
    reqBody: IreqBody,
  ): Promise<CreateUrlDto> {
    const existingUrl = await urlRepository.findByOriginalUrl(
      createUrlData.originalUrl,
    );

    if (existingUrl) {
      return existingUrl;
    }

    if (createUrlData.shortCode) {
      const alias = createUrlData.shortCode.toLowerCase();

      if (RESERVED_SHORTCODES.has(alias)) {
        throw new AppError(
          'The provided short code is reserved and cannot be used',
          400,
        );
      }

      const alaisExists = await urlRepository.shortCodeExists(alias!);
      if (alaisExists) {
        throw new AppError('custom short code already exists', 400);
      }
    } else {
      createUrlData.shortCode = await generateId();
    }

    const url = await urlRepository.createUrlShorten({
      originalUrl: createUrlData.originalUrl,
      shortCode: createUrlData.shortCode,
      createdByType: reqBody.userId ? 'user' : 'anonymous',
      anonymousId: reqBody.userId ? null : reqBody.anonymousId,
      userId: reqBody.userId ? reqBody.userId : null,
    });

    if (!reqBody.userId) {
      const cacheKey = `anonymous:${reqBody.anonymousId}:urls`;
      await redis.lpush(cacheKey, createUrlData.shortCode);
      await redis.expire(cacheKey, 30 * 24 * 60 * 60);
    }

    createdUrlLinks.inc();

    return url;
  }

  async redirectToOriginalUrl(data: AnalysisContext) {
    logger.info(
      { shortCode: data.shortCode },
      'Redirect request received for short code:',
    );

    const cacheKey = `url:${data.shortCode}`;

    let urlData;

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      urlData = JSON.parse(cachedData);
      logger.debug({ cacheHit: true }, 'Cache hit for short code:');
      cacheHitsCounter.inc();
    } else {
      urlData = await urlRepository.findByShortCode(data.shortCode);
      if (!urlData) {
        throw new AppError('Short URL not found', 404);
      }
      try {
        await redis.set(
          cacheKey,
          JSON.stringify({
            _id: urlData._id,
            originalUrl: urlData.originalUrl,
            shortCode: urlData.shortCode,
          }),
          'EX',
          86400,
        );
      } catch (error) {
        redisErrorCounter.inc({ operation: 'set' });
      }

      logger.debug({ cacheHit: false }, 'Cache miss for short code:');
      cacheMissesCounter.inc();
      

      
    }

    await AnalysisServices.createAnalysis({
      userAgent: data.userAgent,
      referrer: data.referrer as string,
      ipAddress: data.ipAddress as string,
      shortCode: data.shortCode,
      urlId: urlData._id.toString() as string,
    });

    redirectRequestCounter.inc();

    return urlData;
  }

  async addCustomAlias(
    shortCode: string,
    customAlias: string,
  ): Promise<CreateUrlDto | null> {
    const alias = customAlias.toLowerCase();

    if (RESERVED_SHORTCODES.has(alias)) {
      throw new AppError(
        'The provided custom alias is reserved and cannot be used',
        400,
      );
    }

    const aliasExists = await urlRepository.shortCodeExists(alias);
    if (aliasExists) {
      throw new AppError('Custom alias already exists', 400);
    }

    const urlData = await urlRepository.shortCodeExists(shortCode);
    if (!urlData) {
      throw new AppError('Short URL not found', 404);
    }

    return await urlRepository.findAndUpdateShortCode(shortCode, alias);
  }

  async deleteShortUrl(shortCode: string): Promise<void> {
    const urlData = await urlRepository.shortCodeExists(shortCode);
    if (!urlData) {
      throw new AppError('Short URL not found', 404);
    }

    await urlRepository.findAndDeleteByShortCode(shortCode);
  }
}

export default new UrlService();
