import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'j77hk8qc',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
    appId: 'e8c3w1w1vkcyf3ft5qstpdtr',
  },
  schemaExtraction: {
    enabled: true,
    enforceRequiredFields: true,
  },
  typegen: {
    enabled: true,
    schema: 'schema.json',
    generates: './sanity.types.ts',
  },
})
