import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('SearchBar', () => {
  it('renders the search bar with value', () => {
    render(<SearchBar value="test" />);
    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
  });

  it('renders the magnifying glass icon', () => {
    render(<SearchBar />);
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
  });
});
