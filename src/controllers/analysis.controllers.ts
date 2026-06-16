import { string } from 'zod';
import AnalysisServices from '../services/analysis.services.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { UpdateShortCodeDto } from '../dtos/url.dto.js';

class AnalysisController {
  getAnalysis = catchAsync(async (req, res) => {
    const { shortCode } = req.params;
    const analysisData =
      await AnalysisServices.getAnalysisByShortCode(shortCode);

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopCountries = catchAsync(async (req, res) => {
    const { shortCode } = req.params;
    const analysisData = await AnalysisServices.getAnalysisByTopCountries(
      shortCode as UpdateShortCodeDto,
    );

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopDevices = catchAsync(async (req, res) => {
    const { shortCode } = req.params;
    const analysisData =
      await AnalysisServices.getAnalysisByTopDevices(shortCode);

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopBrowsers = catchAsync(async (req, res) => {
    const { shortCode } = req.params;
    const analysisData =
      await AnalysisServices.getAnalysisByTopBrowsers(shortCode);

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopOS = catchAsync(async (req, res) => {
    const { urlId } = req.params;
    const analysisData = await AnalysisServices.getAnalysisByTopOS(
      urlId as string,
    );

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopReferrers = catchAsync(async (req, res) => {
    const { urlId } = req.params;
    const analysisData = await AnalysisServices.getAnalysisByTopReferrers(
      urlId as string,
    );

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });
}

export default new AnalysisController();
