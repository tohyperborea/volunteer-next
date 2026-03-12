import { render, fireEvent } from '@testing-library/react';
import EventLink from './index';
import { EventCookie, setCookie } from '@/utils/cookie';

jest.mock('@/utils/cookie', () => ({
  setCookie: jest.fn(),
  EventCookie: {
    name: 'event_cookie'
  }
}));

describe('EventLink', () => {
  it('renders correctly with given props', () => {
    const { getByText } = render(
      <EventLink eventId="123" href="/test">
        Test Link
      </EventLink>
    );

    expect(getByText('Test Link')).toBeInTheDocument();
  });

  it('calls setCookie with the correct arguments when clicked', () => {
    const { getByText } = render(
      <EventLink eventId="123" href="/test">
        Test Link
      </EventLink>
    );

    const link = getByText('Test Link');
    fireEvent.click(link);

    expect(setCookie).toHaveBeenCalledWith(EventCookie, '123');
  });

  it('passes additional props to the Link component', () => {
    const { getByText } = render(
      <EventLink eventId="123" href="/test" target="_blank">
        Test Link
      </EventLink>
    );

    const link = getByText('Test Link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
