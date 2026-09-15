import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The full name of the author, as displayed on their posts.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Portrait',
      type: 'image',
      description: 'A portrait photo of the author, shown next to their name on posts.',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn profile',
      type: 'url',
      description: 'The author’s LinkedIn profile. Clicking the author name on the website opens this link.',
      validation: (rule) =>
        rule
          .required()
          .uri({scheme: ['https']})
          .warning('Should be a valid https://linkedin.com URL'),
    }),
  ],
  orderings: [
    {
      title: 'Name, A–Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'linkedin',
      media: 'image',
    },
  },
})