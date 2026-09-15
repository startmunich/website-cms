import {TextInput} from '@sanity/ui'
import {StringInputProps, defineField, defineType, set} from 'sanity'
import {useCallback} from 'react'
import {UserIcon} from '@sanity/icons/User'

function normalizeLinkedInUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const withHttps = trimmed
    .replace(/^https?:\/\/(www\.)?/, 'https://')
    .replace(/^https:\/\/www\./, 'https://')

  return withHttps.replace(/\/+$/, '')
}

function LinkedInUrlInput(props: StringInputProps) {
  const {value, onChange} = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizeLinkedInUrl(event.currentTarget.value)
      onChange(set(normalized))
    },
    [onChange],
  )

  return (
    <TextInput
      type="url"
      value={value ?? ''}
      onChange={handleChange}
      placeholder="https://linkedin.com/in/username"
    />
  )
}

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
      options: {hotspot: true},
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