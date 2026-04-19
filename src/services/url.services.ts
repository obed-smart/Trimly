import urlRepository from '../repository/url.repository.js';
import AnalysisServices, { AnalysisContext } from './analysis.services.js';
import AppError from '../utils/appErros.js';
import { generateId, RESERVED_SHORTCODES } from '../utils/utils.js';
import { CreateUrlDto } from '../dtos/url.dto.js';
import logger from '../utils/logger.js';

class UrlService {
  async createShortUrl(createUrlData: CreateUrlDto): Promise<CreateUrlDto> {
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

    return await urlRepository.createUrlShorten(createUrlData);
  }

  async redirectToOriginalUrl(data: AnalysisContext) {
    const urlData = await urlRepository.findByShortCode(data.shortCode);

    if (!urlData) {
      throw new AppError('Short URL not found', 404);
    }

    await Promise.allSettled([
      urlRepository.incrementClickCount(data.shortCode),
      AnalysisServices.createAnalysis({
        userAgent: data.userAgent,
        referrer: data.referrer as string,
        ipAddress: data.ipAddress as string,
        shortCode: data.shortCode,
        urlId: urlData._id.toString(),
      }),
    ]).then((result) => {
      result.forEach((res, index) => {
        if (res.status === 'rejected') {
          logger.error(
            `Failed to process ${index === 0 ? 'click count increment' : 'analysis creation'}: ${res.reason}`,
          );
        }
      });
    });

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
