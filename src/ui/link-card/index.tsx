/**
 * Big clicky link, the size of a tile
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

import { Card, Flex, Text } from '@radix-ui/themes';
import styles from './styles.module.css';

interface Props {
  href: string;
  children?: React.ReactNode;
}
export default function LinkCard({ href, children }: Props) {
  return (
    <Card asChild>
      <a href={href} className={styles.linkCard}>
        {children}
      </a>
    </Card>
  );
}

interface LinkCardContentProps {
  pretext: string;
  text: string;
}

export const LinkCardContent = ({ pretext, text }: LinkCardContentProps) => {
  return (
    <Flex
      direction="column"
      align="center"
      gap="1"
      justify="center"
      my="-2"
      className={styles.linkCardContent}
    >
      <Text weight="regular" size="2">
        {pretext}
      </Text>
      <Text weight="medium" size="5">
        {text}
      </Text>
    </Flex>
  );
};

interface LinkCardListProps {
  children: React.ReactNode[];
}

export const LinkCardList = ({ children }: LinkCardListProps) => {
  return (
    <Flex gap="4" asChild>
      <ul className={styles.linkCardList}>
        {children.map((child, i) => (
          <li key={i} className={styles.linkCardListItem}>
            {child}
          </li>
        ))}
      </ul>
    </Flex>
  );
};
