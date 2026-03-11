/**
 * API endpoint for service shift information
 * @since 2026-03-10
 * @author Michael Townsend <@continuities>
 */

'use server';

import { getEventBySlug } from '@/service/event-service';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { eventDayToDate } from '@/utils/datetime';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/event/[eventSlug]/shifts'>
): Promise<NextResponse> => {
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format === 'csv') {
    const eventSlug = (await params).eventSlug;
    const event = await getEventBySlug(eventSlug);
    if (!event) {
      notFound();
    }
    const shifts = await getShiftsForEvent(event.id);
    const teams = await getTeamsForEvent(event.id);
    const teamNames = teams.reduce<Record<TeamId, string>>(
      (acc, team) => ({ ...acc, [team.id]: team.name }),
      {}
    );
    const shiftVolunteers: Record<ShiftId, User[]> = {}; // TODO
    const csvContent = [
      ['Date', 'Team', 'Start Time', 'Duration (Hours)', 'Volunteers'].join(','),
      ...shifts.map((shift) => {
        const volunteers = shiftVolunteers[shift.id] ?? [];
        const volunteerRow =
          volunteers.length === 0
            ? ''
            : `"${volunteers.map((v) => `${v.name} <${v.email}>`).join('\r')}"`;
        return [
          eventDayToDate(event.startDate, shift.eventDay).toISOString().split('T')[0],
          teamNames[shift.teamId],
          shift.startTime,
          shift.durationHours,
          volunteerRow
        ].join(',');
      })
    ].join('\r\n');
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${eventSlug}-shifts.csv"`
      }
    });
  }
  return new NextResponse('Not Implemented', { status: 501 });
};
