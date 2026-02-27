import metadata from '@/i18n/metadata';
import { getTeamBySlug } from '@/service/team-service';
import ShiftList from '@/ui/shift-list';
import { getTeamShiftsPath } from '@/utils/path';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

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
    name: 'Morning Setup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-01T08:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 3,
    isActive: true
  },
  {
    id: 'mock-shift-2',
    name: 'Afternoon Cleanup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-01T16:00:00Z'),
    durationHours: 3,
    minVolunteers: 2,
    maxVolunteers: 5,
    isActive: true
  },
  {
    id: 'mock-shift-3',
    name: 'Evening Support',
    teamId: 'mock-team',
    startTime: new Date('2024-07-01T20:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 4,
    isActive: true
  },
  {
    id: 'mock-shift-1',
    name: 'Morning Setup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-02T08:00:00Z'),
    durationHours: 4,
    minVolunteers: 1,
    maxVolunteers: 3,
    isActive: true
  },
  {
    id: 'mock-shift-2',
    name: 'Afternoon Cleanup',
    teamId: 'mock-team',
    startTime: new Date('2024-07-02T16:00:00Z'),
    durationHours: 3,
    minVolunteers: 2,
    maxVolunteers: 5,
    isActive: true
  },
  {
    id: 'mock-shift-3',
    name: 'Evening Support',
    teamId: 'mock-team',
    startTime: new Date('2024-07-02T20:00:00Z'),
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

  const onSaveShift = async (data: FormData) => {
    'use server';
    console.log('Saving shift with data:', Object.fromEntries(data.entries()));
    // TODO: authorisation
    // TODO: validation
    // TODO: save shift
    redirect(getTeamShiftsPath(eventSlug, teamSlug));
  };

  const onDeleteShift = async (data: FormData) => {
    'use server';
    console.log('Deleting shift with data:', Object.fromEntries(data.entries()));
    // TODO: authorisation
    // TODO: validation
    // TODO: save shift
    redirect(getTeamShiftsPath(eventSlug, teamSlug));
  };

  return <ShiftList shifts={MOCK_SHIFTS} onSaveShift={onSaveShift} onDeleteShift={onDeleteShift} />;
}
