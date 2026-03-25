import { render, screen } from '@testing-library/react';
import ShiftList from '.';
import ShiftFilters from '../shift-filters';
import ShiftDialog from '../shift-dialog';
import ShiftCard from '../shift-card';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/ui/shift-filters', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="shift-filters"></div>)
}));

jest.mock('@/ui/shift-dialog', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="shift-dialog"></div>)
}));

jest.mock('@/ui/shift-card', () => ({
  __esModule: true,
  default: jest.fn(({ shift }: { shift: ShiftInfo }) => (
    <div data-testid={`shift-card:${shift.id}`}></div>
  ))
}));

const mockShiftFilters = ShiftFilters as jest.MockedFunction<typeof ShiftFilters>;
const mockShiftDialog = ShiftDialog as jest.MockedFunction<typeof ShiftDialog>;
const mockShiftCard = ShiftCard as jest.MockedFunction<typeof ShiftCard>;

const mockEvent: EventInfo = {
  id: 'event1',
  name: 'Event 1',
  slug: '',
  startDate: new Date(),
  endDate: new Date()
};
const mockTeamId = 'team1';
const mockShifts: ShiftInfo[] = [
  {
    id: 'shift1',
    teamId: mockTeamId,
    title: 'Shift 1',
    eventDay: 0,
    startTime: '09:00',
    durationHours: 4,
    requirement: 'qual1',
    isActive: true,
    minVolunteers: 1,
    maxVolunteers: 3
  },
  {
    id: 'shift2',
    teamId: mockTeamId,
    title: 'Shift 2',
    eventDay: 1,
    startTime: '13:00',
    durationHours: 4,
    isActive: true,
    minVolunteers: 1,
    maxVolunteers: 3
  }
];
const mockQualifications: QualificationInfo[] = [
  {
    id: 'qual1',
    name: 'Qualification 1',
    eventId: mockEvent.id,
    errorMessage: 'qual1 error'
  },
  {
    id: 'qual2',
    name: 'Qualification 2',
    eventId: mockEvent.id,
    errorMessage: 'qual2 error'
  }
];
const mockQualificationMap = new Map(mockQualifications.map((q) => [q.id, q]));
const mockShiftVolunteers: Record<ShiftId, VolunteerInfo[]> = {};
const mockExportLink = 'https://example.com/export';

const baseProps: React.ComponentProps<typeof ShiftList> = {
  event: mockEvent,
  teamId: mockTeamId,
  shifts: mockShifts,
  qualifications: mockQualifications,
  shiftVolunteers: mockShiftVolunteers,
  exportLink: mockExportLink
};

describe('ShiftList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each<React.ComponentProps<typeof ShiftList>>([
    // required props only
    baseProps,
    // with edit permissions but no user-specific props
    { ...baseProps, onSaveShift: jest.fn(), onDeleteShift: jest.fn() },
    // qualified
    {
      ...baseProps,
      onSignup: jest.fn(),
      onCancel: jest.fn(),
      shifts: mockShifts,
      userShifts: new Set(),
      userQualifications: new Set(['qual1'])
    },
    // no qualifications
    {
      ...baseProps,
      onSignup: jest.fn(),
      onCancel: jest.fn(),
      shifts: mockShifts,
      userShifts: new Set(),
      userQualifications: new Set()
    },
    // wrong qualifications
    {
      ...baseProps,
      onSignup: jest.fn(),
      onCancel: jest.fn(),
      shifts: mockShifts,
      userShifts: new Set(),
      userQualifications: new Set(['qual2'])
    },
    // signed up for one shift
    {
      ...baseProps,
      onSignup: jest.fn(),
      onCancel: jest.fn(),
      shifts: mockShifts,
      userShifts: new Set(['shift1']),
      userQualifications: new Set(['qual1'])
    }
  ])('renders correctly with props %j', (props) => {
    render(<ShiftList {...props} />);

    if (props.onSaveShift) {
      expect(screen.getByText('addShift')).toBeInTheDocument();
      expect(screen.getByText('export')).toBeInTheDocument();
      expect(screen.getByTestId('shift-dialog')).toBeInTheDocument();
      expect(mockShiftDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: props.event.startDate,
          teamId: props.teamId,
          qualifications: props.qualifications,
          onSubmit: props.onSaveShift,
          onDelete: props.onDeleteShift
        }),
        undefined
      );
    } else {
      expect(screen.queryByText('addShift')).not.toBeInTheDocument();
      expect(screen.queryByText('export')).not.toBeInTheDocument();
      expect(screen.queryByTestId('shift-dialog')).not.toBeInTheDocument();
    }

    expect(mockShiftFilters).toHaveBeenCalledWith(
      expect.objectContaining({ withFilters: ['searchQuery'] }),
      undefined
    );
    expect(screen.getByTestId('shift-filters')).toBeInTheDocument();

    props.shifts.forEach((shift, i) => {
      const showSignup = props.onSignup && props.userShifts && !props.userShifts.has(shift.id);
      const showCancel = props.onCancel && props.userShifts && props.userShifts.has(shift.id);
      const isQualified = shift.requirement
        ? props.userQualifications
          ? props.userQualifications.has(shift.requirement)
          : false
        : true;
      expect(screen.getByTestId(`shift-card:${shift.id}`)).toBeInTheDocument();
      expect(mockShiftCard).toHaveBeenNthCalledWith(
        i + 1,
        expect.objectContaining({
          event: props.event,
          shift,
          qualification: mockQualificationMap.get(shift.requirement ?? ''),
          volunteers: props.shiftVolunteers[shift.id] || [],
          onSignup: showSignup ? expect.any(Function) : undefined,
          onCancel: showCancel ? expect.any(Function) : undefined,
          isQualified
        }),
        undefined
      );
    });
  });
});
