import { customAlphabet } from 'nanoid';
import logger from './logger.js';
import AppError from './appErros.js';
import urlRepository from '../repository/url.repository.js';

const MAX_RETRIES = 5;

const nanoid = customAlphabet('abcdefghijkmnopqrstuvwxyz23456789', 8);

export const generateId = async () => {
  let retries = 0;

  try {
    while (retries < MAX_RETRIES) {
      const secretId = nanoid();

      const exists = await urlRepository.shortCodeExists(secretId);
      if (!exists) {
        logger.info({ secretId }, 'Generated unique ID:');
        return secretId;
      }

      retries++;
    }
    throw new AppError('Could not generate unique ID after retries', 500);
  } catch (error) {
    logger.error({ error }, 'Error generating ID:');
    throw new AppError('Failed to generate unique ID', 500);
  }
};

export const RESERVED_SHORTCODES = new Set([
  'admin',
  'login',
  'signup',
  'api',
  'health',
  'docs',
  'dashboard',
  'settings',

  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);
