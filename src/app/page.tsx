/**
 * Base homepage
 * @since 2025-09-02
 * @author Michael Townsend <@continuities>
 */

import { Flex, Text } from '@radix-ui/themes';
import db from '../db';

export default async function MyApp() {
  const dbValue = (await db.query('SELECT 1 as value')).rows[0].value; // Ensure DB is initialized
  return (
    <Flex direction="column" gap="2">
      <Text>Hello World [{dbValue}]</Text>
    </Flex>
  );
}
