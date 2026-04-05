/**
 * API endpoint for team volunteer information
 * @since 2026-03-19
 * @author Michael Townsend <@continuities>
 */

import { CSVResponse, NotFoundResponse, NotImplementedResponse } from '@/lib/response';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForTeam } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import { volunteersToCSV } from '@/utils/csv-export';
import { getPermissionsProfile } from '@/utils/permissions';
import { NextRequest, NextResponse } from 'next/server';
import { deduplicateBy } from '@/utils/list';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/event/[eventSlug]/team/[teamSlug]/volunteers'>
): Promise<NextResponse> => {
  const { eventSlug, teamSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  const team = await getTeamBySlug(eventSlug, teamSlug);
  if (!event || !team) {
    return NotFoundResponse();
  }
  await checkAuthorisation([
    { type: 'admin' },
    { type: 'organiser', eventId: event.id },
    { type: 'team-lead', eventId: event.id, teamId: team.id }
  ]);
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format === 'csv') {
    const shifts = await getShiftsForTeam(team.id);
    const shiftVolunteers = await getVolunteersForShifts(
      shifts.map((shift) => shift.id),
      getPermissionsProfile(await currentUser()),
      event.id
    );
    const volunteers = deduplicateBy(Object.values(shiftVolunteers).flat(), (v) => v.id);
    const csvContent = volunteersToCSV(volunteers);
    return CSVResponse(csvContent, `${teamSlug}-volunteers`);
  }
  return NotImplementedResponse();
};
