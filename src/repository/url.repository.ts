import UrlShorten from '../model/urlShorten.model.js';
import { CreateUrlDto } from '../dtos/createUrlDto.js';

class UrlShortenRepository {
  async createUrlShorten(data: CreateUrlDto) {
    return await UrlShorten.create(data);
  }

  async findByShortUrl(shortUrl: string) {
    return await UrlShorten.findOne({ shortUrl });
  }

  async findByOriginalUrl(originalUrl: string) {
    return await UrlShorten.findOne({ originalUrl });
  }

  async findByCustomAlias(customAlias: string) {
    return await UrlShorten.findOne({ customAlias });
  }
}

export default new UrlShortenRepository();
