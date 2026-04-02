import { nanoid } from 'nanoid';
import urlRepository from '../repository/url.repository.js';
import { CreateUrlDto } from '../dtos/createUrlDto.js';
import AppError from '../utils/appErros.js';

class UrlService {
  async createShortUrl(createUrlDto: CreateUrlDto) {
    const existingUrl = await urlRepository.findByOriginalUrl(
      createUrlDto.originalUrl,
    );

    if (existingUrl) {
      return existingUrl;
    }

    const shortUrl = nanoid(7);

    createUrlDto.shortUrl = shortUrl;

    if (createUrlDto.customAlias) {
      const aliasExists = await urlRepository.findByCustomAlias(
        createUrlDto.customAlias,
      );
      if (aliasExists) {
        throw new AppError('Custom alias already in use', 400);
      }
    }

    return await urlRepository.createUrlShorten(createUrlDto);
  }

  async getUrl(shortUrl: string) {
    const urlData = await urlRepository.findByShortUrl(shortUrl);

    if (!urlData) {
      throw new AppError('Short URL not found', 404);
    }

    return urlData;
  }

  async deleteShortUrl(shortUrl: string) {}
}

export default new UrlService();
