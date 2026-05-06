import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import type { Sprites } from '#/server/types/db_pokemon.types'

/* ------------------------------------------------------------------ */
/* Reference tables                                                    */
/* ------------------------------------------------------------------ */

export const generations = pgTable('generations', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  regionName: text('region_name'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const pokedexes = pgTable('pokedexes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  regionName: text('region_name'),
  isMainSeries: boolean('is_main_series').notNull().default(false),
})

export const stats = pgTable('stats', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  isBattleOnly: boolean('is_battle_only').notNull().default(false),
})

export const types = pgTable(
  'types',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().unique(),
    generationId: integer('generation_id').references(() => generations.id, {
      onDelete: 'set null',
    }),
    damageClass: text('damage_class'),
  },
  (t) => [index('types_name_idx').on(t.name)],
)

export const typeDamageRelations = pgTable(
  'type_damage_relations',
  {
    typeId: integer('type_id')
      .notNull()
      .references(() => types.id, { onDelete: 'cascade' }),
    targetTypeId: integer('target_type_id')
      .notNull()
      .references(() => types.id, { onDelete: 'cascade' }),
    relation: text('relation').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.typeId, t.targetTypeId, t.relation] }),
    index('tdr_target_idx').on(t.targetTypeId),
  ],
)

export const abilities = pgTable(
  'abilities',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().unique(),
    isMainSeries: boolean('is_main_series').notNull().default(true),
    generationId: integer('generation_id').references(() => generations.id, {
      onDelete: 'set null',
    }),
    effectShortEn: text('effect_short_en'),
    effectEn: text('effect_en'),
  },
  (t) => [index('abilities_name_idx').on(t.name)],
)

export const moves = pgTable(
  'moves',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().unique(),
    accuracy: integer('accuracy'),
    power: integer('power'),
    pp: integer('pp'),
    priority: integer('priority'),
    typeId: integer('type_id').references(() => types.id, {
      onDelete: 'set null',
    }),
    damageClass: text('damage_class'),
    generationId: integer('generation_id').references(() => generations.id, {
      onDelete: 'set null',
    }),
    target: text('target'),
    effectShortEn: text('effect_short_en'),
    effectEn: text('effect_en'),
  },
  (t) => [
    index('moves_name_idx').on(t.name),
    index('moves_type_idx').on(t.typeId),
  ],
)

/* ------------------------------------------------------------------ */
/* Evolution                                                           */
/* ------------------------------------------------------------------ */

export const evolutionChains = pgTable('evolution_chains', {
  id: integer('id').primaryKey(),
  babySpeciesName: text('baby_species_name'),
})

export const evolutions = pgTable(
  'evolutions',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id')
      .notNull()
      .references(() => evolutionChains.id, { onDelete: 'cascade' }),
    speciesName: text('species_name').notNull(),
    evolvesFromSpeciesName: text('evolves_from_species_name'),
    trigger: text('trigger'),
    minLevel: integer('min_level'),
    minHappiness: integer('min_happiness'),
    minAffection: integer('min_affection'),
    minBeauty: integer('min_beauty'),
    itemName: text('item_name'),
    heldItemName: text('held_item_name'),
    knownMoveName: text('known_move_name'),
    knownMoveTypeName: text('known_move_type_name'),
    locationName: text('location_name'),
    gender: integer('gender'),
    timeOfDay: text('time_of_day'),
    needsOverworldRain: boolean('needs_overworld_rain'),
    turnUpsideDown: boolean('turn_upside_down'),
  },
  (t) => [
    index('evolutions_chain_idx').on(t.chainId),
    index('evolutions_species_idx').on(t.speciesName),
  ],
)

/* ------------------------------------------------------------------ */
/* Pokemon species                                                     */
/* ------------------------------------------------------------------ */

export const pokemonSpecies = pgTable(
  'pokemon_species',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().unique(),
    pokedexNumberNational: integer('pokedex_number_national'),
    generationId: integer('generation_id').references(() => generations.id, {
      onDelete: 'set null',
    }),
    evolutionChainId: integer('evolution_chain_id').references(
      () => evolutionChains.id,
      {
        onDelete: 'set null',
      },
    ),
    evolvesFromSpeciesName: text('evolves_from_species_name'),
    color: text('color'),
    shape: text('shape'),
    habitat: text('habitat'),
    growthRate: text('growth_rate'),
    genderRate: integer('gender_rate'),
    captureRate: integer('capture_rate'),
    baseHappiness: integer('base_happiness'),
    hatchCounter: integer('hatch_counter'),
    isBaby: boolean('is_baby').notNull().default(false),
    isLegendary: boolean('is_legendary').notNull().default(false),
    isMythical: boolean('is_mythical').notNull().default(false),
    hasGenderDifferences: boolean('has_gender_differences')
      .notNull()
      .default(false),
    formsSwitchable: boolean('forms_switchable').notNull().default(false),
    genusEn: text('genus_en'),
    flavorTextEn: text('flavor_text_en'),
  },
  (t) => [
    index('species_name_idx').on(t.name),
    index('species_dex_idx').on(t.pokedexNumberNational),
    index('species_gen_idx').on(t.generationId),
  ],
)

/* ------------------------------------------------------------------ */
/* Pokemon (incl. alternate forms)                                     */
/* ------------------------------------------------------------------ */

export const pokemon = pgTable(
  'pokemon',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().unique(),
    speciesId: integer('species_id').references(() => pokemonSpecies.id, {
      onDelete: 'cascade',
    }),
    height: integer('height'),
    weight: integer('weight'),
    baseExperience: integer('base_experience'),
    order: integer('order'),
    isDefault: boolean('is_default').notNull().default(true),
    sprites: jsonb('sprites').$type<Sprites>(),
    cryLatestUrl: text('cry_latest_url'),
    cryLegacyUrl: text('cry_legacy_url'),
  },
  (t) => [
    index('pokemon_species_idx').on(t.speciesId),
    index('pokemon_name_idx').on(t.name),
  ],
)

export const pokemonTypes = pgTable(
  'pokemon_types',
  {
    pokemonId: integer('pokemon_id')
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    typeId: integer('type_id')
      .notNull()
      .references(() => types.id, { onDelete: 'cascade' }),
    slot: integer('slot').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.pokemonId, t.slot] }),
    index('pt_type_idx').on(t.typeId),
    uniqueIndex('pt_pokemon_type_uniq').on(t.pokemonId, t.typeId),
  ],
)

export const pokemonAbilities = pgTable(
  'pokemon_abilities',
  {
    pokemonId: integer('pokemon_id')
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    abilityId: integer('ability_id')
      .notNull()
      .references(() => abilities.id, { onDelete: 'cascade' }),
    slot: integer('slot').notNull(),
    isHidden: boolean('is_hidden').notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.pokemonId, t.slot] }),
    index('pa_ability_idx').on(t.abilityId),
  ],
)

export const pokemonStats = pgTable(
  'pokemon_stats',
  {
    pokemonId: integer('pokemon_id')
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    statId: integer('stat_id')
      .notNull()
      .references(() => stats.id, { onDelete: 'cascade' }),
    baseStat: integer('base_stat').notNull(),
    effort: integer('effort').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.pokemonId, t.statId] })],
)

export const pokemonMoves = pgTable(
  'pokemon_moves',
  {
    pokemonId: integer('pokemon_id')
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    moveId: integer('move_id')
      .notNull()
      .references(() => moves.id, { onDelete: 'cascade' }),
    versionGroup: text('version_group').notNull(),
    learnMethod: text('learn_method').notNull(),
    levelLearnedAt: integer('level_learned_at').notNull().default(0),
    /** Disambiguates duplicate rows from PokeAPI (same move/method/level in one group). */
    detailIndex: integer('detail_index').notNull().default(0),
    order: real('order'),
  },
  (t) => [
    primaryKey({
      columns: [
        t.pokemonId,
        t.moveId,
        t.versionGroup,
        t.learnMethod,
        t.levelLearnedAt,
        t.detailIndex,
      ],
    }),
    index('pm_pokemon_idx').on(t.pokemonId),
    index('pm_move_idx').on(t.moveId),
  ],
)
