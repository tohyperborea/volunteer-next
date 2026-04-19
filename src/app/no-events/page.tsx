import metadata from '@/i18n/metadata';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

const PAGE_KEY = 'NoEventsPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async () => {
    const t = await getTranslations(PAGE_KEY);
    return t('title');
  }
});

export default async function NoEventsPage() {
  const t = await getTranslations(PAGE_KEY);
  return (
    <Flex direction="column" gap="4" mt="4">
      <Heading size="5" as="h1">
        {t('title')}
      </Heading>

      <p>{t('description')}</p>
    </Flex>
  );
}
