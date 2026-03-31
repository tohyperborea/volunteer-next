/**
 * Email template for volunteer shift emails
 * @since 2026-03-31
 * @author Michael Townsend <@continuities>
 */

import { getListByDate } from '@/utils/date';
import { addHoursToTimeString, eventDayToDate } from '@/utils/datetime';
import { getTranslations } from 'next-intl/server';

const TEMPLATE_KEY = 'ShiftEmail';

interface Props {
  name: string;
  event: EventInfo;
  shifts: ShiftInfo[];
  teams: TeamInfo[];
}

const ShiftRow = ({ shift, team }: { shift: ShiftInfo; team: TeamInfo | undefined }) => (
  <>
    {shift.title}
    {team ? ` (${team.name})` : ''} {shift.startTime} to{' '}
    {addHoursToTimeString(shift.startTime, shift.durationHours)}
  </>
);

export async function body({ event, name, shifts, teams }: Props) {
  const t = await getTranslations(TEMPLATE_KEY);
  const teamsById = Object.fromEntries(teams.map((team) => [team.id, team]));
  const shiftsByDate = getListByDate(shifts, (s) => eventDayToDate(event.startDate, s.eventDay));
  return (
    <>
      <p>{t('greeting', { name })}</p>
      <p>{t('thanks', { eventName: event.name })}</p>
      <p>{t('yourShifts')}</p>
      <ul>
        {Object.entries(shiftsByDate).map(([date, shifts]) => (
          <li key={date}>
            <strong>{date}</strong>
            <ul>
              {shifts.map((shift) => (
                <li key={shift.id}>
                  <ShiftRow shift={shift} team={teamsById[shift.teamId]} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p>{t('closing', { eventName: event.name })}</p>
    </>
  );
}

export async function subject({ event, shifts }: Props) {
  const t = await getTranslations(TEMPLATE_KEY);
  return t('subject', { eventName: event.name });
}
