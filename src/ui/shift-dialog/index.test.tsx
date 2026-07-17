import { fireEvent, render, waitFor } from '@testing-library/react';
import ShiftDialog from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/ui/datepicker', () => ({
  EventDaySelect: ({ name }: any) => <select aria-label={name} />,
  TimeSelect: ({ name }: any) => <input type="time" aria-label={name} />
}));

describe('ShiftDialog', () => {
  it('renders correctly when creating a new shift', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    const { getByRole, getByPlaceholderText } = render(
      <ShiftDialog
        startDate={new Date()}
        teamId="team-1"
        qualifications={[]}
        creating={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(getByRole('heading', { name: 'addShift' })).toBeInTheDocument();
    expect(getByPlaceholderText('titlePlaceholder')).toBeInTheDocument();
  });

  it('renders correctly when editing a shift', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    const mockOnDelete = jest.fn();
    const editingShift = {
      id: 'shift-1',
      teamId: 'team-1',
      title: 'Morning Shift',
      isActive: true,
      eventDay: 0,
      startTime: '08:00',
      durationHours: 4,
      minVolunteers: 2,
      maxVolunteers: 5,
      requirements: ['qualification-1']
    };

    const { getByText, getByRole, getByDisplayValue, getByLabelText } = render(
      <ShiftDialog
        startDate={new Date()}
        teamId="team-1"
        qualifications={[
          {
            id: 'qualification-1',
            eventId: 'event-id',
            errorMessage: 'error',
            name: 'CPR Certified'
          }
        ]}
        editing={editingShift}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        onDelete={mockOnDelete}
      />
    );

    expect(getByRole('heading', { name: 'editShift' })).toBeInTheDocument();
    expect(getByDisplayValue('Morning Shift')).toBeInTheDocument();
    expect(getByText('deleteShift')).toBeInTheDocument();
    expect(getByLabelText('CPR Certified')).toBeChecked();
  });

  it('calls onClose when the cancel button is clicked', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <ShiftDialog
        startDate={new Date()}
        teamId="team-1"
        qualifications={[]}
        creating={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(getByText('cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSubmit when the save button is clicked', async () => {
    const mockOnSubmit = jest.fn();
    const { getByText, getByPlaceholderText, getByLabelText } = render(
      <ShiftDialog
        startDate={new Date()}
        teamId="team-1"
        qualifications={[]}
        creating={true}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(getByPlaceholderText('titlePlaceholder'), {
      target: { value: 'New Shift' }
    });
    fireEvent.change(getByLabelText('length'), {
      target: { value: '4' }
    });
    fireEvent.change(getByLabelText('minVolunteers'), {
      target: { value: '2' }
    });
    fireEvent.change(getByLabelText('maxVolunteers'), {
      target: { value: '5' }
    });

    fireEvent.click(getByText('save'));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('renders qualifications as requirement checkboxes', () => {
    const qualifications: QualificationInfo[] = [
      { id: 'qualification-1', eventId: 'event-1', name: 'CPR Certified', errorMessage: 'error' },
      { id: 'qualification-2', eventId: 'event-1', name: 'First Aid', errorMessage: 'error' }
    ];

    const { getByLabelText } = render(
      <ShiftDialog
        startDate={new Date()}
        teamId="team-1"
        qualifications={qualifications}
        creating={true}
      />
    );

    expect(getByLabelText('CPR Certified')).toBeInTheDocument();
    expect(getByLabelText('First Aid')).toBeInTheDocument();
  });
});
