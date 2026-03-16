/**
 * Fullscreen dialog containing a form
 * Used for creating/editing teams, events, and volunteers.
 * @since 2026-03-06
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import styles from './styles.module.css';

interface Props {
  description: string;
  children?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export default function FormDialog({ description, open, onClose, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <Dialog.Description hidden>{description}</Dialog.Description>
      <Dialog.Content className={styles.fullScreenDialog}>
        <form style={{ height: '100%' }}>{children}</form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

interface FormFieldProps {
  ariaId: string;
  name: string;
  description?: string;
  children: React.ReactNode;
}

export function FormField({ ariaId, name, description, children }: FormFieldProps) {
  return (
    <Flex direction="column" gap="2">
      <Heading as="h3" size="3" id={ariaId}>
        {name}
      </Heading>
      {description && (
        <Text size="1" color="gray">
          {description}
        </Text>
      )}
      {children}
    </Flex>
  );
}
