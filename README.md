# START Munich Website CMS

Sanity Content Studio powering the content for the START Munich website.

## Getting started

```bash
npm install
npm run dev
```

The Studio runs at [http://localhost:3333](http://localhost:3333).

## Project layout

- `schemaTypes/` — Sanity document and field definitions for the site's content models (`documents/`, `shared/`)
- `sanity.config.ts` — Studio configuration (project, dataset, plugins)
- `sanity.cli.ts` — CLI configuration (project, dataset, TypeGen + schema extraction)
- `sanity.types.ts` — TypeScript types generated from the schema (via TypeGen)
- `.husky/pre-commit` — runs `lint-staged` to format staged files with Prettier on every commit

## Common commands

| Command                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Start the Studio locally                     |
| `npm run build`          | Build the Studio for production              |
| `npm run deploy`         | Deploy the Studio                            |
| `npm run deploy-graphql` | Deploy the GraphQL API                       |
| `npm run typegen`        | Regenerate `sanity.types.ts` from the schema |

## Content models

The dataset contains editorial content types (e.g. posts, authors, member stories). The exact schema is evolving, so refer to `schemaTypes/` for the current definitions.

## Development notes

- Code is formatted with Prettier (config in `package.json`); formatting is enforced on commit via `lint-staged`.
- Linting via ESLint (see `eslint.config.mjs`).
