/**
 * Metadata generator for internationalized pages
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import { Metadata } from 'next';
import { getTranslations, RequestConfig } from 'next-intl/server';

interface MetadataProps {
  params: Promise<RequestConfig>;
}

export default (namespace: string) =>
  async ({ params }: MetadataProps): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });
    return {
      title: `${t('title')} - ${process.env.APP_NAME}`
    };
  };
