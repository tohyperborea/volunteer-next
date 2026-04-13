import { Card, Flex, Heading } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import logo from '../../public/logo.png';
import logoDark from '../../public/logo-dark.png';

interface SigninContainerProps {
  title: string;
  children: ReactNode;
}

export default function SigninContainer({ title, children }: SigninContainerProps) {
  const t = useTranslations('AuthContainer');
  return (
    <Flex direction="column" gap="8" my="5" align="center">
      <picture>
        <source srcSet={logoDark.src} media="(prefers-color-scheme: dark)" />
        <img src={logo.src} alt={t('logo')} style={{ maxWidth: '60vw', maxHeight: '50vh' }} />
      </picture>
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
