import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginQuery from '@tanstack/eslint-plugin-query';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...pluginQuery.configs['flat/recommended'],
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts']
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-vars': 'off' // Turn off base rule as it conflicts with TypeScript version
    }
  }
];

export default eslintConfig;
