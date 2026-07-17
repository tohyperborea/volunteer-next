import { render, screen } from '@testing-library/react';
import ShiftProgress from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values: Record<string, string>) =>
    `${key}:${JSON.stringify(values)}`,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('ShiftProgress', () => {
  it('renders the progress bar with correct width and label', () => {
    render(<ShiftProgress filled={3} total={5} />);
    const progressBar = screen.getByRole('progressbar');
    const progressLabel = screen.getByText('3/5');

    expect(progressBar).toHaveStyle({ width: '60%' });
    expect(progressLabel).toBeInTheDocument();
  });

  it('renders 0% width when total is 0', () => {
    render(<ShiftProgress filled={0} total={0} />);
    const progressBar = screen.getByRole('progressbar');
    const progressLabel = screen.getByText('0/0');

    expect(progressBar).toHaveStyle({ width: '0%' });
    expect(progressLabel).toBeInTheDocument();
  });

  it('rounds the progress percentage correctly', () => {
    render(<ShiftProgress filled={7} total={12} />);
    const progressBar = screen.getByRole('progressbar');
    const progressLabel = screen.getByText('7/12');

    expect(progressBar).toHaveStyle({ width: '58%' });
    expect(progressLabel).toBeInTheDocument();
  });

  it('renders an alert, if needed', () => {
    render(<ShiftProgress filled={1} total={5} needed={2} />);
    const progressBar = screen.getByRole('progressbar');
    const neededLabel = screen.getByText('needed:{"needed":2}');
  });
});
