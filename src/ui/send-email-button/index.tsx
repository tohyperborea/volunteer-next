/**
 * Button for sending emails
 * @since 2026-03-31
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Button, Dialog, ButtonProps, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Props = {
  sendEmail: () => Promise<SendEmailResult>;
  successTitle: string;
  successMessage: string;
  failureTitle: string;
  failureMessage: string;
} & Omit<ButtonProps, 'onClick'>;

export default function SendEmailButton({
  sendEmail,
  successTitle,
  failureTitle,
  successMessage,
  failureMessage,
  disabled,
  ...buttonProps
}: Props) {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<SendEmailResult | null>(null);
  const t = useTranslations('SendEmailButton');

  const onClick = async () => {
    if (isSending) {
      return;
    }
    setIsSending(true);
    const result = await sendEmail();
    setIsSending(false);
    setResult(result);
  };

  return (
    <>
      <Button onClick={onClick} disabled={disabled || isSending} {...buttonProps} />
      <Dialog.Root open={result !== null} onOpenChange={() => setResult(null)}>
        <Dialog.Content>
          <Dialog.Title>{result?.status === 'failed' ? failureTitle : successTitle}</Dialog.Title>
          <Dialog.Description>
            {result?.status === 'failed' ? failureMessage : successMessage}
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">{t('close')}</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
