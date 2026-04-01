/**
 * Button for sending emails
 * @since 2026-03-31
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Button, Dialog, ButtonProps, Flex, TextField, TextArea, Checkbox } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FormField } from '../form-dialog';

type BaseProps = {
  successTitle: string;
  successMessage: string;
  failureTitle: string;
  failureMessage: string;
} & Omit<ButtonProps, 'onClick'>;

type CustomisableProps = {
  customisable: true;
  numEmails: number;
  emailContext: string;
  sendEmail: (customisation: EmailCustomisation) => Promise<SendEmailResult>;
} & BaseProps;

type NonCustomisableProps = {
  customisable?: never;
  numEmails?: never;
  emailContext?: never;
  sendEmail: () => Promise<SendEmailResult>;
} & BaseProps;

type Props = CustomisableProps | NonCustomisableProps;

export default function SendEmailButton({
  sendEmail,
  successTitle,
  failureTitle,
  successMessage,
  failureMessage,
  disabled,
  customisable,
  numEmails,
  emailContext,
  ...buttonProps
}: Props) {
  const [isSending, setIsSending] = useState(false);
  const [isCustomising, setIsCustomising] = useState(false);
  const [result, setResult] = useState<SendEmailResult | null>(null);
  const t = useTranslations('SendEmailButton');

  const doSend = !customisable
    ? async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isSending) {
          return;
        }
        setIsSending(true);
        try {
          const result = await sendEmail();
          setResult(result);
        } catch (error) {
          setResult({
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        } finally {
          setIsSending(false);
        }
      }
    : undefined;

  const doCustomisedSend = customisable
    ? async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSending) {
          return;
        }
        const formData = new FormData(e.currentTarget);
        const subject = formData.get('email-subject');
        const body = formData.get('email-body');
        const includeShifts = formData.get('include-shifts') === 'on';
        if (typeof subject !== 'string' || typeof body !== 'string') {
          setResult({
            status: 'failed',
            error: 'Invalid form data'
          });
          return;
        }
        const customisation: EmailCustomisation = {
          subject,
          body,
          includeShifts
        };
        setIsSending(true);
        try {
          const result = await sendEmail(customisation);
          setResult(result);
        } catch (error) {
          setResult({
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        } finally {
          setIsSending(false);
          setIsCustomising(false);
        }
      }
    : undefined;

  return (
    <>
      {/* Button */}
      <Button
        onClick={customisable ? () => setIsCustomising(true) : doSend}
        disabled={disabled || isSending}
        {...buttonProps}
      />

      {/* Customisation dialog */}
      {customisable && (
        <Dialog.Root open={isCustomising} onOpenChange={setIsCustomising}>
          <Dialog.Content>
            <Dialog.Title>{t('notifyAll')}</Dialog.Title>
            <Dialog.Description>
              {t('notifyAllDescription', { numEmails, emailContext })}
            </Dialog.Description>
            <form onSubmit={doCustomisedSend}>
              <Flex direction="column" gap="3" mt="4">
                <FormField ariaId="email-subject" name={t('emailSubject')}>
                  <TextField.Root
                    required
                    name="email-subject"
                    placeholder={t('emailSubject')}
                    aria-labelledby="email-subject"
                    autoComplete="off"
                  />
                </FormField>
                <FormField ariaId="email-body" name={t('emailBody')}>
                  <TextArea
                    required
                    name="email-body"
                    placeholder={t('emailBody')}
                    aria-labelledby="email-body"
                    size="3"
                    resize="vertical"
                    autoComplete="off"
                    data-1p-ignore
                  />
                </FormField>
                <FormField ariaId="include-shifts" name={t('includeShifts')}>
                  <Checkbox
                    style={{ alignSelf: 'flex-start' }}
                    name="include-shifts"
                    aria-labelledby="include-shifts"
                    defaultChecked={false}
                  />
                </FormField>
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    {t('cancel')}
                  </Button>
                </Dialog.Close>
                <Button type="submit">{t('send', { numEmails })}</Button>
              </Flex>
            </form>
          </Dialog.Content>
        </Dialog.Root>
      )}

      {/* Confirmation dialog */}
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
