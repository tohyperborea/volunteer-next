import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NavSquare from '@/ui/navSquare';
import NavRectangle from '@/ui/navRectangle';
import { currentUser } from '@/session';
import { USER_ROLE_HIERARCHY } from '@/constants';
import styles from './styles.module.css';
import { getShiftsAssignedToUser } from '@/service/shift-service';

const PAGE_KEY = 'EventDashboardPage';

const RECTANGLE_NAVS = [
  {
    title: 'findShifts',
    href: '/event/[eventSlug]/find-shifts',
    minRole: 'volunteer'
  },
  {
    title: 'qualifications',
    href: '/event/[eventSlug]/qualifications',
    minRole: 'team-lead'
  },
  {
    title: 'teams',
    href: '/event/[eventSlug]/teams',
    minRole: 'team-lead'
  },
  {
    title: 'eventSettings',
    href: '/event/[eventSlug]/settings',
    minRole: 'organiser'
  }
];

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

  const user = await currentUser();
  const userRoles = user?.roles ?? [];
  const allowedNavs = RECTANGLE_NAVS.filter((nav) => {
    if (nav.minRole) {
      return userRoles.some(
        (role) =>
          USER_ROLE_HIERARCHY.indexOf(role.type as UserRole['type']) >=
          USER_ROLE_HIERARCHY.indexOf(nav.minRole as unknown as UserRole['type'])
      );
    }
    return true;
  });

  const userShiftsAssigned = await getShiftsAssignedToUser(user?.id ?? '');
  const userShiftsAssignedCount = userShiftsAssigned?.length ?? 0;
  const hoursWorked =
    userShiftsAssigned?.reduce(
      (acc, shift) => acc + (shift.endTime.getTime() - shift.startTime.getTime()) / 1000 / 60 / 60,
      0 as number
    ) ?? 0;

  return (
    <Flex direction="column" gap="4" p="4" style={{ width: '100%' }}>
      {/* nav square row */}
      <Flex align="center" gap="4" className={styles.navSquareRow}>
        <NavSquare>
          <Flex direction="column" align="center">
            <Text>{t('yourHours')}</Text>
            <Text size="6" weight="bold">
              {hoursWorked.toFixed(2)}
            </Text>
          </Flex>
        </NavSquare>
        <NavSquare>
          <Flex direction="column" align="center">
            <Text>{t('yourShifts')}</Text>
            <Text size="6" weight="bold">
              {userShiftsAssignedCount}
            </Text>
          </Flex>
        </NavSquare>
      </Flex>
      {allowedNavs.map((nav) => (
        <NavRectangle key={nav.title}>
          <Text id="foo" size="6">
            {t(nav.title)}
          </Text>
        </NavRectangle>
      ))}
    </Flex>
  );
}
