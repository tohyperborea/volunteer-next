import metadata from '@/i18n/metadata';
import LinkCard, { LinkCardList, LinkCardContent } from '@/ui/link-card';
import LinkMenu, { SubLinkMenu } from '@/ui/link-menu';
import { getQualificationsPath, getTeamsPath } from '@/utils/path';
import { Flex, Heading, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NextLink from 'next/link';
import { getCurrentEvent, getCurrentEventOrRedirect } from '@/session';

const PAGE_KEY = 'DashboardPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async () => {
    const event = await getCurrentEvent();
    return event?.name ?? '';
  }
});

export default async function DashboardPage() {
  const t = await getTranslations(PAGE_KEY);
  const event = await getCurrentEventOrRedirect();

  if (!event) {
    notFound();
  }

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{event.name}</Heading>
      <LinkCardList>
        <LinkCard href={getTeamsPath()}>
          <LinkCardContent pretext={t('manageMy')} text={t('teams')} />
        </LinkCard>
        <LinkCard href="">
          <LinkCardContent pretext={t('manageMy')} text={t('volunteers')} />
        </LinkCard>
      </LinkCardList>
      <LinkMenu>
        <SubLinkMenu title="TODO: TEAMS">
          <Link color="gray">TODO: VIEW ALL TEAMS</Link>
          <Link color="gray">TODO: MY TEAM</Link>
        </SubLinkMenu>
        <SubLinkMenu title={t('qualifications')}>
          <Link asChild>
            <NextLink href={getQualificationsPath()}>{t('createQualifications')}</NextLink>
          </Link>
          <Link color="gray">{t('assignQualifications')}</Link>
          <Link color="gray">{t('requests')}</Link>
        </SubLinkMenu>
        <SubLinkMenu title="TODO: EVENTS">
          <Link color="gray">TODO: 2026</Link>
          <Link color="gray">TODO: 2025</Link>
          <Link color="gray">TODO: VIEW ALL EVENTS</Link>
        </SubLinkMenu>
      </LinkMenu>
    </Flex>
  );
}
