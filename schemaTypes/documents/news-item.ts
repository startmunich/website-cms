import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {defineField, defineType} from 'sanity'

/**
 * A news card in the scrolling news carousel on the home page.
 *
 * Migrated from the NocoDB `LatestNews` table. These are outbound announcement
 * links (mostly LinkedIn posts), not articles — so `url` is a link out rather
 * than an internal slug, and there is no body. Ordering is explicit via `order`
 * because the carousel renders the curated order, not a date sort.
 */
export const newsItemType = defineType({
  name: 'newsItem',
  title: 'News item',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The headline shown on the news card.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'The one-line teaser shown under the headline.',
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      description: 'Where the card links to. Usually the original announcement post.',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      description: 'The card image.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first in the carousel.',
      initialValue: 0,
    }),
    defineField({
      name: 'isVisible',
      title: 'Visible on website',
      type: 'boolean',
      description: 'Uncheck to hide the item without deleting it.',
      initialValue: true,
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Title, A–Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'description', media: 'image', isVisible: 'isVisible'},
    prepare(selection) {
      const {title, subtitle, media, isVisible} = selection
      return {title: isVisible ? title : `${title} (hidden)`, subtitle, media}
    },
  },
})
