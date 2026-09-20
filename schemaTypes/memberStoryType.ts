import {StarIcon} from '@sanity/icons/Star'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkedInUrlInput} from './lib/LinkedInUrlInput'
import {squarePortraitImage} from './lib/squarePortraitImage'

export const memberStoryType = defineType({
  name: 'memberStory',
  title: 'Member Story',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The full name of the member, as displayed on their story card.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      description: 'The URL for this member story. Generated automatically from the name.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. "Founder & Investor". Shown next to the name on the card.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company / Startup',
      type: 'string',
      description: 'e.g. "IDNow | Bits & Pretzels". Shown next to the role on the card.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Short quote',
      type: 'text',
      rows: 3,
      description: 'A one-line quote shown on the overview card. Keep it short and personal.',
      validation: (rule) =>
        rule.required().max(280).warning('Keep it under 280 characters for best results'),
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      description: 'The cover photo displayed on the card and at the top of the story page.',
      validation: (rule) => rule.required(),
    }),
    squarePortraitImage({
      name: 'portrait',
      title: 'Portrait',
      description: 'A square portrait photo of the member. Shown prominently on the story page.',
    }),
    defineField({
      name: 'logos',
      title: 'Company logos',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'logo',
          title: 'Logo',
          type: 'object',
          fields: [
            defineField({
              name: 'src',
              title: 'Logo image URL',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['https']}),
            }),
            defineField({
              name: 'url',
              title: 'Logo link',
              type: 'url',
              description: 'Optional link opened when clicking the logo.',
              validation: (rule) => rule.uri({scheme: ['https']}),
            }),
          ],
        }),
      ],
      description: 'Optional company logos shown on the overview card.',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn profile',
      type: 'url',
      components: {input: LinkedInUrlInput},
      description: 'The member’s LinkedIn profile, opened from their story page.',
      validation: (rule) =>
        rule.uri({scheme: ['https']}).warning('Should be a valid https://linkedin.com/in/… URL'),
    }),
    defineField({
      name: 'body',
      title: 'Story content',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      description:
        'The dedicated story page. Use headings, paragraphs, quotes, or interview snippets.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'When the story is published. Defaults to today.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first on the website.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Publish date, new',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'company',
      media: 'image',
    },
  },
})
