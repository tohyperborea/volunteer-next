import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QualificationDialog from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('QualificationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockEventId = 'event123';
  const mockTeams = [
    {
      id: 'team1',
      eventId: mockEventId,
      name: 'Team 1',
      slug: 'team2',
      description: 'Description'
    },
    { id: 'team2', eventId: mockEventId, name: 'Team 2', slug: 'team2', description: 'Description' }
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
        onSave={mockOnSave}
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
        onSave={mockOnSave}
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
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('cancel'));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onSave when the form is submitted', async () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
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
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('renders the team options correctly', () => {
    render(
      <QualificationDialog
        eventId={mockEventId}
        teams={mockTeams}
        creating={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getAllByText('noTeam')[0]);
    expect(screen.getByRole('option', { name: 'Team 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Team 2' })).toBeInTheDocument();
  });
});
