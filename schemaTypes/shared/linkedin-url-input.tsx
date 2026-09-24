import {TextInput} from '@sanity/ui'
import {StringInputProps, set} from 'sanity'
import {useCallback} from 'react'
import {normalizeLinkedInUrl} from './linkedin-url'

export function LinkedInUrlInput(props: StringInputProps) {
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
