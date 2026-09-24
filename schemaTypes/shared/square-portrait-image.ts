import {defineField} from 'sanity'

interface SquarePortraitImageOptions {
  name: string
  title?: string
  description?: string
}

const DEFAULT_DESCRIPTION = 'A square portrait photo. Will be cropped to 1:1.'

export function squarePortraitImage(options: SquarePortraitImageOptions) {
  const {name, title, description = DEFAULT_DESCRIPTION} = options

  return defineField({
    name,
    title,
    type: 'image',
    options: {hotspot: true},
    description,
  })
}
