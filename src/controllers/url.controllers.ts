import { Request, Response } from 'express';
import UrlService from '../services/url.services.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { CreateUrlDto } from '../dtos/url.dto.js';

class UrlController {
  createShortUrl = catchAsync(async (req, res): Promise<void> => {
    const url: CreateUrlDto = req.body;
    const reqBody = {
      userId: req.user?._id ?? null,
      anonymousId: req.anonymousId ?? null,
    };

  logger.debug({ url, reqBody : 'Creating short URL with the provided data' });
    const result = await UrlService.createShortUrl(url, reqBody);

    logger.info('shortCode created successfully');
    res.status(201).json(
      ApiResponse.success({
        shortUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}/${result.shortCode}`,
        message: 'link shorten successfully',
      }),
    );
  });

  redirectToOriginalUrl = catchAsync(async (req: Request, res: Response) => {
    const data = {
      userAgent: req.headers['user-agent'] || '',

      referrer: req.headers['referer'] || '',

      ipAddress: req.ip || '',

      shortCode: req.params.shortCode,
    };

    const urlData = await UrlService.redirectToOriginalUrl(data);

    logger.info('Redirecting to original URL');
    res.redirect(302, urlData.originalUrl);
  });

  addCustomAlias = catchAsync(async (req, res) => {
    const { shortCode } = req.params;
    const { customAlias } = req.body;

    const updatedUrl = await UrlService.addCustomAlias(
      shortCode as string,
      customAlias,
    );

    logger.info('Custom alias added successfully');
    res.status(200).json(
      ApiResponse.success({
        shortUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}/${updatedUrl?.shortCode}`,
        message: 'Custom alias added successfully',
      }),
    );
  });

  deleteShortUrl = catchAsync(async (req, res) => {
    const { shortCode } = req.params;

    await UrlService.deleteShortUrl(shortCode as string);

    logger.info('Short URL deleted successfully');
    res.status(200).json(
      ApiResponse.success({
        message: 'Short URL deleted successfully',
      }),
    );
  });
}

export default new UrlController();
