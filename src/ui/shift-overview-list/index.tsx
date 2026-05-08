/**
 * Displays a list of shifts from multiple teams, grouped by day
 * @since 2026-03-26
 * @author Michael Townsend <@continuities>
 */

'use client';

import { eventDayToDate } from '@/utils/datetime';
import { Link, Flex, Card, Heading } from '@radix-ui/themes';
import DatedList from '../dated-list';
import ShiftCard from '../shift-card';
import { useState } from 'react';
import ShiftDialog from '../shift-dialog';
import NextLink from 'next/link';
import { getTeamShiftsPath } from '@/utils/path';

interface Props {
  event: EventInfo;
  teams: TeamInfo[];
  shifts: ShiftInfo[];
  shiftVolunteers: Record<ShiftId, VolunteerInfo[]>;
  qualifications: QualificationInfo[];
  editableTeams?: Set<TeamId>;
  onSaveShift?: (data: FormData) => Promise<void>;
  onDeleteShift?: (shiftId: ShiftId) => Promise<void>;
  onCancelShift?: (shiftId: ShiftId) => Promise<void>;
}

export default function ShiftOverviewList({
  event,
  teams,
  shifts,
  shiftVolunteers,
  qualifications,
  editableTeams,
  onSaveShift,
  onDeleteShift,
  onCancelShift
}: Props) {
  const isEditable = onSaveShift !== undefined;

  const [editingShift, setEditingShift] = useState<PartialBy<ShiftInfo, 'id'> | undefined>(
    undefined
  );

  const teamMap = new Map(teams.map((team) => [team.id, team]));
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

  const canEditShift = (shift: ShiftInfo) =>
    isEditable && (!editableTeams || editableTeams.has(shift.teamId));

  return (
    <>
      <DatedList
        items={Object.entries(teamShiftsByDay)}
        getDate={([day]) => eventDayToDate(event.startDate, parseInt(day, 10))}
        renderItem={([day, teams]) => (
          <Flex key={day} direction="column" gap="4">
            {Object.entries(teams).map(([teamId, shifts]) => (
              <Card key={teamId}>
                <Heading as="h3" size="4">
                  <Link highContrast asChild>
                    <NextLink href={getTeamShiftsPath(teamMap.get(teamId)!.slug)} prefetch={false}>
                      {teamMap.get(teamId)?.name}
                    </NextLink>
                  </Link>
                </Heading>
                <Flex direction="column" gap="2" mt="4">
                  {shifts.map((shift) => {
                    const requiredQualifications = shift.requirements
                      .map((qualificationId) => qualificationMap.get(qualificationId))
                      .filter((qualification): qualification is QualificationInfo =>
                        Boolean(qualification)
                      );
                    return (
                      <ShiftCard
                        eventStartDate={event.startDate}
                        shift={shift}
                        qualifications={requiredQualifications}
                        volunteers={shiftVolunteers[shift.id] ?? []}
                        key={shift.id}
                        collapsible
                        onEdit={canEditShift(shift) ? () => setEditingShift(shift) : undefined}
                        onCopy={
                          canEditShift(shift)
                            ? () => setEditingShift({ ...shift, id: undefined })
                            : undefined
                        }
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
      {isEditable && (
        <ShiftDialog
          teams={teams}
          startDate={event.startDate}
          qualifications={qualifications}
          editing={editingShift}
          onSubmit={onSaveShift}
          onDelete={onDeleteShift}
          onClose={() => {
            setEditingShift(undefined);
          }}
        />
      )}
    </>
  );
}
