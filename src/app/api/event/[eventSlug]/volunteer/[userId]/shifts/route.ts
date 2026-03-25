/**
 * API endpoint for volunteer shift information
 * @since 2026-03-11
 * @author Michael Townsend <@continuities>
 */

import { CSVResponse, NotFoundResponse, NotImplementedResponse } from '@/lib/response';
import { getVolunteerById } from '@/lib/volunteer';
import { getEventBySlug } from '@/service/event-service';
import { getShiftsForVolunteer } from '@/service/shift-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getVolunteersForShifts } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import { shiftsToCSV } from '@/utils/csv-export';
import { getPermissionsProfile } from '@/utils/permissions';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/event/[eventSlug]/volunteer/[userId]/shifts'>
): Promise<NextResponse> => {
  await checkAuthorisation();
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format === 'csv') {
    const { eventSlug, userId } = await params;
    const event = await getEventBySlug(eventSlug);
    const volunteer = await getVolunteerById(userId, getPermissionsProfile(await currentUser()));
    if (!event || !volunteer) {
      return NotFoundResponse();
    }
    const teams = await getTeamsForEvent(event.id);
    const shifts = await getShiftsForVolunteer(event.id, userId);
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
    return CSVResponse(csvContent, `my-shifts`);
  }
  return NotImplementedResponse();
};
