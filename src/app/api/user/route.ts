/**
 * Endpoint to fetch users
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

import { CSVResponse, NotImplementedResponse } from '@/lib/response';
import { usersToVolunteers } from '@/lib/volunteer';
import { getHoursForVolunteers } from '@/service/shift-service';
import { getFilteredUsers } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventId } from '@/session';
import { volunteersToCSV } from '@/utils/csv-export';
import { getPermissionsProfile } from '@/utils/permissions';
import { paramsToUserFilters } from '@/utils/user-filters';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest): Promise<Response> => {
  await checkAuthorisation();
  const searchParams = request.nextUrl.searchParams;
  const filter = paramsToUserFilters(searchParams);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const currentEventId = await getCurrentEventId();
  const volunteers = usersToVolunteers(
    await getFilteredUsers(filter, permissionsProfile, currentEventId ?? undefined),
    permissionsProfile
  ).sort((a, b) => a.displayName.localeCompare(b.displayName));
  const hours =
    filter.eventHours !== undefined && currentEventId
      ? await getHoursForVolunteers(
          currentEventId,
          volunteers.map((v) => v.id)
        )
      : undefined;
  switch (searchParams.get('format')) {
    case 'csv': {
      const csvContent = volunteersToCSV(volunteers, hours);
      return CSVResponse(csvContent, 'volunteers');
    }
    case 'json':
      return NextResponse.json(volunteers);
    default:
      return NotImplementedResponse();
  }
};
