import { render, screen, fireEvent, within } from '@testing-library/react';
import ManageQualifications from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('ManageQualifications', () => {
  const defaultProps: React.ComponentProps<typeof ManageQualifications> = {
    qualifications: [
      {
        id: '1',
        eventId: 'event1',
        name: 'Qualification 1',
        teamId: 'team1',
        errorMessage: 'error1'
      },
      {
        id: '2',
        eventId: 'event1',
        name: 'Qualification 2',
        teamId: 'team2',
        errorMessage: 'error2'
      },
      {
        id: '3',
        eventId: 'event1',
        name: 'Qualification 3',
        errorMessage: 'error3'
      }
    ],
    event: {
      id: 'event1',
      name: 'Event 1',
      slug: 'event-1',
      startDate: new Date(),
      endDate: new Date()
    },
    teams: [
      {
        id: 'team1',
        name: 'Team 1',
        eventId: 'event1',
        slug: 'team-1',
        description: 'description1'
      },
      {
        id: 'team2',
        name: 'Team 2',
        eventId: 'event1',
        slug: 'team-2',
        description: 'description2'
      }
    ],
    editableTeams: ['team1'],
    onSave: jest.fn()
  };

  it('renders the add button when editable', () => {
    render(<ManageQualifications {...defaultProps} />);
    expect(screen.getByText('add')).toBeInTheDocument();
  });

  it('does not render the add button when not editable', () => {
    render(<ManageQualifications {...defaultProps} onSave={undefined} />);
    expect(screen.queryByText('add')).not.toBeInTheDocument();
  });

  it('renders qualifications with edit buttons only for editable teams', () => {
    render(<ManageQualifications {...defaultProps} />);
    expect(
      within(screen.getByTestId('qualification-card-1')).getByLabelText('edit')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-2')).queryByLabelText('edit')
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-3')).queryByLabelText('edit')
    ).not.toBeInTheDocument();
  });

  it('renders all qualifications as editable when editableTeams is not provided', () => {
    render(<ManageQualifications {...defaultProps} editableTeams={undefined} />);
    expect(
      within(screen.getByTestId('qualification-card-1')).getByLabelText('edit')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-2')).getByLabelText('edit')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('qualification-card-3')).getByLabelText('edit')
    ).toBeInTheDocument();
  });

  it('opens the qualification dialog when add button is clicked', () => {
    render(<ManageQualifications {...defaultProps} />);
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens the qualification dialog when edit button is clicked', () => {
    render(<ManageQualifications {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('edit'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the qualification dialog when onClose is triggered', () => {
    render(<ManageQualifications {...defaultProps} />);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
