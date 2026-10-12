import {UsersIcon} from '@sanity/icons/Users'
import {defineField, defineType} from 'sanity'

/**
 * A partner logo shown on `/partners` and in the home page partner strip.
 *
 * Migrated from the NocoDB `Partner` table. Two logo variants exist because the
 * website renders partners on both light and dark surfaces: `logo` on light,
 * `logoNoBackground` on the dark home page strip. See `isNocoDbImage` callers in
 * `app/for-partners/page.tsx` and `app/page.tsx`.
 */
export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The partner organisation name.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legacyId',
      title: 'Legacy ID',
      type: 'string',
      description: 'Original NocoDB row ID, kept for reference after the migration.',
      readOnly: true,
      hidden: ({value}) => value === undefined,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Used to group partners on /partners.',
      options: {
        list: [
          {title: 'Industry', value: 'Industry'},
          {title: 'Venture Capital', value: 'Venture Capital'},
          {title: 'Startup', value: 'Startup'},
          {title: 'Ecosystem', value: 'Ecosystem'},
          {title: 'Initiatives', value: 'Initiatives'},
          {title: 'Research', value: 'Research'},
          {title: 'Technology', value: 'Technology'},
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
      description: 'The partner logo used on light backgrounds.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logoNoBackground',
      title: 'Logo without background',
      type: 'image',
      options: {hotspot: true},
      description:
        'The transparent variant used on the dark home page strip. Falls back to the main logo when empty.',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured partners appear in the home page partner strip.',
      initialValue: false,
    }),
    defineField({
      name: 'isVisible',
      title: 'Visible on website',
      type: 'boolean',
      description: 'Uncheck to hide the partner from /partners and the home page.',
      initialValue: true,
    }),
  ],
  orderings: [
    {title: 'Name, A–Z', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
    {title: 'Category', name: 'categoryAsc', by: [{field: 'category', direction: 'asc'}]},
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category',
      media: 'logo',
      isVisible: 'isVisible',
    },
    prepare(selection) {
      const {title, category, media, isVisible} = selection
      return {
        title: isVisible ? title : `${title} (hidden)`,
        subtitle: category,
        media,
      }
    },
  },
})
