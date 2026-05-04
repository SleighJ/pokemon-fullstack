import { sql } from 'drizzle-orm'

import { moves } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import {
  chunk,
  idFromUrl,
  pickEnglishEffect,
  pickEnglishShortEffect,
} from '../helpers.ts'
import type { Db } from '../helpers.ts'

type MoveResource = {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  type: { url: string } | null
  damage_class: { name: string } | null
  generation: { url: string } | null
  target: { name: string } | null
  effect_entries: Array<{
    effect: string
    short_effect: string
    language: { name: string }
  }>
}

export async function seedMoves(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('move/')
  const slice = limit ? list.slice(0, limit) : list
  const rows: (typeof moves.$inferInsert)[] = []

  for (const item of slice) {
    const m = await client.fetchJsonLimited<MoveResource>(item.url)
    rows.push({
      id: m.id,
      name: m.name,
      accuracy: m.accuracy,
      power: m.power,
      pp: m.pp,
      priority: m.priority,
      typeId: m.type ? idFromUrl(m.type.url) : null,
      damageClass: m.damage_class?.name ?? null,
      generationId: m.generation ? idFromUrl(m.generation.url) : null,
      target: m.target?.name ?? null,
      effectShortEn: pickEnglishShortEffect(m.effect_entries),
      effectEn: pickEnglishEffect(m.effect_entries),
    })
  }

  for (const batch of chunk(rows, 200)) {
    if (!batch.length) continue
    await db
      .insert(moves)
      .values(batch)
      .onConflictDoUpdate({
        target: moves.id,
        set: {
          name: sql`excluded.name`,
          accuracy: sql`excluded.accuracy`,
          power: sql`excluded.power`,
          pp: sql`excluded.pp`,
          priority: sql`excluded.priority`,
          typeId: sql`excluded.type_id`,
          damageClass: sql`excluded.damage_class`,
          generationId: sql`excluded.generation_id`,
          target: sql`excluded.target`,
          effectShortEn: sql`excluded.effect_short_en`,
          effectEn: sql`excluded.effect_en`,
        },
      })
  }
}
