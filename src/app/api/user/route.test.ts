import { usersToVolunteers } from '@/lib/volunteer';
import { getFilteredUsers } from '@/service/user-service';
import { getHoursForVolunteers } from '@/service/shift-service';
import { checkAuthorisation } from '@/session';
import { paramsToUserFilters } from '@/utils/user-filters';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { volunteersToCSV } from '@/utils/csv-export';
import { CSVResponse, NotImplementedResponse } from '@/lib/response';
import { NextResponse } from 'next/server';

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
  checkAuthorisation: jest.fn().mockResolvedValue(true),
  currentUser: jest.fn().mockResolvedValue({ id: 'currentUser' }),
  getCurrentEventId: jest.fn().mockResolvedValue('currentEvent')
}));
jest.mock('@/service/user-service', () => ({
  getFilteredUsers: jest.fn()
}));
jest.mock('@/service/shift-service', () => ({
  getHoursForVolunteers: jest.fn()
}));

jest.mock('@/utils/user-filters', () => ({
  paramsToUserFilters: jest.fn()
}));

jest.mock('@/lib/volunteer', () => ({
  usersToVolunteers: jest.fn()
}));

jest.mock('@/utils/permissions', () => ({
  getPermissionsProfile: jest.fn().mockReturnValue({ id: 'permissionsProfile' })
}));

jest.mock('@/utils/csv-export', () => ({
  volunteersToCSV: jest.fn()
}));

jest.mock('@/lib/response', () => ({
  CSVResponse: jest.fn(),
  NotImplementedResponse: jest.fn()
}));

const mockVolunteersToCSV = volunteersToCSV as jest.MockedFunction<typeof volunteersToCSV>;
const mockCSVResponse = CSVResponse as jest.MockedFunction<typeof CSVResponse>;
const mockNotImplementedResponse = NotImplementedResponse as jest.MockedFunction<
  typeof NotImplementedResponse
>;

const mockCheckAuthorisation = checkAuthorisation as jest.MockedFunction<typeof checkAuthorisation>;
const mockGetFilteredUsers = getFilteredUsers as jest.MockedFunction<typeof getFilteredUsers>;
const mockParamsToUserFilters = paramsToUserFilters as jest.MockedFunction<
  typeof paramsToUserFilters
>;
const mockUsersToVolunteers = usersToVolunteers as jest.MockedFunction<typeof usersToVolunteers>;
const mockNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>;
const mockGetHoursForVolunteers = getHoursForVolunteers as jest.MockedFunction<
  typeof getHoursForVolunteers
>;

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
        chosenName: 'Johnny',
        email: 'john@example.com',
        roles: []
      },
      {
        id: 'user2',
        name: 'Jane',
        chosenName: 'Janey',
        email: 'jane@example.com',
        roles: []
      }
    ];
    const mockVolunteers: VolunteerInfo[] = [
      { id: 'user2', displayName: 'Janey' },
      { id: 'user1', displayName: 'Johnny' }
    ];

    mockParamsToUserFilters.mockReturnValue(mockFilter);
    mockGetFilteredUsers.mockResolvedValue(mockUsers);
    mockUsersToVolunteers.mockImplementation((users) =>
      users.map((user) => ({
        id: user.id,
        displayName: user.chosenName
      }))
    );

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ roleType: 'admin', format: 'json' }) }
    } as unknown as NextRequest;
    await GET(request);

    expect(mockParamsToUserFilters).toHaveBeenCalledWith(request.nextUrl.searchParams);
    expect(mockCheckAuthorisation).toHaveBeenCalled();
    expect(mockGetFilteredUsers).toHaveBeenCalledWith(
      mockFilter,
      { id: 'permissionsProfile' },
      'currentEvent'
    );
    expect(mockUsersToVolunteers).toHaveBeenCalledWith(mockUsers, { id: 'permissionsProfile' });

    expect(mockNextResponseJson).toHaveBeenCalledWith(mockVolunteers);
  });

  it('should return a CSV response when format is csv', async () => {
    const mockFilter: UserFilters = { roleType: 'admin', eventHours: 1 };
    const mockUsers: User[] = [
      {
        id: 'user1',
        name: 'John',
        chosenName: 'Johnny',
        email: 'john@example.com',
        roles: []
      }
    ];
    const mockHours: Record<UserId, number> = { [mockUsers[0].id]: 5 };
    const mockVolunteers: VolunteerInfo[] = [{ id: 'user1', displayName: 'Johnny' }];
    const mockCSVContent = 'id,displayName\nuser1,Johnny';

    mockParamsToUserFilters.mockReturnValue(mockFilter);
    mockGetFilteredUsers.mockResolvedValue(mockUsers);
    mockUsersToVolunteers.mockReturnValue(mockVolunteers);
    mockVolunteersToCSV.mockReturnValue(mockCSVContent);
    mockGetHoursForVolunteers.mockResolvedValue(mockHours);

    const request = {
      nextUrl: { searchParams: new URLSearchParams({ roleType: 'admin', format: 'csv' }) }
    } as unknown as NextRequest;

    await GET(request);

    expect(mockParamsToUserFilters).toHaveBeenCalledWith(request.nextUrl.searchParams);
    expect(mockCheckAuthorisation).toHaveBeenCalled();
    expect(mockGetFilteredUsers).toHaveBeenCalledWith(
      mockFilter,
      { id: 'permissionsProfile' },
      'currentEvent'
    );
    expect(mockUsersToVolunteers).toHaveBeenCalledWith(mockUsers, { id: 'permissionsProfile' });
    expect(mockVolunteersToCSV).toHaveBeenCalledWith(mockVolunteers, mockHours);
    expect(mockCSVResponse).toHaveBeenCalledWith(mockCSVContent, 'volunteers');
  });

  it('should return NotImplementedResponse for unsupported format', async () => {
    const request = {
      nextUrl: { searchParams: new URLSearchParams({ format: 'xml' }) }
    } as unknown as NextRequest;

    await GET(request);

    expect(mockCheckAuthorisation).toHaveBeenCalled();
    expect(mockNotImplementedResponse).toHaveBeenCalled();
  });

  it('should throw an error if authorisation fails', async () => {
    mockCheckAuthorisation.mockRejectedValue(new Error('Unauthorised'));

    await expect(GET({} as NextRequest)).rejects.toThrow('Unauthorised');

    expect(mockCheckAuthorisation).toHaveBeenCalled();
    expect(mockGetFilteredUsers).not.toHaveBeenCalled();
  });
});
