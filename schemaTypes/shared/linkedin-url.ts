export function normalizeLinkedInUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const withHttps = trimmed
    .replace(/^https?:\/\/(www\.)?/, 'https://')
    .replace(/^https:\/\/www\./, 'https://')

  return withHttps.replace(/\/+$/, '')
}
