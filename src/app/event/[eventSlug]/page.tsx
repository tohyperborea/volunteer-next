import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Flex } from '@radix-ui/themes';
import { ClipboardIcon, PersonIcon } from '@radix-ui/react-icons';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NavSquare from '@/ui/navSquare';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@radix-ui/react-accordion';

const PAGE_KEY = 'EventDashboardPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = !eventSlug ? null : await getEventBySlug(eventSlug);
    return event?.name ?? '';
  }
});

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function EventPage({ params }: Props) {
  const t = await getTranslations(PAGE_KEY);
  const { eventSlug } = await params;
  const event = eventSlug ? await getEventBySlug(eventSlug) : null;

  if (!event) {
    notFound();
  }

  return (
    <Flex direction="column" gap="4" p="4" style={{ width: '100%' }}>
      {/* nav square row */}
      <Flex style={{ width: '100%', justifyContent: 'space-around' }} align="center">
        <NavSquare icon={<PersonIcon width={40} height={40} />} text={t('volunteers')} />
        <NavSquare icon={<ClipboardIcon width={40} height={40} />} text={t('shifts')} />
      </Flex>
      <Accordion type="multiple">
        <AccordionItem value="teams">
          <AccordionTrigger>{t('teams')}</AccordionTrigger>
          <AccordionContent>
            <div>
              <h2>Teams</h2>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shifts">
          <AccordionTrigger>{t('shifts')}</AccordionTrigger>
          <AccordionContent>
            <div>
              <h2>Shifts</h2>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}
