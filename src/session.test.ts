import { redirect, unauthorized } from 'next/navigation';
import { auth } from './auth';
import { headers } from 'next/headers';
import { getUser } from './service/user-service';
import { getEventsById } from './service/event-service';
import {
  currentUser,
  checkAuthorisation,
  getMatchingRoles,
  getCurrentEvent,
  getCurrentEventOrRedirect
} from './session';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn
}));

jest.mock('./auth', () => ({
  auth: {
    api: {
      getSession: jest.fn()
    }
  }
}));

jest.mock('next/headers', () => ({
  headers: jest.fn()
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  unauthorized: jest.fn()
}));

jest.mock('./service/user-service', () => ({
  getUser: jest.fn()
}));

jest.mock('./service/event-service', () => ({
  getEventsById: jest.fn()
}));

const mockGetSession = auth.api.getSession as jest.MockedFunction<typeof auth.api.getSession>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockUnauthorized = unauthorized as jest.MockedFunction<typeof unauthorized>;
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetEventsById = getEventsById as jest.MockedFunction<typeof getEventsById>;

/**
 * Helper: prime the mocks so that the next call to currentUser() resolves to
 * the given user (or null). currentUser calls headers() + getSession() + getUser(),
 * so all three need to be set up together.
 */
const mockUserAs = (user: { roles: { type: string }[] } | null) => {
  if (user === null) {
    mockGetSession.mockResolvedValueOnce(null);
  } else {
    mockGetSession.mockResolvedValueOnce({ user: { id: 'user-id' } } as never);
    mockGetUser.mockResolvedValueOnce(user as never);
  }
  mockHeaders.mockResolvedValueOnce(new Headers());
};

describe('currentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if no session user exists', async () => {
    mockGetSession.mockResolvedValueOnce(null);
    mockHeaders.mockResolvedValueOnce(new Headers());

    const result = await currentUser();

    expect(result).toBeNull();
  });

  it('should return a user object if session user exists', async () => {
    const mockUser = { id: 'user-id', name: 'Test User' };
    mockGetSession.mockResolvedValueOnce({ user: { id: 'user-id' } } as never);
    mockHeaders.mockResolvedValueOnce(new Headers());
    mockGetUser.mockResolvedValueOnce(mockUser as never);

    const result = await currentUser();

    expect(result).toEqual(mockUser);
  });

  it('should return debug user based on DEBUG_FORCE_ROLE', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.DEBUG_FORCE_ROLE = 'admin';
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });

    const result = await currentUser();

    expect(result).toEqual({
      id: 'debug-admin',
      name: 'Debug Admin',
      chosenName: 'Debug Admin',
      email: 'admin@localhost',
      roles: [{ type: 'admin' }]
    });

    delete process.env.DEBUG_FORCE_ROLE;
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true });
  });
});

describe('checkAuthorisation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should redirect if user is not logged in', async () => {
    mockUserAs(null);
    mockRedirect.mockImplementationOnce(() => {
      throw new Error('Redirected');
    });

    await expect(checkAuthorisation()).rejects.toThrow('Redirected');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('should return true if no roles are required', async () => {
    mockUserAs({ roles: [] });

    const result = await checkAuthorisation();

    expect(result).toBe(true);
  });

  it('should return true if user has an accepted role', async () => {
    mockUserAs({ roles: [{ type: 'admin' }] });

    const result = await checkAuthorisation([{ type: 'admin' }]);

    expect(result).toBe(true);
  });

  it('should call unauthorized if user lacks accepted roles and checkOnly is false', async () => {
    mockUserAs({ roles: [{ type: 'volunteer' }] });
    mockUnauthorized.mockImplementationOnce(() => {
      throw new Error('Unauthorized');
    });

    await expect(checkAuthorisation([{ type: 'admin' }])).rejects.toThrow('Unauthorized');
    expect(mockUnauthorized).toHaveBeenCalled();
  });

  it('should return false if user lacks accepted roles and checkOnly is true', async () => {
    mockUserAs({ roles: [{ type: 'volunteer' }] });

    const result = await checkAuthorisation([{ type: 'admin' }], true);

    expect(result).toBe(false);
    expect(mockUnauthorized).not.toHaveBeenCalled();
  });
});

describe('getMatchingRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return matching roles', async () => {
    mockUserAs({ roles: [{ type: 'admin' }, { type: 'volunteer' }] });

    const result = await getMatchingRoles({ type: 'admin' });

    expect(result).toEqual([{ type: 'admin' }]);
  });

  it('should return an empty array if no roles match', async () => {
    mockUserAs({ roles: [{ type: 'volunteer' }] });

    const result = await getMatchingRoles({ type: 'admin' });

    expect(result).toEqual([]);
  });

  it('should return an empty array if user is not logged in', async () => {
    mockUserAs(null);

    const result = await getMatchingRoles({ type: 'admin' });

    expect(result).toEqual([]);
  });
});

describe('getCurrentEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return null if no x-event-id header is present', async () => {
    mockHeaders.mockResolvedValueOnce(new Headers());

    const result = await getCurrentEvent();

    expect(result).toBeNull();
  });

  it('should return the event if x-event-id header is present', async () => {
    const mockEvent = { id: 'event-id', name: 'Test Event' };
    mockHeaders.mockResolvedValueOnce(new Headers({ 'x-event-id': 'event-id' }));
    mockGetEventsById.mockResolvedValueOnce([mockEvent] as never);

    const result = await getCurrentEvent();

    expect(result).toEqual(mockEvent);
  });
});

describe('getCurrentEventOrRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should redirect if no event is found', async () => {
    // Empty headers → no x-event-id → getCurrentEvent returns null → redirect
    mockHeaders.mockResolvedValueOnce(new Headers());
    mockRedirect.mockImplementationOnce(() => {
      throw new Error('Redirected');
    });

    await expect(getCurrentEventOrRedirect()).rejects.toThrow('Redirected');
  });

  it('should return the event if found', async () => {
    const mockEvent = { id: 'event-id', name: 'Test Event' };
    mockHeaders.mockResolvedValueOnce(new Headers({ 'x-event-id': 'event-id' }));
    mockGetEventsById.mockResolvedValueOnce([mockEvent] as never);

    const result = await getCurrentEventOrRedirect();

    expect(result).toEqual(mockEvent);
  });
});
