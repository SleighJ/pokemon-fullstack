import { db } from '../index.ts'
import { createPokeClient } from './poke-client.ts'
import { parseArgs, shouldRunStage } from './helpers.ts'
import { seedGenerations } from './seeders/generations.ts'
import { seedPokedexes } from './seeders/pokedexes.ts'
import { seedStats } from './seeders/stats.ts'
import { seedTypes } from './seeders/types.ts'
import { seedAbilities } from './seeders/abilities.ts'
import { seedMoves } from './seeders/moves.ts'
import { seedEvolutionChains } from './seeders/evolution-chains.ts'
import { seedSpecies } from './seeders/species.ts'
import { seedPokemon } from './seeders/pokemon.ts'

type Stage =
  | 'generations'
  | 'pokedexes'
  | 'stats'
  | 'types'
  | 'abilities'
  | 'moves'
  | 'evolution-chains'
  | 'species'
  | 'pokemon'

async function main(): Promise<void> {
  const { only, noCache, limit, concurrency } = parseArgs(process.argv.slice(2))

  if (!process.env.DATABASE_URL) {
    console.error(
      'DATABASE_URL is not set. Copy .env.local and run `npm run db:up`.',
    )
    process.exit(1)
  }

  const client = createPokeClient({ noCache, concurrency })

  const run = async (name: Stage, fn: () => Promise<void>) => {
    if (!shouldRunStage(only, name)) {
      console.log(`[skip] ${name}`)
      return
    }
    console.log(`\n--- ${name} ---`)
    console.time(name)
    try {
      await fn()
    } finally {
      console.timeEnd(name)
    }
  }

  await run('generations', () => seedGenerations(db, client, limit))
  await run('pokedexes', () => seedPokedexes(db, client, limit))
  await run('stats', () => seedStats(db, client, limit))
  await run('types', () => seedTypes(db, client, limit))
  await run('abilities', () => seedAbilities(db, client, limit))
  await run('moves', () => seedMoves(db, client, limit))
  await run('evolution-chains', () => seedEvolutionChains(db, client, limit))
  await run('species', () => seedSpecies(db, client, limit))
  await run('pokemon', () => seedPokemon(db, client, limit, 'pokemon'))

  console.log('\nSeed finished.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
