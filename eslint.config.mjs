import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  {
    // Node CLI scripts (the NocoDB content migration) run outside the browser,
    // so they legitimately use Node globals the Studio config does not declare.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortSignal: 'readonly',
      },
    },
  },
]
