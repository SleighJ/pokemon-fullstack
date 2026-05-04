import { sql } from 'drizzle-orm'

import {
  pokemon,
  pokemonAbilities,
  pokemonMoves,
  pokemonStats,
  pokemonTypes,
} from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import { chunk, idFromUrl, logProgress } from '../helpers.ts'
import type { Db } from '../helpers.ts'

function cryUrl(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (typeof v !== 'object' || v === null) return null
  const rec = v
  if (!('url' in rec)) return null
  const u = rec.url
  return typeof u === 'string' ? u : null
}

type PokemonResource = {
  id: number
  name: string
  species: { url: string }
  height: number
  weight: number
  base_experience: number
  order: number
  is_default: boolean
  sprites: Record<string, unknown>
  cries?: {
    latest?: string | { url: string }
    legacy?: string | { url: string } | null
  }
  types: Array<{ slot: number; type: { url: string } }>
  abilities: Array<{
    slot: number
    is_hidden: boolean
    ability: { url: string }
  }>
  stats: Array<{ stat: { url: string }; base_stat: number; effort: number }>
  moves: Array<{
    move: { url: string }
    version_group_details: Array<{
      level_learned_at: number
      move_learn_method: { name: string }
      order: number | null
      version_group: { name: string }
    }>
  }>
}

const FETCH_BATCH = 24

export async function seedPokemon(
  db: Db,
  client: PokeClient,
  limit: number | null,
  stage: string,
): Promise<void> {
  await db.delete(pokemon)

  const list = await client.listAll('pokemon/')
  const slice = limit ? list.slice(0, limit) : list
  const total = slice.length

  for (let i = 0; i < slice.length; i += FETCH_BATCH) {
    const group = slice.slice(i, i + FETCH_BATCH)
    const resources = await Promise.all(
      group.map((item) => client.fetchJsonLimited<PokemonResource>(item.url)),
    )

    const pokemonRows: (typeof pokemon.$inferInsert)[] = []
    const typeRows: (typeof pokemonTypes.$inferInsert)[] = []
    const abilityRows: (typeof pokemonAbilities.$inferInsert)[] = []
    const statRows: (typeof pokemonStats.$inferInsert)[] = []
    const moveRows: (typeof pokemonMoves.$inferInsert)[] = []

    for (const p of resources) {
      pokemonRows.push({
        id: p.id,
        name: p.name,
        speciesId: idFromUrl(p.species.url),
        height: p.height,
        weight: p.weight,
        baseExperience: p.base_experience,
        order: p.order,
        isDefault: p.is_default,
        sprites: p.sprites,
        cryLatestUrl: cryUrl(p.cries?.latest),
        cryLegacyUrl: cryUrl(p.cries?.legacy),
      })

      for (const t of p.types) {
        typeRows.push({
          pokemonId: p.id,
          typeId: idFromUrl(t.type.url),
          slot: t.slot,
        })
      }

      for (const a of p.abilities) {
        abilityRows.push({
          pokemonId: p.id,
          abilityId: idFromUrl(a.ability.url),
          slot: a.slot,
          isHidden: a.is_hidden,
        })
      }

      for (const s of p.stats) {
        statRows.push({
          pokemonId: p.id,
          statId: idFromUrl(s.stat.url),
          baseStat: s.base_stat,
          effort: s.effort,
        })
      }

      for (const mv of p.moves) {
        const moveId = idFromUrl(mv.move.url)
        mv.version_group_details.forEach((vgd, detailIndex) => {
          moveRows.push({
            pokemonId: p.id,
            moveId,
            versionGroup: vgd.version_group.name,
            learnMethod: vgd.move_learn_method.name,
            levelLearnedAt: vgd.level_learned_at,
            detailIndex,
            order: vgd.order != null ? vgd.order : null,
          })
        })
      }
    }

    for (const batch of chunk(pokemonRows, 100)) {
      if (!batch.length) continue
      await db
        .insert(pokemon)
        .values(batch)
        .onConflictDoUpdate({
          target: pokemon.id,
          set: {
            name: sql`excluded.name`,
            speciesId: sql`excluded.species_id`,
            height: sql`excluded.height`,
            weight: sql`excluded.weight`,
            baseExperience: sql`excluded.base_experience`,
            order: sql`excluded.order`,
            isDefault: sql`excluded.is_default`,
            sprites: sql`excluded.sprites`,
            cryLatestUrl: sql`excluded.cry_latest_url`,
            cryLegacyUrl: sql`excluded.cry_legacy_url`,
          },
        })
    }

    for (const batch of chunk(typeRows, 500)) {
      if (batch.length) await db.insert(pokemonTypes).values(batch)
    }
    for (const batch of chunk(abilityRows, 500)) {
      if (batch.length) await db.insert(pokemonAbilities).values(batch)
    }
    for (const batch of chunk(statRows, 500)) {
      if (batch.length) await db.insert(pokemonStats).values(batch)
    }
    for (const batch of chunk(moveRows, 800)) {
      if (batch.length) {
        await db.insert(pokemonMoves).values(batch).onConflictDoNothing()
      }
    }

    logProgress(stage, Math.min(i + FETCH_BATCH, total), total, 1)
  }
}
