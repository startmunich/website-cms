import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The headline of the post, as it will appear on the website.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'The URL for this post. Generated automatically from the title.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'News', value: 'news'},
          {title: 'Member Story', value: 'memberStory'},
          {title: 'Blog Post', value: 'blogPost'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      description: 'What type of content this post is. Used to filter posts on the website.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description:
        'A brief summary of the post shown alongside the heading. Keep it short and informative.',
      validation: (rule) => rule.required().max(280).warning('Keep it under 280 characters for best results'),
    }),
    defineField({
      name: 'image',
      title: 'Main image',
      type: 'image',
      description: 'The cover image displayed at the top of the post.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      description: 'The main content of the post.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'When the post is published. Defaults to today.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      description: 'The name of the person credited as the author of this post.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorImage',
      title: 'Author image',
      type: 'image',
      description: 'A portrait photo of the author, shown next to their name.',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Publish date, new',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'authorName',
      media: 'image',
    },
    prepare(selection) {
      const {title, author, media} = selection
      return {title, subtitle: author, media}
    },
  },
})