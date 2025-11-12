import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  experimental: {
    // This allows us to use the 'unauthorized' helper
    authInterrupts: true
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
