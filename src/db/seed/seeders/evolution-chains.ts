import { sql } from 'drizzle-orm'

import { evolutionChains, evolutions } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import { chunk, idFromUrl } from '../helpers.ts'
import type { Db } from '../helpers.ts'

type EvolutionDetail = {
  min_level: number | null
  min_happiness: number | null
  min_affection: number | null
  min_beauty: number | null
  time_of_day: string
  gender: { name: string; url?: string } | null
  needs_overworld_rain: boolean
  turn_upside_down: boolean
  item: { name: string } | null
  held_item: { name: string } | null
  known_move: { name: string } | null
  known_move_type: { name: string } | null
  location: { name: string } | null
  trigger: { name: string }
}

type ChainLink = {
  species: { name: string; url: string }
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

type ChainResource = {
  id: number
  baby_trigger_item: unknown
  chain: ChainLink
}

type EvoInsert = typeof evolutions.$inferInsert

function collectEvolutionRows(
  parentSpeciesName: string | null,
  link: ChainLink,
  chainId: number,
): EvoInsert[] {
  const rows: EvoInsert[] = []
  const selfName = link.species.name

  if (parentSpeciesName) {
    for (const d of link.evolution_details) {
      rows.push({
        chainId,
        speciesName: selfName,
        evolvesFromSpeciesName: parentSpeciesName,
        trigger: d.trigger.name,
        minLevel: d.min_level,
        minHappiness: d.min_happiness,
        minAffection: d.min_affection,
        minBeauty: d.min_beauty,
        itemName: d.item?.name ?? null,
        heldItemName: d.held_item?.name ?? null,
        knownMoveName: d.known_move?.name ?? null,
        knownMoveTypeName: d.known_move_type?.name ?? null,
        locationName: d.location?.name ?? null,
        gender:
          d.gender && typeof d.gender.url === 'string'
            ? idFromUrl(d.gender.url)
            : null,
        timeOfDay: d.time_of_day || null,
        needsOverworldRain: d.needs_overworld_rain,
        turnUpsideDown: d.turn_upside_down,
      })
    }
  }

  for (const child of link.evolves_to) {
    rows.push(...collectEvolutionRows(selfName, child, chainId))
  }
  return rows
}

export async function seedEvolutionChains(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  await db.delete(evolutions)

  const list = await client.listAll('evolution-chain/')
  const slice = limit ? list.slice(0, limit) : list
  const chainRows: (typeof evolutionChains.$inferInsert)[] = []
  const evoRows: EvoInsert[] = []

  for (const item of slice) {
    const c = await client.fetchJsonLimited<ChainResource>(item.url)
    const rootName = c.chain.species.name
    chainRows.push({
      id: c.id,
      babySpeciesName: rootName,
    })
    evoRows.push(...collectEvolutionRows(null, c.chain, c.id))
  }

  for (const batch of chunk(chainRows, 200)) {
    if (!batch.length) continue
    await db
      .insert(evolutionChains)
      .values(batch)
      .onConflictDoUpdate({
        target: evolutionChains.id,
        set: {
          babySpeciesName: sql`excluded.baby_species_name`,
        },
      })
  }

  for (const batch of chunk(evoRows, 500)) {
    if (!batch.length) continue
    await db.insert(evolutions).values(batch)
  }
}
