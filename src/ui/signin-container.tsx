import { Card, Flex, Heading } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

interface SigninContainerProps {
  title: string;
  children: ReactNode;
}

export default function SigninContainer({ title, children }: SigninContainerProps) {
  const t = useTranslations('AuthContainer');
  return (
    <Flex direction="column" gap="8" my="5" align="center">
      <img src="/logo.png" alt={t('logo')} style={{ maxWidth: '60vw' }} />
      <Heading as="h1" align="center">
        {title}
      </Heading>
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Flex direction="column" gap="2" p="2">
          {children}
        </Flex>
      </Card>
    </Flex>
  );
}
