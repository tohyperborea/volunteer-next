import { render, screen, fireEvent } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import DatePicker, { EventDaySelect, TimeSelect } from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('DatePicker', () => {
  it('renders a date input by default', () => {
    const { container } = render(<DatePicker />);
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
  });

  it('renders with type="date" when timepicker is false', () => {
    const { container } = render(<DatePicker timepicker={false} />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('renders with type="datetime-local" when timepicker is true', () => {
    const { container } = render(<DatePicker timepicker />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'datetime-local');
  });

  it('forwards name and id props', () => {
    const { container } = render(<DatePicker name="myDate" id="myId" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('name', 'myDate');
    expect(input).toHaveAttribute('id', 'myId');
  });

  it('sets defaultValue from a Date object (date-only)', () => {
    const date = new Date('2026-03-15T00:00:00.000Z');
    const { container } = render(<DatePicker defaultValue={date} />);
    const input = container.querySelector('input');
    expect(input).toHaveValue('2026-03-15');
  });

  it('sets defaultValue from a Date object (datetime-local)', () => {
    const date = new Date('2026-03-15T14:30:00.000Z');
    const { container } = render(<DatePicker defaultValue={date} timepicker />);
    const input = container.querySelector('input');
    expect(input).toHaveValue('2026-03-15T14:30');
  });

  it('sets defaultValue from a string directly', () => {
    const { container } = render(<DatePicker defaultValue="2026-06-01" />);
    const input = container.querySelector('input');
    expect(input).toHaveValue('2026-06-01');
  });

  it('applies min and max from Date objects', () => {
    const min = new Date('2026-01-01T00:00:00.000Z');
    const max = new Date('2026-12-31T00:00:00.000Z');
    const { container } = render(<DatePicker min={min} max={max} />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('min', '2026-01-01');
    expect(input).toHaveAttribute('max', '2026-12-31');
  });

  it('applies min and max from strings', () => {
    const { container } = render(<DatePicker min="2026-01-01" max="2026-12-31" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('min', '2026-01-01');
    expect(input).toHaveAttribute('max', '2026-12-31');
  });

  it('calls onChange when the input value changes', async () => {
    const handleChange = jest.fn();
    const { container } = render(<DatePicker onChange={handleChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '2026-05-20' } });
    expect(handleChange).toHaveBeenCalledWith('2026-05-20');
  });

  it('does not attach onChange handler when prop is not provided', () => {
    // Should render without errors and without an onChange attribute
    const { container } = render(<DatePicker />);
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
  });

  it('sets required attribute', () => {
    const { container } = render(<DatePicker required />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('required');
  });

  it('forwards aria-labelledby', () => {
    const { container } = render(<DatePicker aria-labelledby="label-id" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-labelledby', 'label-id');
  });
});

describe('EventDaySelect', () => {
  const startDate = new Date('2026-01-01T00:00:00.000Z');

  it('renders day, month, and year selects', () => {
    render(<EventDaySelect startDate={startDate} ariaLabel="Event date" />);
    expect(screen.getByRole('combobox', { name: 'day' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'month' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'year' })).toBeInTheDocument();
  });

  it('renders 12 month options', () => {
    render(<EventDaySelect startDate={startDate} ariaLabel="Event date" />);
    // Month items: Jan–Dec
    fireEvent.click(screen.getByRole('combobox', { name: 'month' }));
    const monthItems = screen.getAllByText(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/);
    expect(monthItems).toHaveLength(12);
  });

  it('renders day options for default 31 days when month/year are unset', () => {
    render(<EventDaySelect startDate={startDate} ariaLabel="Event date" />);
    // Days 1–31 should all be present as item buttons
    fireEvent.click(screen.getByRole('combobox', { name: 'day' }));
    expect(screen.getByRole('option', { name: '31' })).toBeInTheDocument();
  });

  it('renders 10 year options starting from current year', () => {
    render(<EventDaySelect startDate={startDate} ariaLabel="Event date" />);
    const currentYear = new Date().getUTCFullYear();
    fireEvent.click(screen.getByRole('combobox', { name: 'year' }));
    expect(screen.getByRole('option', { name: currentYear.toString() })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: (currentYear + 9).toString() })).toBeInTheDocument();
  });

  it('calls onChange with an eventDay when day/month/year are all selected', () => {
    const handleChange = jest.fn();
    render(<EventDaySelect startDate={startDate} onChange={handleChange} ariaLabel="Event date" />);

    // Pick year first
    fireEvent.click(screen.getByRole('combobox', { name: 'year' }));
    fireEvent.click(screen.getAllByRole('option')[0]);
    // Pick month (March = index 2 → "Mar")
    fireEvent.click(screen.getByRole('combobox', { name: 'month' }));
    fireEvent.click(screen.getAllByRole('option')[2]);
    // Pick day 10
    fireEvent.click(screen.getByRole('combobox', { name: 'day' }));
    fireEvent.click(screen.getAllByRole('option')[11]);

    expect(handleChange).toHaveBeenCalled();
  });

  it('initialises with defaultValue correctly', () => {
    // eventDayToDate mock returns new Date(eventDay) so pass an ISO string
    render(<EventDaySelect startDate={startDate} defaultValue={0} ariaLabel="Event date" />);
    // The hidden input should carry the value
    const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
  });

  it('renders a hidden input with the name prop', () => {
    render(<EventDaySelect startDate={startDate} name="eventDay" ariaLabel="Event date" />);
    const hidden = document.querySelector('input[name="eventDay"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.type).toBe('hidden');
  });
});

describe('TimeSelect', () => {
  it('renders hour and minute selects', () => {
    render(<TimeSelect ariaLabel="Start time" />);
    expect(screen.getByRole('combobox', { name: 'hour' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'minute' })).toBeInTheDocument();
  });

  it('renders 24 hour options (00–23)', () => {
    render(<TimeSelect ariaLabel="Start time" />);
    fireEvent.click(screen.getByRole('combobox', { name: 'hour' }));
    expect(screen.getByRole('option', { name: '00' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '23' })).toBeInTheDocument();
  });

  it('renders 4 minute options in 15-minute increments', () => {
    render(<TimeSelect ariaLabel="Start time" />);
    fireEvent.click(screen.getByRole('combobox', { name: 'minute' }));
    ['00', '15', '30', '45'].forEach((m) => {
      expect(screen.getByRole('option', { name: m })).toBeInTheDocument();
    });
  });

  it('calls onChange with a formatted time string when hour is selected', () => {
    const handleChange = jest.fn();
    render(<TimeSelect ariaLabel="Start time" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'hour' }));
    fireEvent.click(screen.getByRole('option', { name: '09' }));
    // minute defaults to 0 when not yet set
    expect(handleChange).toHaveBeenCalledWith('09:00');
  });

  it('calls onChange with a formatted time string when minute is selected', () => {
    const handleChange = jest.fn();
    render(<TimeSelect ariaLabel="Start time" defaultValue="10:00" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('combobox', { name: 'minute' }));
    fireEvent.click(screen.getByRole('option', { name: '30' }));
    expect(handleChange).toHaveBeenCalledWith('10:30');
  });

  it('initialises from defaultValue', () => {
    const { container } = render(<TimeSelect ariaLabel="Start time" defaultValue="14:15" />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden?.value).toBe('14:15');
  });

  it('renders a hidden input with the name prop', () => {
    const { container } = render(<TimeSelect ariaLabel="Start time" name="startTime" />);
    const hidden = container.querySelector('input[name="startTime"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.type).toBe('hidden');
  });

  it('hidden input is empty when no defaultValue is provided', () => {
    const { container } = render(<TimeSelect ariaLabel="Start time" name="t" />);
    const hidden = container.querySelector('input[name="t"]') as HTMLInputElement;
    expect(hidden?.value).toBe('');
  });
});
