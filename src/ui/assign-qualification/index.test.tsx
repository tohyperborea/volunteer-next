import { render, screen, fireEvent } from '@testing-library/react';
import AssignQualification from './index';
import VolunteerPicker from '../volunteer-picker';

jest.mock('../volunteer-picker', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="volunteer-picker"></div>)
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('AssignQualification', () => {
  const qualification: QualificationInfo = {
    id: '1',
    eventId: 'event-id',
    name: 'First Aid',
    errorMessage: 'error'
  };

  it('renders the button with the correct text', () => {
    render(<AssignQualification qualification={qualification} />);
    expect(screen.getByText('button')).toBeInTheDocument();
  });

  it('opens the VolunteerPicker when the button is clicked', () => {
    render(<AssignQualification qualification={qualification} />);
    const button = screen.getByText('button');
    fireEvent.click(button);
    expect(screen.getByTestId('volunteer-picker')).toBeInTheDocument();
  });

  it('passes the correct props to VolunteerPicker', () => {
    render(<AssignQualification qualification={qualification} />);
    const button = screen.getByText('button');
    fireEvent.click(button);

    expect(VolunteerPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'title',
        open: true,
        filter: { withoutQualification: '1' }
      }),
      undefined
    );
  });
});
