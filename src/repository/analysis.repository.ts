import mongoose from 'mongoose';
import { AnalysisInput } from '../dtos/analysis.dto.js';
import Analysis from '../model/analysis.model.js';

class AnalysisRepository {
  async createAnalysis(AnalysisData: AnalysisInput) {
    return await Analysis.create(AnalysisData);
  }

  async findAllByUrlId(urlId: string) {
    return Analysis.find({ urlId }).exec();
  }

  async getTopCountries(urlId: string) {
    const result = await Analysis.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
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

  async getTopDevices(urlId: string) {
    return Analysis.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
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

  async getTopReferrers(urlId: string) {
    return Analysis.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
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

  async getTopBrowsers(urlId: string) {
    return Analysis.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
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

  async getTopOperatingSystems(urlId: string) {
    return Analysis.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
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
