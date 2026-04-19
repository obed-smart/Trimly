import { CreateAnalysisDto } from '../dtos/analysis.dto.js';
import Analysis from '../model/analysis.model.js';

class AnalysisRepository {
  async createAnalysis(AnalysisData: CreateAnalysisDto) {
    return await Analysis.create(AnalysisData);
  }
}

export default new AnalysisRepository();
