const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const tsEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = defineConfig([
  {
    ignores: ['dist/', 'node_modules/', 'README.md', 'supabase/'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // ecmaVersion: 2021,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      react: react,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/prop-types': 'off',
    },
  },
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        Deno: 'readonly',
      },
    },
  },
  prettier,
  {
    rules: {
      // 'no-console': 'error',
    },
  },
]);
