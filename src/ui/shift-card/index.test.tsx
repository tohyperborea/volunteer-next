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
  const mockVolunteerNames = ['Alice', 'Bob'];

  beforeEach(() => {
    mockProgressBar.mockClear();
  });

  it('renders the shift title and time span', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteerNames={mockVolunteerNames} />);

    expect(screen.getByText('Morning Shift')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 12:00')).toBeInTheDocument();
  });

  it('displays badges for max and min volunteers', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteerNames={mockVolunteerNames} />);

    expect(screen.getByText('max: 10')).toBeInTheDocument();
    expect(screen.getByText('min: 2')).toBeInTheDocument();
  });

  it('shows the qualification requirement when present', () => {
    render(
      <ShiftCard
        event={mockEvent}
        shift={mockShift}
        qualification={mockQualification}
        volunteerNames={mockVolunteerNames}
      />
    );
    const badge = screen.getByText('requires: First Aid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute(
      'href',
      getQualificationDetailsPath({
        eventSlug: mockEvent.slug,
        qualificationId: mockQualification.id
      })
    );
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
        volunteerNames={mockVolunteerNames}
      />
    );

    expect(screen.queryByText(/requires:/)).not.toBeInTheDocument();
  });

  it('renders the volunteer names in a collapsible section', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteerNames={mockVolunteerNames} />);

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
        volunteerNames={mockVolunteerNames}
        onEdit={onEditMock}
      />
    );

    const editButton = screen.getByRole('button', { name: 'editShift' });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('does not render the edit button when onEdit is not provided', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteerNames={mockVolunteerNames} />);

    expect(screen.queryByRole('button', { name: 'editShift' })).not.toBeInTheDocument();
  });

  it('renders the progress bar with correct filled and total values', () => {
    render(<ShiftCard event={mockEvent} shift={mockShift} volunteerNames={mockVolunteerNames} />);

    expect(mockProgressBar).toHaveBeenCalledWith(
      expect.objectContaining({
        filled: mockVolunteerNames.length,
        total: mockShift.maxVolunteers
      }),
      undefined
    );
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });
});
