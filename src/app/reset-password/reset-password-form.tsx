'use client';

import { useState } from 'react';
import { Button, Text, TextField } from '@radix-ui/themes';
import styles from '../signin/styles.module.css';

type Props = {
  action: (formData: FormData) => Promise<void>;
  token: string;
  passwordPlaceholder: string;
  confirmPlaceholder: string;
  buttonLabel: string;
  passwordMismatchError: string;
};

export function ResetPasswordForm({
  action,
  token,
  passwordPlaceholder,
  confirmPlaceholder,
  buttonLabel,
  passwordMismatchError
}: Props) {
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setMismatchError(null);
    const password = (formData.get('password') as string) ?? '';
    const confirmPassword = (formData.get('confirmPassword') as string) ?? '';
    if (password !== confirmPassword) {
      setMismatchError(passwordMismatchError);
      return;
    }
    await action(formData);
  }

  return (
    <form action={handleSubmit} className={styles.signinForm}>
      <TextField.Root name="token" value={token} hidden />
      <div>
        <TextField.Root
          name="password"
          placeholder={passwordPlaceholder}
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={!!mismatchError}
          aria-describedby={mismatchError ? 'confirm-error' : undefined}
        />
      </div>
      <div>
        <TextField.Root
          name="confirmPassword"
          placeholder={confirmPlaceholder}
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={!!mismatchError}
          aria-describedby={mismatchError ? 'confirm-error' : undefined}
        />
        {mismatchError && (
          <Text id="confirm-error" as="p" color="red" size="1">
            {mismatchError}
          </Text>
        )}
      </div>
      <Button type="submit">{buttonLabel}</Button>
    </form>
  );
}
