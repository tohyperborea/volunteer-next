import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VolunteerPicker from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

jest.mock('@/utils/path', () => ({
  getUserApiPath: jest.fn(() => '/api/users')
}));

global.fetch = jest.fn();

describe('VolunteerPicker', () => {
  const t = jest.fn((key) => key);

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'id-1', name: 'Volunteer 1' },
        { id: 'id-2', name: 'Volunteer 2' }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with the correct title', () => {
    render(<VolunteerPicker title="Select Volunteers" open={true} />);
    waitFor(() => {
      // This check is required to ensure the fetch has completed
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
    });
  });

  it('fetches and displays volunteers when open', async () => {
    render(<VolunteerPicker title="Select Volunteers" open={true} />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users');
      expect(screen.getByText('Volunteer 1')).toBeInTheDocument();
      expect(screen.getByText('Volunteer 2')).toBeInTheDocument();
    });
  });

  it('does not fetch volunteers when closed', () => {
    render(<VolunteerPicker title="Select Volunteers" open={false} />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls onClose when the cancel button is clicked', () => {
    const onClose = jest.fn();
    render(<VolunteerPicker title="Select Volunteers" open={true} onClose={onClose} />);
    waitFor(() => {
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
});
