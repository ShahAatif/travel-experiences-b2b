import type { NextMiddlewareConfig } from 'next/dist/server/web/types';

export const config: NextMiddlewareConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
  },
};
