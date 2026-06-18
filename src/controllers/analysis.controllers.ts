import AnalysisServices from '../services/analysis.services.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';

class AnalysisController {
  getAnalysis = catchAsync(async (req, res) => {
   const shortCode = (req.params.shortCode as string) ?? '';

    const analysisData = await AnalysisServices.getAnalysisByShortCode({
      shortCode,
    });

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopCountries = catchAsync(async (req, res) => {
   const shortCode = (req.params.shortCode as string) ?? '';

    const analysisData = await AnalysisServices.getAnalysisByTopCountries({
      shortCode,
    });

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopDevices = catchAsync(async (req, res) => {
  const shortCode = (req.params.shortCode as string) ?? '';

    const analysisData = await AnalysisServices.getAnalysisByTopDevices({
      shortCode,
    });

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopBrowsers = catchAsync(async (req, res) => {
   const shortCode = (req.params.shortCode as string) ?? '';

    const analysisData = await AnalysisServices.getAnalysisByTopBrowsers({
      shortCode,
    });

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopOS = catchAsync(async (req, res) => {
    const shortCode = (req.params.shortCode as string) ?? '';

    const analysisData = await AnalysisServices.getAnalysisByTopOS({
      shortCode,
    });

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });

  getAnalysisByTopReferrers = catchAsync(async (req, res) => {
   const shortCode = (req.params.shortCode as string) ?? '';

    const analysisData = await AnalysisServices.getAnalysisByTopReferrers({
      shortCode,
    });

    res.status(200).json(
      ApiResponse.success({
        results: analysisData.length,
        data: analysisData,
      }),
    );
  });
}

export default new AnalysisController();