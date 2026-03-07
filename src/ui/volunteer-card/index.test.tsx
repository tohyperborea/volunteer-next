import { render, screen } from '@testing-library/react';
import VolunteerCard from './index';

describe('VolunteerCard', () => {
  const mockVolunteer: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    id: 'user-id',
    roles: []
  };

  it('renders the volunteer name and email', () => {
    render(<VolunteerCard volunteer={mockVolunteer} />);
    expect(screen.getByText(mockVolunteer.name)).toBeInTheDocument();
    expect(screen.getByText(mockVolunteer.email)).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const mockActions = <button>Click Me</button>;
    render(<VolunteerCard volunteer={mockVolunteer} actions={mockActions} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('does not render actions when not provided', () => {
    render(<VolunteerCard volunteer={mockVolunteer} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
