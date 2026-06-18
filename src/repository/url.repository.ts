import { UpdateQuery } from 'mongoose';
import { CreateUrlDto } from '../dtos/url.dto.js';
import UrlShorten, { IUrlShorten } from '../model/urlShorten.model.js';

class UrlShortenRepository {
  async createUrlShorten(data: CreateUrlDto) {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    return await UrlShorten.create(cleanedData as any);
  }

  async findByShortCode(shortCode: string) {
    return await UrlShorten.findOne({ shortCode });
  }

  async findByOriginalUrl(originalUrl: string) {
    return await UrlShorten.findOne({ originalUrl });
  }

  async incrementClickCount(shortCode: string, clicks: number) {
    await UrlShorten.updateOne({ shortCode }, { $inc: { clickCount: clicks } });
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

  async findAndUpdateAnonymousId(
    anonymousId: string,
    updateFields: UpdateQuery<IUrlShorten>,
  ): Promise<void> {
    await UrlShorten.updateMany(
      { anonymousId },
      { $set: updateFields },
      { runValidators: true },
    );
  }
}

export default new UrlShortenRepository();
