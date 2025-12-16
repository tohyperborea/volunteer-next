/**
 * Accordion component built on Radix UI primitives
 * @since 2025-01-XX
 */

'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ReactNode } from 'react';
import styles from './styles.module.css';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface AccordionItemProps {
  value: string;
  trigger: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  /** Visual tone that follows Radix Themes semantic panel colors */
  tone?: 'panel' | 'solid';
  children: ReactNode;
  className?: string;
}

function AccordionItem({ value, trigger, children, disabled }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item value={value} className={styles.accordionItem} disabled={disabled}>
      <AccordionPrimitive.Header className={styles.accordionHeader}>
        <AccordionPrimitive.Trigger className={styles.accordionTrigger}>
          {trigger}
          <ChevronDownIcon className={styles.accordionChevron} aria-hidden />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className={styles.accordionContent}>
        <div className={styles.accordionContentInner}>{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

export default function Accordion({
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  tone = 'panel',
  children,
  className
}: AccordionProps) {
  const rootProps = {
    type,
    defaultValue,
    value,
    onValueChange,
    collapsible,
    'data-tone': tone,
    className: className ? `${styles.accordionRoot} ${className}` : styles.accordionRoot
  };

  return <AccordionPrimitive.Root {...(rootProps as any)}>{children}</AccordionPrimitive.Root>;
}

Accordion.Item = AccordionItem;
