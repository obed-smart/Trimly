import { Router } from 'express';
import AnalysisController from '../controllers/analysis.controllers.js';

const router = Router();

router.get('/:urlId', AnalysisController.getAnalysis);
router.get(
  '/:urlId/top-countries',
  AnalysisController.getAnalysisByTopCountries,
);
router.get('/:urlId/top-devices', AnalysisController.getAnalysisByTopDevices);
router.get('/:urlId/top-browsers', AnalysisController.getAnalysisByTopBrowsers);
router.get(
  '/:urlId/top-referrers',
  AnalysisController.getAnalysisByTopReferrers,
);
router.get('/:urlId/top-os', AnalysisController.getAnalysisByTopOS);

export default router;
