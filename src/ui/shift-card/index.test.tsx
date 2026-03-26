import { render, screen, fireEvent } from '@testing-library/react';
import ShiftCard from './index';
import { getQualificationDetailsPath } from '@/utils/path';
import ProgressBar from '../progress-bar';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));
jest.mock('@/ui/progress-bar', () =>
  jest.fn().mockReturnValue(<div data-testid="progress-bar"></div>)
);

const mockProgressBar = ProgressBar as jest.MockedFunction<typeof ProgressBar>;

describe('ShiftCard', () => {
  const mockEvent = {
    id: 'event-id',
    name: 'Mock Event',
    slug: 'event-slug',
    startDate: new Date(),
    endDate: new Date()
  };
  const mockShift = {
    id: 'shift-id',
    teamId: 'team-id',
    title: 'Morning Shift',
    isActive: true,
    eventDay: 0,
    startTime: '08:00',
    durationHours: 4,
    maxVolunteers: 10,
    minVolunteers: 2,
    requirement: 'qualification-id'
  };
  const mockQualification = {
    id: 'qualification-id',
    eventId: mockEvent.id,
    name: 'First Aid',
    errorMessage: 'error'
  };
  const mockVolunteers: VolunteerInfo[] = [
    { id: 'volunteer-1', displayName: 'Alice' },
    { id: 'volunteer-2', displayName: 'Bob' }
  ];

  beforeEach(() => {
    mockProgressBar.mockClear();
  });

  it('renders the shift title and time span', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteers={mockVolunteers} />);

    expect(screen.getByText('Morning Shift')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 12:00')).toBeInTheDocument();
  });

  it('displays badges for max and min volunteers', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteers={mockVolunteers} />);

    expect(screen.getByText('max: 10')).toBeInTheDocument();
    expect(screen.getByText('min: 2')).toBeInTheDocument();
  });

  it('shows the qualification requirement when present', () => {
    render(
      <ShiftCard
        event={mockEvent}
        shift={mockShift}
        qualification={mockQualification}
        volunteers={mockVolunteers}
      />
    );
    const badge = screen.getByText('requires: First Aid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('href', getQualificationDetailsPath(mockQualification.id));
  });

  it('does not show qualification requirement when not present', () => {
    const mockShiftWithoutRequirement = {
      id: 'shift-id',
      teamId: 'team-id',
      title: 'Morning Shift',
      isActive: true,
      eventDay: 0,
      startTime: '08:00',
      durationHours: 4,
      maxVolunteers: 10,
      minVolunteers: 2
    };
    render(
      <ShiftCard
        event={mockEvent}
        shift={mockShiftWithoutRequirement}
        volunteers={mockVolunteers}
      />
    );

    expect(screen.queryByText(/requires:/)).not.toBeInTheDocument();
  });

  it('renders the volunteer names in a collapsible section', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteers={mockVolunteers} />);

    expect(screen.getByText('volunteers')).toBeInTheDocument();
    fireEvent.click(screen.getByText('volunteers'));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders the edit button and triggers the onEdit callback', () => {
    const onEditMock = jest.fn();
    render(
      <ShiftCard
        event={mockEvent}
        shift={mockShift}
        volunteers={mockVolunteers}
        onEdit={onEditMock}
      />
    );

    const editButton = screen.getByRole('button', { name: 'editShift' });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('does not render the edit button when onEdit is not provided', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteers={mockVolunteers} />);

    expect(screen.queryByRole('button', { name: 'editShift' })).not.toBeInTheDocument();
  });

  it('renders the progress bar with correct filled and total values', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteers={mockVolunteers} />);

    expect(mockProgressBar).toHaveBeenCalledWith(
      expect.objectContaining({
        filled: mockShift.maxVolunteers - mockVolunteers.length,
        total: mockShift.maxVolunteers
      }),
      undefined
    );
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  test.each<{
    isFull: boolean;
    requirement: QualificationInfo | null;
    isQualified: boolean;
    signupError: string | null;
  }>([
    { isFull: false, requirement: null, isQualified: false, signupError: null },
    { isFull: true, requirement: null, isQualified: false, signupError: 'full' },
    {
      isFull: false,
      requirement: mockQualification,
      isQualified: false,
      signupError: mockQualification.errorMessage
    },
    { isFull: false, requirement: mockQualification, isQualified: true, signupError: null },
    { isFull: true, requirement: mockQualification, isQualified: false, signupError: 'full' },
    { isFull: true, requirement: mockQualification, isQualified: true, signupError: 'full' }
  ])(
    'renders the signup button when onSignup is provided',
    ({ isFull, requirement, isQualified, signupError }) => {
      const onSignupMock = jest.fn();
      const shift = {
        ...mockShift,
        maxVolunteers: isFull ? mockVolunteers.length : mockShift.maxVolunteers,
        requirement: requirement ? requirement.id : undefined
      };
      render(
        <ShiftCard
          event={mockEvent}
          shift={shift}
          volunteers={mockVolunteers}
          qualification={requirement || undefined}
          isQualified={isQualified}
          onSignup={onSignupMock}
        />
      );

      const signupButton = screen.getByRole('button', { name: 'signup' });
      expect(signupButton).toBeInTheDocument();

      if (signupError) {
        expect(signupButton).toBeDisabled();
        expect(signupButton).toHaveAttribute('title', signupError);
      }

      fireEvent.click(signupButton);
      expect(onSignupMock).toHaveBeenCalledTimes(signupError ? 0 : 1);
    }
  );

  test.each<{
    minVolunteers: number;
    maxVolunteers: number;
    volunteerCount: number;
    expectedColour: string;
  }>([
    { minVolunteers: 2, maxVolunteers: 10, volunteerCount: 0, expectedColour: 'red' },
    { minVolunteers: 2, maxVolunteers: 10, volunteerCount: 1, expectedColour: 'orange' },
    { minVolunteers: 2, maxVolunteers: 10, volunteerCount: 2, expectedColour: 'accent' },
    { minVolunteers: 2, maxVolunteers: 10, volunteerCount: 5, expectedColour: 'accent' },
    { minVolunteers: 2, maxVolunteers: 10, volunteerCount: 10, expectedColour: 'green' },
    { minVolunteers: 2, maxVolunteers: 10, volunteerCount: 12, expectedColour: 'green' }
  ])(
    'renders the progress bar with the correct status colour based on volunteer count',
    ({ minVolunteers, maxVolunteers, volunteerCount, expectedColour }) => {
      const shift = {
        ...mockShift,
        minVolunteers,
        maxVolunteers
      };
      const volunteers = Array.from({ length: volunteerCount }, (_, i) => ({
        id: `volunteer-${i}`,
        displayName: `Volunteer ${i}`
      }));
      render(<ShiftCard event={mockEvent} shift={shift} volunteers={volunteers} />);

      expect(mockProgressBar).toHaveBeenCalledWith(
        expect.objectContaining({
          colour: expectedColour
        }),
        undefined
      );
    }
  );
});
