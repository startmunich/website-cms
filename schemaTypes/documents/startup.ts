import {RocketIcon} from '@sanity/icons/Rocket'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** A START Munich member who founded the startup. */
const founderFields = [
  defineField({
    name: 'name',
    title: 'Name',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'role',
    title: 'Role',
    type: 'string',
    description: 'e.g. "Co-Founder & CTO".',
  }),
  defineField({
    name: 'batch',
    title: 'Member batch',
    type: 'string',
    description: 'The member batch the founder joined in, e.g. "WS25".',
  }),
  defineField({
    name: 'image',
    title: 'Portrait',
    type: 'image',
    options: {hotspot: true},
  }),
  defineField({
    name: 'linkedin',
    title: 'LinkedIn profile',
    type: 'url',
    validation: (rule) => rule.uri({scheme: ['https']}),
  }),
]

/**
 * A portfolio company shown on `/startups` and `/startup-details/[id]`.
 *
 * Migrated from the NocoDB `OurStartups` table. `legacyId` carries the original
 * NocoDB `Id` so the `/startup-details/[id]` route keeps resolving the same URLs
 * — see `STARTUPS_QUERY` in the website repo.
 */
export const startupType = defineType({
  name: 'startup',
  title: 'Startup',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Startup name',
      type: 'string',
      description: 'The company name as displayed on the card and detail page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      description: 'The detail page URL. Generated automatically from the name.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legacyId',
      title: 'Legacy ID',
      type: 'string',
      description:
        'Original NocoDB row ID, kept so existing /startup-details links keep working after the migration.',
      readOnly: true,
      hidden: ({value}) => value === undefined,
    }),
    defineField({
      name: 'summary',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'One-line pitch shown on the startup card.',
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'text',
      rows: 8,
      description: 'The longer company description shown on the detail page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Company logo',
      type: 'image',
      options: {hotspot: true},
      description: 'The company logo shown on the card, marquee and detail page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'The company website. The scheme is added automatically if omitted.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          return /^https?:\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(value)
            ? true
            : 'Must be a domain or a full URL'
        }),
    }),
    defineField({
      name: 'foundingYear',
      title: 'Founding year',
      type: 'number',
      description: 'Year the company was founded.',
      validation: (rule) => rule.integer().min(1800).max(2100),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'string'}],
      description: 'e.g. FinTech, Health, SaaS. Used for the directory filters.',
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'isSpotlight',
      title: 'Spotlight startup',
      type: 'boolean',
      description: 'Highlights the startup on the home page marquee.',
      initialValue: false,
    }),
    defineField({
      name: 'isYCombinatorAlumni',
      title: 'Y Combinator alumni',
      type: 'boolean',
      description: 'Shows the YC badge on the card and includes it in the home marquee.',
      initialValue: false,
    }),
    defineField({
      name: 'isMTZ',
      title: 'MTZ programme',
      type: 'boolean',
      description: 'Part of the MTZ (Münchner Technologiezentrum) programme.',
      initialValue: false,
    }),
    defineField({
      name: 'isEWOR',
      title: 'EWOR fellow',
      type: 'boolean',
      description: 'Part of the EWOR fellow programme.',
      initialValue: false,
    }),
    defineField({
      name: 'companyLinkedin',
      title: 'Company LinkedIn',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'milestones',
      title: 'First milestones',
      type: 'text',
      rows: 3,
      description: 'Notable first achievements, shown on the detail page.',
    }),
    defineField({
      name: 'supportingPrograms',
      title: 'Supporting programmes',
      type: 'text',
      rows: 3,
      description: 'START Munich programmes supporting this company.',
    }),
    defineField({
      name: 'founders',
      title: 'Founders',
      type: 'array',
      description:
        'The START Munich members who founded the company, in the order they should be shown. Nested rather than references: the data is only ever edited in this one form.',
      of: [
        defineArrayMember({
          name: 'founder',
          title: 'Founder',
          type: 'object',
          fields: founderFields,
          preview: {
            select: {title: 'name', subtitle: 'role', media: 'image'},
          },
        }),
      ],
    }),
  ],
  orderings: [
    {title: 'Name, A–Z', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
    {
      title: 'Spotlight first',
      name: 'spotlightFirst',
      by: [
        {field: 'isSpotlight', direction: 'desc'},
        {field: 'name', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'summary',
      media: 'logo',
      isSpotlight: 'isSpotlight',
    },
    prepare(selection) {
      const {title, subtitle, media, isSpotlight} = selection
      return {
        title: isSpotlight ? `⭐ ${title}` : title,
        subtitle,
        media,
      }
    },
  },
})
