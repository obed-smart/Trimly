
import { AnalysisInput } from '../dtos/analysis.dto.js';
import Analysis from '../model/analysis.model.js';
import { UpdateShortCodeDto } from '../dtos/url.dto.js';

class AnalysisRepository {
  async createAnalysis(AnalysisData: AnalysisInput[]) {
    return await Analysis.insertMany(AnalysisData, { ordered: false });
  }

  async findAllByShortCode(shortCode: UpdateShortCodeDto) {
    return Analysis.find({ shortCode }).exec();
  }

  async getTopCountries(shortCode: UpdateShortCodeDto) {
    const result = await Analysis.aggregate([
      {
        $match: {
          shortCode: shortCode,
        },
      },

      {
        $group: {
          _id: '$country',
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          country: '$_id',
          total: 1,
        },
      },

      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
    return result;
  }

  async getTopDevices(shortCode: UpdateShortCodeDto) {
    return Analysis.aggregate([
      {
        $match: {
          shortCode: shortCode,
        },
      },

      {
        $group: {
          _id: '$device',
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          device: '$_id',
          total: 1,
        },
      },

      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
  }

  async getTopReferrers(shortCode: UpdateShortCodeDto) {
    return Analysis.aggregate([
      {
        $match: {
          shortCode: shortCode,
        },
      },

      {
        $group: {
          _id: '$referrer',
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          referrer: '$_id',
          total: 1,
        },
      },

      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
  }

  async getTopBrowsers(shortCode: UpdateShortCodeDto) {
    return Analysis.aggregate([
      {
        $match: {
          shortCode: shortCode,
        },
      },

      {
        $group: {
          _id: '$browser',
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          browser: '$_id',
          total: 1,
        },
      },

      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
  }

  async getTopOperatingSystems(shortCode: UpdateShortCodeDto) {
    return Analysis.aggregate([
      {
        $match: {
          shortCode: shortCode,
        },
      },

      {
        $group: {
          _id: '$os',
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          os: '$_id',
          total: 1,
        },
      },

      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
  }
}

export default new AnalysisRepository();
