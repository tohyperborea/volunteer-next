import Volunteer from '@/lib/volunteer';
import { getFilteredUsers } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { paramsToUserFilters } from '@/utils/user-filters';
import { NextRequest } from 'next/server';
import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      body: JSON.stringify(data),
      status: init?.status ?? 200,
      headers: new Headers(init?.headers)
    }))
  }
}));
jest.mock('@/session', () => ({
  checkAuthorisation: jest.fn().mockResolvedValue(true)
}));
jest.mock('@/service/user-service', () => ({
  getFilteredUsers: jest.fn()
}));

jest.mock('@/utils/user-filters', () => ({
  paramsToUserFilters: jest.fn()
}));

jest.mock('@/lib/volunteer', () => jest.fn());

const mockCheckAuthorisation = checkAuthorisation as jest.MockedFunction<typeof checkAuthorisation>;
const mockGetFilteredUsers = getFilteredUsers as jest.MockedFunction<typeof getFilteredUsers>;
const mockParamsToUserFilters = paramsToUserFilters as jest.MockedFunction<
  typeof paramsToUserFilters
>;
const mockVolunteer = Volunteer as jest.MockedFunction<typeof Volunteer>;

describe('GET /api/user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users and return a JSON response', async () => {
    const mockFilter: UserFilters = { roleType: 'admin' };
    const mockUsers: User[] = [
      {
        id: 'user1',
        name: 'John',
        email: 'john@example.com',
        roles: []
      },
      {
        id: 'user2',
        name: 'Jane',
        email: 'jane@example.com',
        roles: []
      }
    ];
    const mockVolunteers: VolunteerInfo[] = [
      { id: 'user1', displayName: 'John' },
      { id: 'user2', displayName: 'Jane' }
    ];

    mockParamsToUserFilters.mockReturnValue(mockFilter);
    mockGetFilteredUsers.mockResolvedValue(mockUsers);
    mockVolunteer.mockImplementation((user) => ({
      id: user.id,
      displayName: user.name
    }));

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ roleType: 'admin' }) }
    } as unknown as NextRequest;
    const response = await GET(request);

    expect(mockParamsToUserFilters).toHaveBeenCalledWith(request.nextUrl.searchParams);
    expect(mockCheckAuthorisation).toHaveBeenCalled();
    expect(mockGetFilteredUsers).toHaveBeenCalledWith(mockFilter);
    expect(mockVolunteer).toHaveBeenCalledTimes(mockUsers.length);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(JSON.stringify(mockVolunteers));
  });

  it('should throw an error if authorisation fails', async () => {
    mockCheckAuthorisation.mockRejectedValue(new Error('Unauthorised'));

    await expect(GET({} as NextRequest)).rejects.toThrow('Unauthorised');

    expect(mockCheckAuthorisation).toHaveBeenCalled();
    expect(mockGetFilteredUsers).not.toHaveBeenCalled();
  });
});
