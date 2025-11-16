import type { Config } from 'tailwindcss';
import clientConfig from '../client/tailwind.config';

export default {
  ...clientConfig,
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
    // Include client package sources
    '../client/src/**/*.{ts,tsx}',
    '../client/components/**/*.{ts,tsx}',
  ],
} satisfies Config;
