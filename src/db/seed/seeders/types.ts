import { sql } from 'drizzle-orm'

import { typeDamageRelations, types } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import { chunk, idFromUrl } from '../helpers.ts'
import type { Db } from '../helpers.ts'

type TypeResource = {
  id: number
  name: string
  generation: { url: string } | null
  damage_relations: Record<string, Array<{ name: string; url: string }>>
}

const REL_KEYS = [
  'double_damage_to',
  'half_damage_to',
  'no_damage_to',
  'double_damage_from',
  'half_damage_from',
  'no_damage_from',
] as const

export async function seedTypes(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('type/')
  const slice = limit ? list.slice(0, limit) : list
  const typeRows: (typeof types.$inferInsert)[] = []
  const relRows: (typeof typeDamageRelations.$inferInsert)[] = []

  for (const item of slice) {
    const t = await client.fetchJsonLimited<TypeResource>(item.url)
    typeRows.push({
      id: t.id,
      name: t.name,
      generationId: t.generation ? idFromUrl(t.generation.url) : null,
      damageClass: null,
    })

    for (const key of REL_KEYS) {
      const targets = t.damage_relations[key] ?? []
      for (const tgt of targets) {
        relRows.push({
          typeId: t.id,
          targetTypeId: idFromUrl(tgt.url),
          relation: key,
        })
      }
    }
  }

  for (const batch of chunk(typeRows, 200)) {
    if (!batch.length) continue
    await db
      .insert(types)
      .values(batch)
      .onConflictDoUpdate({
        target: types.id,
        set: {
          name: sql`excluded.name`,
          generationId: sql`excluded.generation_id`,
          damageClass: sql`excluded.damage_class`,
        },
      })
  }

  if (relRows.length) {
    await db.delete(typeDamageRelations)
    for (const batch of chunk(relRows, 500)) {
      await db.insert(typeDamageRelations).values(batch)
    }
  }
}
