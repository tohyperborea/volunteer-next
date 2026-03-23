import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QualificationDialog from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('QualificationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockEventId = 'event123';
  const mockTeams: TeamInfo[] = [
    {
      id: 'team1',
      eventId: mockEventId,
      name: 'Team 1',
      slug: 'team2',
      description: 'Description',
      contactAddress: ''
    },
    {
      id: 'team2',
      eventId: mockEventId,
      name: 'Team 2',
      slug: 'team2',
      description: 'Description',
      contactAddress: ''
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when creating a new qualification', () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getAllByText('add')).toHaveLength(2); // Title and description
    expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('errorMessagePlaceholder')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('create')).toBeInTheDocument();
  });

  it('renders correctly when editing an existing qualification', () => {
    const mockEditing = {
      id: 'qual1',
      eventId: mockEventId,
      name: 'Qualification 1',
      teamId: 'team1',
      errorMessage: 'Error message'
    };

    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        editing={mockEditing}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getAllByText('edit')).toHaveLength(2); // Title and description
    expect(screen.getByDisplayValue('Qualification 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Error message')).toBeInTheDocument();
    expect(screen.getByText('save')).toBeInTheDocument();
  });

  it('calls onClose when the dialog is closed', async () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByText('cancel'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onCreate when the form is submitted in create mode', async () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('namePlaceholder'), {
      target: { value: 'New Qualification' }
    });
    fireEvent.change(screen.getByPlaceholderText('errorMessagePlaceholder'), {
      target: { value: 'Error' }
    });
    fireEvent.click(screen.getByText('create'));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalled();
    });
  });

  it('calls onUpdate when the form is submitted in edit mode', async () => {
    const mockEditing: QualificationInfo = {
      id: 'qual1',
      eventId: mockEventId,
      name: 'Qualification 1',
      teamId: 'team1',
      errorMessage: 'Error message'
    };

    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        editing={mockEditing}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByText('save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('renders the team options correctly', () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Team 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Team 2' })).toBeInTheDocument();
  });

  it('disables the "no team" option when requireTeam is true', () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        requireTeam={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'noTeam' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: 'Team 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Team 2' })).toBeInTheDocument();
  });

  it('allows the "no team" option when requireTeam is false', () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        requireTeam={false}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'noTeam' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('option', { name: 'Team 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Team 2' })).toBeInTheDocument();
  });
});
