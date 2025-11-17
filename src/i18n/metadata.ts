/**
 * Metadata generator for internationalized pages
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Params = Record<string, string | undefined>;
type SearchParams = Record<string, string | string[] | undefined>;

interface MetadataProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

interface MetadataGeneratorOptions {
  title?: (params: Params) => Promise<string>;
}

export default (namespace: string, options?: MetadataGeneratorOptions) =>
  async ({ params }: MetadataProps): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale ?? '', namespace });
    const title = options?.title ? await options.title(await params) : t('title');
    return {
      title: `${title} | ${process.env.APP_NAME}`
    };
  };
