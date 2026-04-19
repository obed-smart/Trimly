import DeviceDetector from 'node-device-detector';
import geoip from 'geoip-lite';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

import AnalysisRepository from '../repository/analysis.repository.js';

countries.registerLocale(en);

import logger from '../utils/logger.js';
import { AnalysisInput } from '../dtos/analysis.dto.js';

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

    const analysisData = {
      urlId: context.urlId || '',
      referrer: context.referrer || null,
      ipAddress: context.ipAddress || null,
      country: countryName || null,
      city: geo?.city || null,
      device: result.device?.type || 'desktop',
      browser: result.client?.name || 'unknown',
      os: result.os?.name || 'unknown',
      latitude: geo?.ll[0],
      longitude: geo?.ll[1],
    };

    await AnalysisRepository.createAnalysis(analysisData);
  }

  async getAnalysisByUrlId(urlId: string) {
    return AnalysisRepository.findAllByUrlId(urlId);
  }

  async getAnalysisByTopCountries(urlId: string) {
    return AnalysisRepository.getTopCountries(urlId);
  }

  async getAnalysisByTopReferrers(urlId: string) {
    return AnalysisRepository.getTopReferrers(urlId);
  }

  async getAnalysisByTopDevices(urlId: string) {
    return AnalysisRepository.getTopDevices(urlId);
  }

  async getAnalysisByTopBrowsers(urlId: string) {
    console.log(Date.now());
    return AnalysisRepository.getTopBrowsers(urlId);
  }

  async getAnalysisByTopOS(urlId: string) {
    return AnalysisRepository.getTopOperatingSystems(urlId);
  }
}

export default new AnalysisService();
