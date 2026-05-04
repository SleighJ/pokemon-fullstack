import { sql } from 'drizzle-orm'

import { pokedexes } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import { chunk } from '../helpers.ts'
import type { Db } from '../helpers.ts'

type DexResource = {
  id: number
  name: string
  is_main_series: boolean
  region: { name: string } | null
}

export async function seedPokedexes(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('pokedex/')
  const slice = limit ? list.slice(0, limit) : list
  const rows: (typeof pokedexes.$inferInsert)[] = []

  for (const item of slice) {
    const d = await client.fetchJsonLimited<DexResource>(item.url)
    rows.push({
      id: d.id,
      name: d.name,
      regionName: d.region?.name ?? null,
      isMainSeries: d.is_main_series,
    })
  }

  for (const batch of chunk(rows, 200)) {
    if (!batch.length) continue
    await db
      .insert(pokedexes)
      .values(batch)
      .onConflictDoUpdate({
        target: pokedexes.id,
        set: {
          name: sql`excluded.name`,
          regionName: sql`excluded.region_name`,
          isMainSeries: sql`excluded.is_main_series`,
        },
      })
  }
}
