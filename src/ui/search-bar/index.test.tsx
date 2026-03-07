import { render, screen, fireEvent } from '@testing-library/react';
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

  it('calls onChange when input value changes', () => {
    const handleChange = jest.fn();
    render(<SearchBar onChange={handleChange} />);
    const input = screen.getByPlaceholderText('placeholder');

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledWith('new value');
  });

  it('renders the magnifying glass icon', () => {
    render(<SearchBar />);
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
  });
});
