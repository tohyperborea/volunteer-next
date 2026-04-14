import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddShiftButton from './index';
import { useTranslations } from 'next-intl';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/ui/shift-dialog', () => {
  return function MockShiftDialog({ onClose, onSubmit }: any) {
    return (
      <div data-testid="shift-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit(new FormData())}>Submit</button>
      </div>
    );
  };
});

describe('AddShiftButton', () => {
  const mockEvent: EventInfo = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-02')
  } as EventInfo;

  const mockTeams: TeamInfo[] = [{ id: '1', name: 'Team A' } as TeamInfo];
  const mockQualifications: QualificationInfo[] = [
    { id: '1', name: 'Qualification A' } as QualificationInfo
  ];
  const mockOnSaveShift = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with plus icon and label', () => {
    render(
      <AddShiftButton
        event={mockEvent}
        teams={mockTeams}
        qualifications={mockQualifications}
        onSaveShift={mockOnSaveShift}
      />
    );
    expect(screen.getByRole('button', { name: /addShift/i })).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', () => {
    render(
      <AddShiftButton
        event={mockEvent}
        teams={mockTeams}
        qualifications={mockQualifications}
        onSaveShift={mockOnSaveShift}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /addShift/i }));
    expect(screen.getByTestId('shift-dialog')).toBeInTheDocument();
  });

  it('closes dialog when onClose is called', () => {
    const { rerender } = render(
      <AddShiftButton
        event={mockEvent}
        teams={mockTeams}
        qualifications={mockQualifications}
        onSaveShift={mockOnSaveShift}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /addShift/i }));
    fireEvent.click(screen.getByText('Close'));
    rerender(
      <AddShiftButton
        event={mockEvent}
        teams={mockTeams}
        qualifications={mockQualifications}
        onSaveShift={mockOnSaveShift}
      />
    );
  });

  it('passes correct props to ShiftDialog', () => {
    render(
      <AddShiftButton
        event={mockEvent}
        teams={mockTeams}
        qualifications={mockQualifications}
        onSaveShift={mockOnSaveShift}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /addShift/i }));
    expect(screen.getByTestId('shift-dialog')).toBeInTheDocument();
  });

  it('calls onSaveShift when form is submitted', async () => {
    render(
      <AddShiftButton
        event={mockEvent}
        teams={mockTeams}
        qualifications={mockQualifications}
        onSaveShift={mockOnSaveShift}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /addShift/i }));
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(mockOnSaveShift).toHaveBeenCalled();
    });
  });
});
