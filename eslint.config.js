//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
  ...tanstackConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/array-type': 'off',
      'import/order': 'off',
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'TSUnknownKeyword',
          message:
            'Prefer a more specific type than unknown when the shape is understood.',
        },
      ],
      'sort-imports': 'off',
    },
  },
]
