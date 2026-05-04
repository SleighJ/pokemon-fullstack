import { sql } from 'drizzle-orm'

import { pokemonSpecies } from '../../schema.ts'
import type { PokeClient } from '../poke-client.ts'
import {
  chunk,
  idFromUrl,
  pickEnglishFlavorText,
  pickEnglishGenus,
} from '../helpers.ts'
import type { Db } from '../helpers.ts'

type SpeciesResource = {
  id: number
  name: string
  order: number
  generation: { url: string } | null
  evolution_chain: { url: string } | null
  evolves_from_species: { name: string } | null
  color: { name: string }
  shape: { name: string }
  habitat: { name: string } | null
  growth_rate: { name: string }
  gender_rate: number
  capture_rate: number
  base_happiness: number
  hatch_counter: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  has_gender_differences: boolean
  forms_switchable: boolean
  flavor_text_entries: Array<{
    flavor_text: string
    language: { name: string }
  }>
  genera: Array<{ genus: string; language: { name: string } }>
  pokedex_numbers: Array<{
    entry_number: number
    pokedex: { name: string; url: string }
  }>
}

function nationalDexNumber(s: SpeciesResource): number | null {
  const national = s.pokedex_numbers.find((p) => p.pokedex.name === 'national')
  if (national) return national.entry_number
  return s.order > 0 ? s.order : null
}

function latestEnglishFlavor(
  entries: SpeciesResource['flavor_text_entries'],
): string | null {
  if (!entries.length) return null
  const english = entries.filter((e) => e.language.name === 'en')
  const pick = english.length
    ? english[english.length - 1]
    : entries[entries.length - 1]
  return pickEnglishFlavorText([pick])
}

export async function seedSpecies(
  db: Db,
  client: PokeClient,
  limit: number | null,
): Promise<void> {
  const list = await client.listAll('pokemon-species/')
  const slice = limit ? list.slice(0, limit) : list
  const rows: (typeof pokemonSpecies.$inferInsert)[] = []

  for (const item of slice) {
    const s = await client.fetchJsonLimited<SpeciesResource>(item.url)
    rows.push({
      id: s.id,
      name: s.name,
      pokedexNumberNational: nationalDexNumber(s),
      generationId: s.generation ? idFromUrl(s.generation.url) : null,
      evolutionChainId: s.evolution_chain
        ? idFromUrl(s.evolution_chain.url)
        : null,
      evolvesFromSpeciesName: s.evolves_from_species?.name ?? null,
      color: s.color.name,
      shape: s.shape.name,
      habitat: s.habitat?.name ?? null,
      growthRate: s.growth_rate.name,
      genderRate: s.gender_rate,
      captureRate: s.capture_rate,
      baseHappiness: s.base_happiness,
      hatchCounter: s.hatch_counter,
      isBaby: s.is_baby,
      isLegendary: s.is_legendary,
      isMythical: s.is_mythical,
      hasGenderDifferences: s.has_gender_differences,
      formsSwitchable: s.forms_switchable,
      genusEn: pickEnglishGenus(s.genera),
      flavorTextEn: latestEnglishFlavor(s.flavor_text_entries),
    })
  }

  for (const batch of chunk(rows, 200)) {
    if (!batch.length) continue
    await db
      .insert(pokemonSpecies)
      .values(batch)
      .onConflictDoUpdate({
        target: pokemonSpecies.id,
        set: {
          name: sql`excluded.name`,
          pokedexNumberNational: sql`excluded.pokedex_number_national`,
          generationId: sql`excluded.generation_id`,
          evolutionChainId: sql`excluded.evolution_chain_id`,
          evolvesFromSpeciesName: sql`excluded.evolves_from_species_name`,
          color: sql`excluded.color`,
          shape: sql`excluded.shape`,
          habitat: sql`excluded.habitat`,
          growthRate: sql`excluded.growth_rate`,
          genderRate: sql`excluded.gender_rate`,
          captureRate: sql`excluded.capture_rate`,
          baseHappiness: sql`excluded.base_happiness`,
          hatchCounter: sql`excluded.hatch_counter`,
          isBaby: sql`excluded.is_baby`,
          isLegendary: sql`excluded.is_legendary`,
          isMythical: sql`excluded.is_mythical`,
          hasGenderDifferences: sql`excluded.has_gender_differences`,
          formsSwitchable: sql`excluded.forms_switchable`,
          genusEn: sql`excluded.genus_en`,
          flavorTextEn: sql`excluded.flavor_text_en`,
        },
      })
  }
}
