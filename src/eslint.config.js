import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/', 'node_modules/'],
  },
  ...tsEslint.configs.recommended,
  ...react.configs.recommended,
  prettier,
  {
    languageOptions: {
      parser: tsParser,
      ecmaFeatures: {
        jsx: true,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    env: {
      browser: true,
      node: false,
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      react,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
