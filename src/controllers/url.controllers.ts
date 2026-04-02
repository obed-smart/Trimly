import { stat } from 'node:fs';
import { CreateUrlDto } from '../dtos/createUrlDto.js';
import UrlService from '../services/url.services.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

class UrlController {
  createShortUrl = catchAsync(async (req, res) => {
    const url: CreateUrlDto = req.body;
    const result = await UrlService.createShortUrl(url);

    logger.info('shortCode created successfully');
    res
      .status(201)
      .json(
        ApiResponse.success({
          data: result,
          message: 'link shorten successfully',
        }),
      );
  });

  redirectToOriginalUrl = catchAsync(async (req, res) => {
    const urlData = await UrlService.getUrl(req.params.shortUrl as string);

    logger.info('Redirecting to original URL');
    res.redirect(urlData.originalUrl);
  });
}

export default new UrlController();
