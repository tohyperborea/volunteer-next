/**
 * Card component with a menu for CRUD actions
 * @since 2025-11-16
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
  Link
} from '@radix-ui/themes';
import { useRef } from 'react';

interface Props {
  title?: string;
  children?: React.ReactNode;
  updateUri?: string;
  onDelete?: () => Promise<void>;
}
export default function MenuCard({ title = '', children, updateUri, onDelete }: Props) {
  const deleteRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations('MenuCard');
  const showMenu = updateUri || onDelete;
  return (
    <Card>
      <Flex justify="between" align="center">
        <Heading as="h3" size="4">
          {title}
        </Heading>
        {showMenu && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" size="2">
                <DotsVerticalIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {updateUri && (
                <DropdownMenu.Item asChild>
                  <Link href={updateUri}>{t('update')}</Link>
                </DropdownMenu.Item>
              )}
              {onDelete && (
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
                    <Dialog.Description>{t('confirmText', { title })}</Dialog.Description>
                    <Flex justify="end" gap="2" mt="4">
                      <Dialog.Close>
                        <DropdownMenu.Item>
                          <Button onClick={onDelete}>{t('delete')}</Button>
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
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </Flex>
      {children}
    </Card>
  );
}
