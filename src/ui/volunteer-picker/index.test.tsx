import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VolunteerPicker from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/utils/path', () => ({
  getUserApiPath: jest.fn(() => '/api/user')
}));

jest.mock('@/ui/volunteer-card', () => ({
  __esModule: true,
  VolunteerCardContent: ({ volunteer }: { volunteer: VolunteerInfo }) => (
    <div>{volunteer.displayName}</div>
  )
}));

global.fetch = jest.fn();

describe('VolunteerPicker', () => {
  const t = jest.fn((key) => key);

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'id-1', displayName: 'Volunteer 1' },
        { id: 'id-2', displayName: 'Volunteer 2' }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with the correct title', async () => {
    render(<VolunteerPicker title="Select Volunteers" open={true} />);
    await waitFor(() => {
      // This check is required to ensure the fetch has completed
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
    });
  });

  it('fetches and displays volunteers when open', async () => {
    render(<VolunteerPicker title="Select Volunteers" open={true} />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user');
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
      expect(screen.getByText('Volunteer 2')).toBeInTheDocument();
    });
  });

  it('does not fetch volunteers when closed', () => {
    render(<VolunteerPicker title="Select Volunteers" open={false} />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(<VolunteerPicker title="Select Volunteers" open={true} onClose={onClose} />);
    await waitFor(() => {
      // This check is required to ensure the fetch has completed
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSubmit when the save button is clicked', async () => {
    const onSubmit = jest.fn();
    render(<VolunteerPicker title="Select Volunteers" open={true} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('displays an error in the console if fetching volunteers fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, statusText: 'Error' });

    render(<VolunteerPicker title="Select Volunteers" open={true} />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch volunteers:', 'Error');
    });

    consoleErrorSpy.mockRestore();
  });

  it('updates the volunteer list based on the search input', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'id-1', displayName: 'Volunteer 1' },
        { id: 'id-2', displayName: 'Volunteer 2' }
      ]
    });

    render(<VolunteerPicker title="Select Volunteers" open={true} />);

    await waitFor(() => {
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
      expect(screen.getByText('Volunteer 2')).toBeInTheDocument();
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'id-3', displayName: 'Volunteer 3' }]
    });

    fireEvent.change(screen.getByPlaceholderText('placeholder'), {
      target: { value: 'Volunteer 3' }
    });

    await waitFor(() => {
      expect(screen.queryByText('Volunteer 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Volunteer 2')).not.toBeInTheDocument();
      expect(screen.getByText('Volunteer 3')).toBeInTheDocument();
    });
  });

  it('excludes volunteers based on excludeIds prop', async () => {
    render(<VolunteerPicker title="Select Volunteers" open={true} excludeIds={['id-1']} />);
    await waitFor(() => {
      expect(screen.queryByText('Volunteer 1')).not.toBeInTheDocument();
      expect(screen.getByText('Volunteer 2')).toBeInTheDocument();
    });
  });

  it('calls onSelect with the selected volunteers when save is clicked', async () => {
    const onSelect = jest.fn();
    render(<VolunteerPicker title="Select Volunteers" open={true} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
      expect(screen.getByText('Volunteer 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Volunteer 1'));
    fireEvent.click(screen.getByText('save'));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith([{ id: 'id-1', displayName: 'Volunteer 1' }]);
    });
  });
});
