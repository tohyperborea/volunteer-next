/**
 * CSV Export functions
 * @since 2026-03-11
 * @author Michael Townsend <@continuities>
 */

import { eventDayToDate } from '@/utils/datetime';

const escapeForCSV = (value: string): string => {
  if (
    value.startsWith('\t') ||
    value.includes('"') ||
    value.includes(',') ||
    value.includes('\r') ||
    value.includes('\n')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// https://owasp.org/www-community/attacks/CSV_Injection
// https://georgemauer.net/2017/10/07/csv-injection.html
const preventCSVInjection = (value: string): string => {
  if (
    value.startsWith('=') ||
    value.startsWith('+') ||
    value.startsWith('-') ||
    value.startsWith('@')
  ) {
    return `\t${value}`;
  }
  return value;
};

/**
 * Exports shift data to CSV format
 * @param props.event The event information
 * @param props.teams The teams associated with the event
 * @param props.shifts The shifts for the event
 * @param props.shiftVolunteers A mapping of shift IDs to their assigned volunteers
 * @returns A string in CSV format representing the shift data
 */
export const shiftsToCSV = ({
  event,
  teams,
  shifts,
  shiftVolunteers
}: {
  event: EventInfo;
  teams: TeamInfo[];
  shifts: ShiftInfo[];
  shiftVolunteers: Record<ShiftId, User[]>;
}): string => {
  const teamNames = teams.reduce<Record<TeamId, string>>((acc, team) => {
    acc[team.id] = team.name;
    return acc;
  }, {});
  const sortedShifts = [...shifts].sort((a, b) => {
    const dayDiff = a.eventDay - b.eventDay;
    if (dayDiff !== 0) {
      return dayDiff;
    }
    return a.startTime.localeCompare(b.startTime);
  });
  return [
    ['Date', 'Team', 'Shift Title', 'Start Time', 'Duration (Hours)', 'Volunteers'].join(','),
    ...sortedShifts.map((shift) => {
      const volunteers = shiftVolunteers[shift.id] ?? [];
      const volunteerRow = volunteers.map((v) => `${v.name} <${v.email}>`).join('\r');
      return [
        eventDayToDate(event.startDate, shift.eventDay).toISOString().split('T')[0],
        escapeForCSV(preventCSVInjection(teamNames[shift.teamId])),
        escapeForCSV(preventCSVInjection(shift.title)),
        shift.startTime,
        shift.durationHours,
        escapeForCSV(preventCSVInjection(volunteerRow))
      ].join(',');
    })
  ].join('\r\n');
};
