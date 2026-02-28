import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { getTeamBySlug } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import ShiftList from '@/ui/shift-list';
import { getTeamShiftsPath } from '@/utils/path';
import { validateExistingShift } from '@/validator/shift-validator';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

const PAGE_KEY = 'TeamPage.ShiftsTab';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const t = await getTranslations(PAGE_KEY);
    const { eventSlug, teamSlug } = params;
    const team = !eventSlug || !teamSlug ? null : await getTeamBySlug(eventSlug, teamSlug);
    return `${t('title')} | ${team?.name ?? ''}`;
  }
});

// TODO: Replace mocks with real data from the backend
const MOCK_SHIFTS: ShiftInfo[] = [
  {
    id: 'mock-shift-1',
    title: 'Morning Setup',
    teamId: 'mock-team',
    eventDay: 0,
    startTime: '08:00',
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 3,
    isActive: true
  },
  {
    id: 'mock-shift-2',
    title: 'Afternoon Cleanup',
    teamId: 'mock-team',
    eventDay: 0,
    startTime: '16:00',
    durationHours: 3,
    minVolunteers: 2,
    maxVolunteers: 5,
    isActive: true
  },
  {
    id: 'mock-shift-3',
    title: 'Evening Support',
    teamId: 'mock-team',
    eventDay: 0,
    startTime: '20:00',
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 4,
    isActive: true
  },
  {
    id: 'mock-shift-1',
    title: 'Morning Setup',
    teamId: 'mock-team',
    eventDay: 1,
    startTime: '08:00',
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 3,
    isActive: true
  },
  {
    id: 'mock-shift-2',
    title: 'Afternoon Cleanup',
    teamId: 'mock-team',
    eventDay: 1,
    startTime: '16:00',
    durationHours: 3,
    minVolunteers: 2,
    maxVolunteers: 5,
    isActive: true
  },
  {
    id: 'mock-shift-3',
    title: 'Evening Support',
    teamId: 'mock-team',
    eventDay: 1,
    startTime: '20:00',
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 4,
    isActive: true
  }
];

interface Props {
  params: Promise<{ eventSlug: string; teamSlug: string }>;
}

export default async function TeamShifts({ params }: Props) {
  const { eventSlug, teamSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  const team = await getTeamBySlug(eventSlug, teamSlug);
  if (!event || !team) {
    notFound();
  }

  const allowedRoles: UserRole[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: team.eventId },
    { type: 'team-lead', eventId: team.eventId, teamId: team.id }
  ];

  const onSaveShift = async (data: FormData) => {
    'use server';
    console.log('Saving shift with data:', Object.fromEntries(data.entries()));
    await checkAuthorisation(allowedRoles);
    const shift = validateExistingShift(data);
    if (data.has('id')) {
      // TODO: update existing shift
    } else {
      // TODO: save new shift
    }
    redirect(getTeamShiftsPath(eventSlug, teamSlug));
  };

  const onDeleteShift = async (data: FormData) => {
    'use server';
    console.log('Deleting shift with data:', Object.fromEntries(data.entries()));
    await checkAuthorisation(allowedRoles);
    const shiftId = data.get('id')?.toString();
    if (!shiftId) {
      throw new Error('Shift id is required for deletion');
    }
    // TODO: delete shift
    redirect(getTeamShiftsPath(eventSlug, teamSlug));
  };

  return (
    <ShiftList
      startDate={event.startDate}
      teamId={team.id}
      shifts={MOCK_SHIFTS}
      onSaveShift={onSaveShift}
      onDeleteShift={onDeleteShift}
    />
  );
}
