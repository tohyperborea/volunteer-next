import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import TeamTabs from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('TeamTabs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the correct tabs with the provided paths', () => {
    const { getAllByText } = render(
      <TeamTabs infoPath="/team/info" shiftsPath="/team/shifts" volunteersPath="/team/volunteers" />
    );

    expect(getAllByText('tabs.team')[0]).toBeInTheDocument();
    expect(getAllByText('tabs.shifts')[0]).toBeInTheDocument();
    expect(getAllByText('tabs.volunteers')[0]).toBeInTheDocument();
  });

  it('sets the correct tab as active based on the current path', () => {
    mockUsePathname.mockReturnValue('/team/shifts');

    const { getAllByText } = render(
      <TeamTabs infoPath="/team/info" shiftsPath="/team/shifts" volunteersPath="/team/volunteers" />
    );

    expect(getAllByText('tabs.team')[0].closest('a')).not.toHaveAttribute('data-active');
    expect(getAllByText('tabs.shifts')[0].closest('a')).toHaveAttribute('data-active');
    expect(getAllByText('tabs.volunteers')[0].closest('a')).not.toHaveAttribute('data-active');
  });
});
