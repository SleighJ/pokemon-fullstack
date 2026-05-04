import { sql } from 'drizzle-orm'

import { stats } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import { chunk } from '../helpers.ts'
import type { Db } from '../helpers.ts'

type StatResource = {
  id: number
  name: string
  is_battle_only: boolean
}

export async function seedStats(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('stat/')
  const slice = limit ? list.slice(0, limit) : list
  const rows: (typeof stats.$inferInsert)[] = []

  for (const item of slice) {
    const s = await client.fetchJsonLimited<StatResource>(item.url)
    rows.push({
      id: s.id,
      name: s.name,
      isBattleOnly: s.is_battle_only,
    })
  }

  for (const batch of chunk(rows, 200)) {
    if (!batch.length) continue
    await db
      .insert(stats)
      .values(batch)
      .onConflictDoUpdate({
        target: stats.id,
        set: {
          name: sql`excluded.name`,
          isBattleOnly: sql`excluded.is_battle_only`,
        },
      })
  }
}
