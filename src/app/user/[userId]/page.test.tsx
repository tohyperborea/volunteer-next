import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UserProfilePage from './page';
import { getVolunteerById } from '@/lib/volunteer';
import { getEvents, getEventsById } from '@/service/event-service';
import {
  getQualificationsForUser,
  getQualificationById,
  removeQualificationFromUser,
  getQualificationsForEvents,
  getQualificationsForTeams
} from '@/service/qualification-service';
import { getTeamsForEvents, getTeamsById } from '@/service/team-service';
import { notFound } from 'next/navigation';
import { checkAuthorisation, getMatchingRoles } from '@/session';
import { Theme } from '@radix-ui/themes';
import { getPermissionsProfile } from '@/utils/permissions';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key)
}));
jest.mock('@/service/event-service', () => ({
  getEvents: jest.fn(),
  getEventsById: jest.fn()
}));
jest.mock('@/lib/volunteer', () => ({
  getVolunteerById: jest.fn()
}));
jest.mock('@/service/qualification-service', () => ({
  assignQualificationToUsers: jest.fn(),
  getQualificationById: jest.fn(),
  getQualificationsForEvents: jest.fn(),
  getQualificationsForTeams: jest.fn(),
  getQualificationsForUser: jest.fn(),
  removeQualificationFromUser: jest.fn()
}));
jest.mock('@/service/team-service', () => ({
  getTeamsById: jest.fn(),
  getTeamsForEvents: jest.fn()
}));
jest.mock('@/session', () => ({
  currentUser: jest.fn().mockResolvedValue({ id: 'currentUserId' }),
  checkAuthorisation: jest.fn(),
  getMatchingRoles: jest.fn()
}));
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  redirect: jest.fn()
}));
jest.mock('@/utils/permissions', () => ({
  getPermissionsProfile: jest.fn().mockReturnValue({ id: 'permissionsProfile' })
}));
jest.mock('@/auth', () => ({
  auth: {
    api: {
      signOut: jest.fn()
    }
  }
}));

const mockCheckAuthorisation = checkAuthorisation as jest.MockedFunction<typeof checkAuthorisation>;
const mockGetMatchingRoles = getMatchingRoles as jest.MockedFunction<typeof getMatchingRoles>;
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;
const mockGetVolunteer = getVolunteerById as jest.MockedFunction<typeof getVolunteerById>;
const mockGetEvents = getEvents as jest.MockedFunction<typeof getEvents>;
const mockGetEventsById = getEventsById as jest.MockedFunction<typeof getEventsById>;
const mockGetQualificationsForUser = getQualificationsForUser as jest.MockedFunction<
  typeof getQualificationsForUser
>;
const mockGetQualificationById = getQualificationById as jest.MockedFunction<
  typeof getQualificationById
>;
const mockRemoveQualificationFromUser = removeQualificationFromUser as jest.MockedFunction<
  typeof removeQualificationFromUser
>;
const mockGetQualificationsForEvents = getQualificationsForEvents as jest.MockedFunction<
  typeof getQualificationsForEvents
>;
const mockGetQualificationsForTeams = getQualificationsForTeams as jest.MockedFunction<
  typeof getQualificationsForTeams
>;
const mockGetTeamsForEvents = getTeamsForEvents as jest.MockedFunction<typeof getTeamsForEvents>;
const mockGetTeamsById = getTeamsById as jest.MockedFunction<typeof getTeamsById>;
const mockGetPermissionsProfile = getPermissionsProfile as jest.MockedFunction<
  typeof getPermissionsProfile
>;

describe('UserProfilePage', () => {
  const mockVolunteer: VolunteerInfo = {
    id: '1',
    displayName: 'JohnD',
    fullName: 'John Doe',
    email: 'email',
    roles: []
  };
  const mockEvent: EventInfo = {
    id: 'event1',
    name: 'Event 1',
    slug: 'event-1',
    startDate: new Date(),
    endDate: new Date()
  };
  const mockTeams: TeamInfo[] = [
    {
      id: 'team1',
      name: 'Team 1',
      eventId: 'event1',
      slug: 'team-1',
      description: 'description',
      contactAddress: ''
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the VolunteerCard with the correct volunteer data', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetMatchingRoles.mockResolvedValue([]);
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetTeamsForEvents.mockResolvedValue([]);
    mockGetTeamsById.mockResolvedValue([]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(mockGetVolunteer).toHaveBeenCalledWith('1', { id: 'permissionsProfile' });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call notFound if the user does not exist', async () => {
    const mockParams = Promise.resolve({ userId: '2' });
    const mockSearch = Promise.resolve({});

    mockGetVolunteer.mockResolvedValue(null);

    await expect(
      UserProfilePage({ params: mockParams, searchParams: mockSearch })
    ).rejects.toThrow();

    expect(mockGetVolunteer).toHaveBeenCalledWith('2', { id: 'permissionsProfile' });
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('should render an edit button for admins', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetEvents.mockResolvedValue([mockEvent]);
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(true);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetQualificationsForEvents.mockResolvedValue([]);
    mockGetQualificationsForTeams.mockResolvedValue([]);
    mockGetTeamsForEvents.mockResolvedValue([]);
    mockGetTeamsById.mockResolvedValue([]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.getByLabelText('edit')).toBeInTheDocument();
  });

  it('should not render an edit button for non-admins', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetEvents.mockResolvedValue([mockEvent]);
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetQualificationsForEvents.mockResolvedValue([]);
    mockGetQualificationsForTeams.mockResolvedValue([]);
    mockGetTeamsForEvents.mockResolvedValue([]);
    mockGetTeamsById.mockResolvedValue([]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.queryByLabelText('edit')).not.toBeInTheDocument();
  });

  it('should render an edit button for a personal profile', async () => {
    const mockParams = Promise.resolve({ userId: mockVolunteer.id });
    const mockSearch = Promise.resolve({});

    mockGetEvents.mockResolvedValue([mockEvent]);
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetQualificationsForEvents.mockResolvedValue([]);
    mockGetQualificationsForTeams.mockResolvedValue([]);
    mockGetTeamsForEvents.mockResolvedValue([]);
    mockGetTeamsById.mockResolvedValue([]);
    mockGetPermissionsProfile.mockReturnValue({
      userId: mockVolunteer.id,
      admin: false,
      organiser: false,
      'team-lead': false
    });

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.getByLabelText('edit')).toBeInTheDocument();
  });

  it('should not allow removal if not authorised', async () => {
    const mockQualifications: QualificationInfo[] = [
      {
        id: 'qual1',
        name: 'Qualification 1',
        eventId: 'event1',
        errorMessage: 'error'
      }
    ];

    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockGetQualificationsForUser.mockResolvedValue(mockQualifications);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetTeamsForEvents.mockResolvedValue(mockTeams);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetQualificationById.mockResolvedValue(mockQualifications[0]);
    mockGetTeamsById.mockResolvedValue([]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.getByText('Qualification 1')).toBeInTheDocument();

    expect(screen.queryByLabelText('remove')).not.toBeInTheDocument();
  });

  it('should not allow adding qualifications if not authorised', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetEvents.mockResolvedValue([mockEvent]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.queryByLabelText('add-qualification')).not.toBeInTheDocument();
  });

  it('should allow removal if authorised as organiser', async () => {
    const mockQualifications: QualificationInfo[] = [
      {
        id: 'qual1',
        name: 'Qualification 1',
        eventId: 'event1',
        errorMessage: 'error'
      },
      {
        id: 'qual2',
        name: 'Qualification 2',
        eventId: 'event2',
        errorMessage: 'error',
        teamId: 'team1'
      }
    ];
    const mockEvent2: EventInfo = {
      id: 'event2',
      name: 'Event 2',
      slug: 'event-2',
      startDate: new Date(),
      endDate: new Date()
    };

    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockGetQualificationsForUser.mockResolvedValue(mockQualifications);
    mockGetQualificationsForEvents.mockResolvedValue(mockQualifications);
    mockGetQualificationsForTeams.mockResolvedValue([mockQualifications[1]]);
    mockGetEventsById.mockResolvedValue([mockEvent, mockEvent2]);
    mockGetTeamsForEvents.mockResolvedValue(mockTeams);
    mockGetTeamsById.mockResolvedValue([]);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetQualificationById.mockResolvedValue(mockQualifications[0]);
    mockGetMatchingRoles.mockImplementation(async ({ type }) => {
      if (type === 'organiser') {
        return [
          {
            type: 'organiser',
            eventId: 'event1'
          }
        ];
      }
      return [];
    });

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.getByText('Qualification 1')).toBeInTheDocument();
    expect(screen.getByText('Qualification 2')).toBeInTheDocument();

    expect(
      within(screen.getByTestId('qualification-card-qual1')).getByLabelText('remove')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-qual2')).queryByLabelText('remove')
    ).not.toBeInTheDocument();
  });

  it('should allow removal if authorised as team lead', async () => {
    const mockQualifications: QualificationInfo[] = [
      {
        id: 'qual1',
        name: 'Qualification 1',
        eventId: 'event1',
        errorMessage: 'error'
      },
      {
        id: 'qual2',
        name: 'Qualification 2',
        eventId: 'event1',
        errorMessage: 'error',
        teamId: 'team1'
      }
    ];

    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockGetQualificationsForUser.mockResolvedValue(mockQualifications);
    mockGetQualificationsForEvents.mockResolvedValue(mockQualifications);
    mockGetQualificationsForTeams.mockResolvedValue([mockQualifications[1]]);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetTeamsForEvents.mockResolvedValue(mockTeams);
    mockGetTeamsById.mockResolvedValue([]);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetQualificationById.mockResolvedValue(mockQualifications[0]);
    mockGetMatchingRoles.mockImplementation(async ({ type }) => {
      if (type === 'team-lead') {
        return [
          {
            type: 'team-lead',
            teamId: 'team1',
            eventId: 'event1'
          }
        ];
      }
      return [];
    });

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.getByText('Qualification 1')).toBeInTheDocument();
    expect(screen.getByText('Qualification 2')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-qual1')).queryByLabelText('remove')
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-qual2')).getByLabelText('remove')
    ).toBeInTheDocument();
  });

  it('should allow removal if authorised as admin', async () => {
    const mockQualifications: QualificationInfo[] = [
      {
        id: 'qual1',
        name: 'Qualification 1',
        eventId: 'event1',
        errorMessage: 'error'
      }
    ];

    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});

    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockGetQualificationsForUser.mockResolvedValue(mockQualifications);
    mockGetEventsById.mockResolvedValue([mockEvent]);
    mockGetTeamsForEvents.mockResolvedValue(mockTeams);
    mockGetTeamsById.mockResolvedValue([]);
    mockCheckAuthorisation.mockResolvedValue(true);
    mockGetQualificationById.mockResolvedValue(mockQualifications[0]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);
    expect(screen.getByText('Qualification 1')).toBeInTheDocument();

    const removeButton = screen.getByLabelText('remove');
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(mockRemoveQualificationFromUser).toHaveBeenCalled();
    });
  });

  it('should allow adding qualifications if authorised as admin', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(true);
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetEvents.mockResolvedValue([mockEvent]);
    mockGetTeamsById.mockResolvedValue([]);
    mockGetQualificationsForEvents.mockResolvedValue([
      {
        id: 'qual1',
        name: 'Qualification 1',
        eventId: 'event1',
        errorMessage: 'error'
      }
    ]);
    mockGetQualificationsForTeams.mockResolvedValue([]);

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);

    expect(screen.getByLabelText('addQualification')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('addQualification'));
    expect(screen.getByRole('option', { name: 'Qualification 1 (Event 1)' })).toBeInTheDocument();
  });

  it('should allow adding qualifications if authorised as organiser', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetMatchingRoles.mockImplementation(async ({ type }) => {
      if (type === 'organiser') {
        return [
          {
            type: 'organiser',
            eventId: 'event1'
          }
        ];
      }
      return [];
    });
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetQualificationsForEvents.mockResolvedValue([
      {
        id: 'qual1',
        name: 'Qualification 1',
        eventId: 'event1',
        errorMessage: 'error'
      }
    ]);
    mockGetQualificationsForTeams.mockResolvedValue([]);
    mockGetEventsById.mockImplementation(async (ids: EventId[]) => {
      if (ids.includes('event1')) {
        return [mockEvent];
      }
      return [];
    });

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);

    expect(screen.getByLabelText('addQualification')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('addQualification'));
    expect(screen.getByRole('option', { name: 'Qualification 1 (Event 1)' })).toBeInTheDocument();
  });

  it('should allow adding qualifications if authorised as team-lead', async () => {
    const mockParams = Promise.resolve({ userId: '1' });
    const mockSearch = Promise.resolve({});
    const mockQualfication: QualificationInfo = {
      id: 'qual1',
      name: 'Qualification 1',
      eventId: 'event1',
      errorMessage: 'error'
    };
    mockGetVolunteer.mockResolvedValue(mockVolunteer);
    mockCheckAuthorisation.mockResolvedValue(false);
    mockGetMatchingRoles.mockImplementation(async ({ type }) => {
      if (type === 'team-lead') {
        return [
          {
            type: 'team-lead',
            eventId: 'event1',
            teamId: 'team1'
          }
        ];
      }
      return [];
    });
    mockGetQualificationsForUser.mockResolvedValue([]);
    mockGetQualificationsForEvents.mockResolvedValue([]);
    mockGetQualificationsForTeams.mockResolvedValue([mockQualfication]);
    mockGetEventsById.mockImplementation(async (ids: EventId[]) => {
      if (ids.includes('event1')) {
        return [mockEvent];
      }
      return [];
    });
    mockGetTeamsById.mockImplementation(async (ids: TeamId[]) => {
      return mockTeams.filter((team) => ids.includes(team.id));
    });

    const page = await UserProfilePage({ params: mockParams, searchParams: mockSearch });
    render(<Theme>{page}</Theme>);

    expect(screen.getByLabelText('addQualification')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('addQualification'));
    expect(screen.getByRole('option', { name: 'Qualification 1 (Event 1)' })).toBeInTheDocument();
  });
});
