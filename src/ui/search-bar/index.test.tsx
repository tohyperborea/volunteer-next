import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('SearchBar', () => {
  it('renders the search bar with default value', () => {
    render(<SearchBar defaultValue="test" />);
    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
  });

  it('renders the magnifying glass icon', () => {
    render(<SearchBar />);
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
  });

  it('debounces onChange calls', async () => {
    jest.useFakeTimers();
    const mockOnChange = jest.fn();
    render(<SearchBar onChange={mockOnChange} debounceDelay={300} />);
    const input = screen.getByPlaceholderText('placeholder');

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });

    jest.advanceTimersByTime(300);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('abc');
    jest.useRealTimers();
  });
});
