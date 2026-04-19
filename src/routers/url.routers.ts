import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import urlControllers from '../controllers/url.controllers.js';
import { createUrlSchema, shortUrlSchema, updatedShortCodeSchema } from '../dtos/url.dto.js';


const router = express.Router();

router.post(
  '/shorten',
  validate(createUrlSchema),
  urlControllers.createShortUrl,
);

router
  .route('/:shortCode')
  .get(validate(shortUrlSchema, 'params'), urlControllers.redirectToOriginalUrl)
  .patch(
    validate(updatedShortCodeSchema),
    validate(shortUrlSchema, 'params'),
    urlControllers.addCustomAlias,
  )
  .delete(validate(shortUrlSchema, 'params'), urlControllers.deleteShortUrl);


export default router;
