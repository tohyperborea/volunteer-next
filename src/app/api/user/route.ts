/**
 * Endpoint to fetch users
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

import Volunteer from '@/lib/volunteer';
import { getFilteredUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest): Promise<Response> => {
  const searchParams = request.nextUrl.searchParams;
  const filter: UserFilters = {
    roleType: (searchParams.get('roleType') as UserRoleType) || undefined,
    searchQuery: searchParams.get('searchQuery') || undefined,
    showDeleted: searchParams.get('showDeleted') === 'true' || false,
    withQualification: searchParams.get('withQualification') || undefined,
    withoutQualification: searchParams.get('withoutQualification') || undefined
  };
  await checkAuthorisation();
  const users = await getFilteredUsers(filter);
  const volunteers = users.map(Volunteer);
  return Response.json(volunteers);
};
