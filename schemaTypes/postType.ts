import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{type: 'block'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'description',
      type: 'text',
      description: 'A brief summary of the post to provide context alongside the heading.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'News', value: 'news'},
          {title: 'Member Story', value: 'memberStory'},
          {title: 'Blog Post', value: 'blogPost'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorImage',
      title: 'Author image',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
  ],
})