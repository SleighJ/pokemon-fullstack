import { sql } from 'drizzle-orm'

import { abilities } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import {
  chunk,
  idFromUrl,
  pickEnglishEffect,
  pickEnglishShortEffect,
} from '../helpers.ts'
import type { Db } from '../helpers.ts'

type AbilityResource = {
  id: number
  name: string
  is_main_series: boolean
  generation: { url: string } | null
  effect_entries: Array<{
    effect: string
    short_effect: string
    language: { name: string }
  }>
}

export async function seedAbilities(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('ability/')
  const slice = limit ? list.slice(0, limit) : list
  const rows: (typeof abilities.$inferInsert)[] = []

  for (const item of slice) {
    const a = await client.fetchJsonLimited<AbilityResource>(item.url)
    rows.push({
      id: a.id,
      name: a.name,
      isMainSeries: a.is_main_series,
      generationId: a.generation ? idFromUrl(a.generation.url) : null,
      effectShortEn: pickEnglishShortEffect(a.effect_entries),
      effectEn: pickEnglishEffect(a.effect_entries),
    })
  }

  for (const batch of chunk(rows, 200)) {
    if (!batch.length) continue
    await db
      .insert(abilities)
      .values(batch)
      .onConflictDoUpdate({
        target: abilities.id,
        set: {
          name: sql`excluded.name`,
          isMainSeries: sql`excluded.is_main_series`,
          generationId: sql`excluded.generation_id`,
          effectShortEn: sql`excluded.effect_short_en`,
          effectEn: sql`excluded.effect_en`,
        },
      })
  }
}
