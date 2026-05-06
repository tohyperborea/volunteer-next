/**
 * Displays a list of shifts from multiple teams, grouped by day
 * @since 2026-03-26
 * @author Michael Townsend <@continuities>
 */

'use client';

import { eventDayToDate } from '@/utils/datetime';
import { Flex, Card, Heading } from '@radix-ui/themes';
import DatedList from '../dated-list';
import ShiftCard from '../shift-card';

interface Props {
  event: EventInfo;
  teams: TeamInfo[];
  shifts: ShiftInfo[];
  shiftVolunteers: Record<ShiftId, VolunteerInfo[]>;
  qualifications: QualificationInfo[];
  onCancelShift?: (shiftId: ShiftId) => Promise<void>;
}

export default function ShiftOverviewList({
  event,
  teams,
  shifts,
  shiftVolunteers,
  qualifications,
  onCancelShift
}: Props) {
  const teamNames = teams.reduce<Record<TeamId, string>>(
    (acc, team) => ({ ...acc, [team.id]: team.name }),
    {}
  );
  const qualificationMap = new Map(
    qualifications.map((qualification) => [qualification.id, qualification])
  );

  const teamShiftsByDay = shifts.reduce<Record<number, Record<TeamId, ShiftInfo[]>>>(
    (acc, shift) => ({
      ...acc,
      [shift.eventDay]: {
        ...acc[shift.eventDay],
        [shift.teamId]: [...(acc[shift.eventDay]?.[shift.teamId] ?? []), shift]
      }
    }),
    {}
  );
  return (
    <DatedList
      items={Object.entries(teamShiftsByDay)}
      getDate={([day]) => eventDayToDate(event.startDate, parseInt(day, 10))}
      renderItem={([day, teams]) => (
        <Flex key={day} direction="column" gap="4">
          {Object.entries(teams).map(([teamId, shifts]) => (
            <Card key={teamId}>
              <Heading as="h3" size="4">
                {teamNames[teamId]}
              </Heading>
              <Flex direction="column" gap="2" mt="4">
                {shifts.map((shift) => {
                  const requiredQualifications = shift.requirements
                    .map((qualificationId) => qualificationMap.get(qualificationId))
                    .filter((qualification): qualification is QualificationInfo => Boolean(qualification));
                  return (
                    <ShiftCard
                      eventStartDate={event.startDate}
                      shift={shift}
                      qualifications={requiredQualifications}
                      volunteers={shiftVolunteers[shift.id] ?? []}
                      key={shift.id}
                      collapsible
                      onCancel={onCancelShift?.bind(null, shift.id)}
                    />
                  );
                })}
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    />
  );
}
