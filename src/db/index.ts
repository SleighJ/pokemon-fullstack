import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as relations from './relations.ts'
import * as schema from './schema.ts'

config({ path: ['.env.local', '.env'] })

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...schema, ...relations },
})
