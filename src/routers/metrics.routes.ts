import { Router } from 'express';
import { register } from '../config/matries.js';

const router = Router();

router.get('/', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

export default router;
