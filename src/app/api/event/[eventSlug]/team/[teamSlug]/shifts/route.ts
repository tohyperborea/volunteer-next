/**
 * API endpoint for team shift information
 * @since 2026-03-11
 * @author Michael Townsend <@continuities>
 */

'use server';

import { CSVResponse, NotFoundResponse, NotImplementedResponse } from '@/lib/response';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForTeam } from '@/service/shift-service';
import { getTeamBySlug } from '@/service/team-service';
import { checkAuthorisation } from '@/session';
import { shiftsToCSV } from '@/utils/csv-export';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/event/[eventSlug]/team/[teamSlug]/shifts'>
): Promise<NextResponse> => {
  await checkAuthorisation();
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format === 'csv') {
    const { eventSlug, teamSlug } = await params;
    const event = await getEventBySlug(eventSlug);
    const team = await getTeamBySlug(eventSlug, teamSlug);
    if (!event || !team) {
      return NotFoundResponse();
    }
    const shifts = await getShiftsForTeam(team.id);
    const shiftVolunteers: Record<ShiftId, VolunteerInfo[]> = {}; // TODO
    const csvContent = shiftsToCSV({
      event,
      teams: [team],
      shifts,
      shiftVolunteers
    });
    return CSVResponse(csvContent, `${teamSlug}-shifts`);
  }
  return NotImplementedResponse();
};
