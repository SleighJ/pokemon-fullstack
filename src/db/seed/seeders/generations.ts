import { sql } from 'drizzle-orm'

import { generations } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import { chunk } from '../helpers.ts'
import type { Db } from '../helpers.ts'

type GenResource = {
  id: number
  name: string
  main_region: { name: string } | null
}

export async function seedGenerations(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('generation/')
  const slice = limit ? list.slice(0, limit) : list
  const rows: (typeof generations.$inferInsert)[] = []

  for (const item of slice) {
    const g = await client.fetchJsonLimited<GenResource>(item.url)
    rows.push({
      id: g.id,
      name: g.name,
      regionName: g.main_region?.name ?? null,
    })
  }

  for (const batch of chunk(rows, 200)) {
    if (!batch.length) continue
    await db
      .insert(generations)
      .values(batch)
      .onConflictDoUpdate({
        target: generations.id,
        set: {
          name: sql`excluded.name`,
          regionName: sql`excluded.region_name`,
        },
      })
  }
}
