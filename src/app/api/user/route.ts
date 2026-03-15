/**
 * Endpoint to fetch users
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

import { getFilteredUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest): Promise<Response> => {
  const filter = Object.fromEntries(request.nextUrl.searchParams.entries());
  console.log('Received GET /api/user with filter:', filter);
  await checkAuthorisation();
  const users = await getFilteredUsers(filter);
  return Response.json(users);
};
