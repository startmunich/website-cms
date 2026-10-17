import {at, defineMigration, setIfMissing, unset} from 'sanity/migrate'

/**
 * Moves the single nested `founder` object on startups into the `founders`
 * array, so editors can list every co-founder.
 *
 * Run with `npx sanity migration run founder-to-founders` (dry run by
 * default; add `--no-dry-run` to apply). Startups that already have a
 * `founders` list keep it untouched; the legacy field is removed either way.
 */
export default defineMigration({
  title: 'Move startup.founder into startup.founders',
  documentTypes: ['startup'],
  filter: 'defined(founder)',
  migrate: {
    document(doc) {
      const founder = doc.founder as Record<string, unknown> | undefined
      if (!founder) return []

      const {_type, ...fields} = founder
      return [
        at('founders', setIfMissing([{...fields, _type: 'founder', _key: 'migrated-founder'}])),
        at('founder', unset()),
      ]
    },
  },
})
