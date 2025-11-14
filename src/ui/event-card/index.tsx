/**
 * Event card component
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

'use client';

import { useTranslations } from 'next-intl';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Dialog,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Link,
  Text
} from '@radix-ui/themes';
import { useRef } from 'react';

interface Props {
  event: EventInfo;
  onDelete: (id: EventId) => Promise<void>;
}
export default function EventCard({ event, onDelete }: Props) {
  const deleteRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations('EventCard');
  return (
    <Card>
      <Flex justify="between" align="center">
        <Heading as="h3" size="4">
          {event.name}
        </Heading>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" size="2">
              <DotsVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item asChild>
              <Link href={`/update-event/${event.id}`}>{t('update')}</Link>
            </DropdownMenu.Item>
            <Dialog.Root>
              <DropdownMenu.Item
                onClick={(e) => {
                  // Prevent the dropdown from closing
                  e.preventDefault();
                  deleteRef?.current?.click();
                }}
              >
                <Dialog.Trigger ref={deleteRef}>
                  <div style={{ display: 'none' }}></div>
                </Dialog.Trigger>
                {t('delete')}
              </DropdownMenu.Item>
              <Dialog.Content>
                <Dialog.Title>{t('confirmDeletion')}</Dialog.Title>
                <Dialog.Description>
                  {t('confirmText', { eventName: event.name })}
                </Dialog.Description>
                <Flex justify="end" gap="2" mt="4">
                  <Dialog.Close>
                    <DropdownMenu.Item>
                      <Button onClick={() => onDelete(event.id)}>{t('delete')}</Button>
                    </DropdownMenu.Item>
                  </Dialog.Close>
                  <Dialog.Close>
                    <DropdownMenu.Item>
                      <Button variant="outline">{t('cancel')}</Button>
                    </DropdownMenu.Item>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
      <Text size="1">
        {t('dateSpan', {
          startDate: event.startDate.toDateString(),
          endDate: event.endDate.toDateString()
        })}
      </Text>
    </Card>
  );
}
