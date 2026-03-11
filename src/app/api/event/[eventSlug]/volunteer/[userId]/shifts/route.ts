/**
 * API endpoint for volunteer shift information
 * @since 2026-03-11
 * @author Michael Townsend <@continuities>
 */

'use server';

import { CSVResponse, NotFoundResponse, NotImplementedResponse } from '@/lib/response';
import { getEventBySlug } from '@/service/event-service';
import { getTeamsForEvent } from '@/service/team-service';
import { getUser } from '@/service/user-service';
import { shiftsToCSV } from '@/utils/csv-export';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/api/event/[eventSlug]/volunteer/[userId]/shifts'>
): Promise<NextResponse> => {
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format === 'csv') {
    const { eventSlug, userId } = await params;
    const event = await getEventBySlug(eventSlug);
    const user = await getUser(userId);
    if (!event || !user) {
      return NotFoundResponse();
    }
    const teams = await getTeamsForEvent(event.id);
    const shifts: ShiftInfo[] = []; // TODO: Depends on volunteer signup implementation
    const shiftVolunteers: Record<ShiftId, User[]> = {}; // TODO: Depends on volunteer signup implementation

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
