import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '3igm80nn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})