import express from 'express';

const router = express.Router();

router.post('/shorten', );

router.get('/:shortUrl', (req, res) => {
  res.send('Hello World');
});

export default router;
