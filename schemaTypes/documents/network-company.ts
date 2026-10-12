import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {defineField, defineType} from 'sanity'

/**
 * A global network member company shown in the marquee on `/member-network`.
 *
 * Migrated from the NocoDB `NetworkLogos` table (which had a hardcoded table ID
 * in `app/api/member-network/route.ts`).
 */
export const networkCompanyType = defineType({
  name: 'networkCompany',
  title: 'Network company',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The company name shown in the network marquee.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'The kind of organisation, e.g. "Venture Capital".',
      options: {
        list: [
          {title: 'Venture Capital', value: 'Venture Capital'},
          {title: 'Finance', value: 'Finance'},
          {title: 'Technology', value: 'Technology'},
          {title: 'Consulting', value: 'Consulting'},
          {title: 'Other', value: 'Other'},
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      description: 'The company logo shown in the network marquee.',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{title: 'Name, A–Z', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', subtitle: 'type', media: 'logo'},
  },
})
