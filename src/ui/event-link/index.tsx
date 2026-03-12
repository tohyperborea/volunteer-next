/**
 * A special Link that sets the EventCookie before redirecting
 * @since 2026-03-12
 * @author Michael Townsend <@continuities>
 */

'use client';

import { EventCookie, setCookie } from '@/utils/cookie';
import { Link, type LinkProps } from '@radix-ui/themes';
import NextLink from 'next/link';

interface Props extends LinkProps {
  eventId: EventId;
}

export default function EventLink({ eventId, href, children, ...linkProps }: Props) {
  return (
    <Link asChild {...linkProps}>
      <NextLink
        href={href ?? '#'}
        onClick={() => {
          setCookie(EventCookie, eventId);
        }}
      >
        {children}
      </NextLink>
    </Link>
  );
}
