import { Router } from 'express';
import AnalysisController from '../controllers/analysis.controllers.js';
import validate from '../middlewares/validate.middleware.js';
import { updatedShortCodeSchema } from '../dtos/url.dto.js';

const router = Router();

router.get(
  '/:shortCode/top-countries',
  validate(updatedShortCodeSchema, 'params'),
  AnalysisController.getAnalysisByTopCountries,
);

router.get(
  '/:shortCode/top-devices',
  validate(updatedShortCodeSchema, 'params'), 
  AnalysisController.getAnalysisByTopDevices,
);

router.get(
  '/:shortCode/top-browsers',
  validate(updatedShortCodeSchema, 'params'),
  AnalysisController.getAnalysisByTopBrowsers,
);

router.get(
  '/:shortCode/top-referrers',
  validate(updatedShortCodeSchema, 'params'),
  AnalysisController.getAnalysisByTopReferrers,
);

router.get('/:shortCode/top-os', AnalysisController.getAnalysisByTopOS);

router.get(
  '/:shortCode',
  validate(updatedShortCodeSchema, 'params'),
  AnalysisController.getAnalysis,
);
export default router;
