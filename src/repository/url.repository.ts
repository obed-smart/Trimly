import { CreateUrlDto } from '../dtos/url.dto.js';
import UrlShorten from '../model/urlShorten.model.js';


class UrlShortenRepository {
  async createUrlShorten(data: CreateUrlDto) {
    return await UrlShorten.create(data);
  }

  async findByShortCode(shortCode: string) {
    return await UrlShorten.findOne({ shortCode });
  }

  async findByOriginalUrl(originalUrl: string) {
    return await UrlShorten.findOne({ originalUrl });
  }

  async incrementClickCount(shortCode: string) {
    await UrlShorten.updateOne({ shortCode }, { $inc: { clickCount: 1 } });
  }

  async findAndUpdateShortCode(shortCode: string, customAlias: string) {
    return await UrlShorten.findOneAndUpdate(
      { shortCode },
      { shortCode: customAlias },
      { new: true, runValidators: true },
    );
  }

  async findAndDeleteByShortCode(shortCode: string) {
    return await UrlShorten.findOneAndDelete({ shortCode });
  }

  /// fast check for performance

  async shortCodeExists(shortCode: string) {
    return await UrlShorten.exists({ shortCode });
  }
}

export default new UrlShortenRepository();
