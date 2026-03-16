/**
 * Endpoint to fetch users
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

import Volunteer from '@/lib/volunteer';
import { getFilteredUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { paramsToUserFilters } from '@/utils/user-filters';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest): Promise<Response> => {
  await checkAuthorisation();
  const searchParams = request.nextUrl.searchParams;
  const filter = paramsToUserFilters(searchParams);
  const users = await getFilteredUsers(filter);
  const volunteers = users.map(Volunteer);
  return NextResponse.json(volunteers);
};
