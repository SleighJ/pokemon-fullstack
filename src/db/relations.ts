import { relations } from 'drizzle-orm'

import {
  abilities,
  evolutionChains,
  evolutions,
  generations,
  moves,
  pokemon,
  pokemonAbilities,
  pokemonMoves,
  pokemonSpecies,
  pokemonStats,
  pokemonTypes,
  stats,
  typeDamageRelations,
  types,
} from './schema.ts'

export const generationsRelations = relations(generations, ({ many }) => ({
  abilities: many(abilities),
  moves: many(moves),
  species: many(pokemonSpecies),
  types: many(types),
}))

export const typesRelations = relations(types, ({ one, many }) => ({
  generation: one(generations, {
    fields: [types.generationId],
    references: [generations.id],
  }),
  damageRelationsFrom: many(typeDamageRelations, { relationName: 'fromType' }),
  damageRelationsTo: many(typeDamageRelations, { relationName: 'toType' }),
  pokemonTypes: many(pokemonTypes),
  moves: many(moves),
}))

export const typeDamageRelationsRelations = relations(
  typeDamageRelations,
  ({ one }) => ({
    fromType: one(types, {
      fields: [typeDamageRelations.typeId],
      references: [types.id],
      relationName: 'fromType',
    }),
    toType: one(types, {
      fields: [typeDamageRelations.targetTypeId],
      references: [types.id],
      relationName: 'toType',
    }),
  }),
)

export const abilitiesRelations = relations(abilities, ({ one, many }) => ({
  generation: one(generations, {
    fields: [abilities.generationId],
    references: [generations.id],
  }),
  pokemonAbilities: many(pokemonAbilities),
}))

export const movesRelations = relations(moves, ({ one, many }) => ({
  type: one(types, { fields: [moves.typeId], references: [types.id] }),
  generation: one(generations, {
    fields: [moves.generationId],
    references: [generations.id],
  }),
  pokemonMoves: many(pokemonMoves),
}))

export const evolutionChainsRelations = relations(
  evolutionChains,
  ({ many }) => ({
    evolutions: many(evolutions),
    species: many(pokemonSpecies),
  }),
)

export const evolutionsRelations = relations(evolutions, ({ one }) => ({
  chain: one(evolutionChains, {
    fields: [evolutions.chainId],
    references: [evolutionChains.id],
  }),
}))

export const pokemonSpeciesRelations = relations(
  pokemonSpecies,
  ({ one, many }) => ({
    generation: one(generations, {
      fields: [pokemonSpecies.generationId],
      references: [generations.id],
    }),
    evolutionChain: one(evolutionChains, {
      fields: [pokemonSpecies.evolutionChainId],
      references: [evolutionChains.id],
    }),
    pokemon: many(pokemon),
  }),
)

export const pokemonRelations = relations(pokemon, ({ one, many }) => ({
  species: one(pokemonSpecies, {
    fields: [pokemon.speciesId],
    references: [pokemonSpecies.id],
  }),
  types: many(pokemonTypes),
  abilities: many(pokemonAbilities),
  stats: many(pokemonStats),
  moves: many(pokemonMoves),
}))

export const pokemonTypesRelations = relations(pokemonTypes, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [pokemonTypes.pokemonId],
    references: [pokemon.id],
  }),
  type: one(types, { fields: [pokemonTypes.typeId], references: [types.id] }),
}))

export const pokemonAbilitiesRelations = relations(
  pokemonAbilities,
  ({ one }) => ({
    pokemon: one(pokemon, {
      fields: [pokemonAbilities.pokemonId],
      references: [pokemon.id],
    }),
    ability: one(abilities, {
      fields: [pokemonAbilities.abilityId],
      references: [abilities.id],
    }),
  }),
)

export const pokemonStatsRelations = relations(pokemonStats, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [pokemonStats.pokemonId],
    references: [pokemon.id],
  }),
  stat: one(stats, { fields: [pokemonStats.statId], references: [stats.id] }),
}))

export const statsRelations = relations(stats, ({ many }) => ({
  pokemonStats: many(pokemonStats),
}))

export const pokemonMovesRelations = relations(pokemonMoves, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [pokemonMoves.pokemonId],
    references: [pokemon.id],
  }),
  move: one(moves, { fields: [pokemonMoves.moveId], references: [moves.id] }),
}))
