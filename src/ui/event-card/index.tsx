/**
 * Event card component
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

import { Card, Heading, Text } from '@radix-ui/themes';

interface Props {
  event: EventInfo;
}
export default function EventCard({ event }: Props) {
  return (
    <Card>
      <Heading as="h3" size="4">
        {event.name}
      </Heading>
      <Text size="1">
        {event.startDate.toDateString()} to {event.endDate.toDateString()}
      </Text>
    </Card>
  );
}
