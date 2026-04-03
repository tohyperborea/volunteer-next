/**
 * Email template for volunteer notification emails
 * @since 2026-04-01
 * @author Michael Townsend <@continuities>
 */

import { getListByDate } from '@/utils/date';
import { addHoursToTimeString, eventDayToDate } from '@/utils/datetime';
import { getTranslations } from 'next-intl/server';

const TEMPLATE_KEY = 'NotifyEmail';

interface BaseProps {
  body: string;
  subject: string;
}

interface PropsWithShifts extends BaseProps {
  event: EventInfo;
  shifts: ShiftInfo[];
  teams: TeamInfo[];
}

interface PropsWithoutShifts extends BaseProps {
  event?: never;
  shifts?: never;
  teams?: never;
}

type Props = PropsWithShifts | PropsWithoutShifts;

const ShiftList = ({
  event,
  shifts,
  teams
}: {
  event: EventInfo;
  shifts: ShiftInfo[];
  teams: TeamInfo[];
}) => {
  const teamsById = Object.fromEntries(teams.map((team) => [team.id, team]));
  const shiftsByDate = getListByDate(shifts, (s) => eventDayToDate(event.startDate, s.eventDay));
  return (
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
  );
};

const ShiftRow = ({ shift, team }: { shift: ShiftInfo; team: TeamInfo | undefined }) => (
  <>
    {shift.title}
    {team ? ` (${team.name})` : ''} {shift.startTime} to{' '}
    {addHoursToTimeString(shift.startTime, shift.durationHours)}
  </>
);

export async function body(props: Props) {
  const t = await getTranslations(TEMPLATE_KEY);
  return (
    <>
      <pre>{props.body}</pre>
      {props.shifts && (
        <>
          <p>{t('yourShifts')}</p>
          <ShiftList event={props.event} shifts={props.shifts} teams={props.teams} />
        </>
      )}
    </>
  );
}

export async function subject({ subject }: Props) {
  return subject;
}
