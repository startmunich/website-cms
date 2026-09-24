import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'
import {LinkedInUrlInput} from '../shared/linkedin-url-input'
import {squarePortraitImage} from '../shared/square-portrait-image'

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
    squarePortraitImage({
      name: 'image',
      title: 'Portrait',
      description:
        'A square portrait photo of the author, shown next to their name on posts. Will be cropped to 1:1.',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn profile',
      type: 'url',
      components: {input: LinkedInUrlInput},
      description:
        'The author’s LinkedIn profile. Clicking the author name on the website opens this link.',
      validation: (rule) =>
        rule
          .required()
          .uri({scheme: ['https']})
          .warning('Should be a valid https://linkedin.com/in/… URL'),
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
