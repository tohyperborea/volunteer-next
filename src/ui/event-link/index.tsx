/**
 * A special Link that sets the EventCookie before redirecting
 * @since 2026-03-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { EventCookie, setCookie } from '@/utils/cookie';
import { Link, type LinkProps } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

interface Props extends LinkProps {
  eventId: EventId;
}

export default function EventLink({ eventId, href, ...linkProps }: Props) {
  const { push, refresh } = useRouter();
  return (
    <Link
      style={{ cursor: 'pointer' }}
      href={href || '#'}
      onClick={(e) => {
        e.preventDefault();
        setCookie(EventCookie, eventId);
        if (href) {
          push(href);
        }
        refresh();
      }}
      {...linkProps}
    />
  );
}
