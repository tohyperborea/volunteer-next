import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Required for Docker: bundles a self-contained server into .next/standalone.
  // Without this, the Dockerfile's Stage 3 COPY of .next/standalone will fail.
  output: 'standalone',
  experimental: {
    // This allows us to use the 'unauthorized' helper
    authInterrupts: true
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
