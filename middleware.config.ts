import type { NextMiddlewareConfig } from 'next/dist/server/web/types';

export const config: NextMiddlewareConfig = {
  env: {
    JWT_SECRET: 'dev-jwt-secret-key-at-least-32-characters-long',
    JWT_EXPIRY: '7d',
  },
};