/**
 * API endpoint for event shift information
 * @since 2026-03-10
 * @author Michael Townsend <@continuities>
 */

import { CSVResponse, NotFoundResponse, NotImplementedResponse } from '@/lib/response';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForEvent } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import { shiftsToCSV } from '@/utils/csv-export';
import { getPermissionsProfile } from '@/utils/permissions';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/event/[eventSlug]/shifts'>
): Promise<NextResponse> => {
  await checkAuthorisation();
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format === 'csv') {
    const eventSlug = (await params).eventSlug;
    const event = await getEventBySlug(eventSlug);
    if (!event) {
      return NotFoundResponse();
    }
    const shifts = await getShiftsForEvent(event.id);
    const teams = await getTeamsForEvent(event.id);
    const shiftVolunteers = await getVolunteersForShifts(
      shifts.map((shift) => shift.id),
      getPermissionsProfile(await currentUser())
    );
    const csvContent = shiftsToCSV({
      event,
      teams,
      shifts,
      shiftVolunteers
    });
    return CSVResponse(csvContent, `${eventSlug}-shifts`);
  }
  return NotImplementedResponse();
};
