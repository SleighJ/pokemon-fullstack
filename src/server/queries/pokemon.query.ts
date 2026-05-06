import { asc } from 'drizzle-orm';

import { db } from '#/db';
import { pokemon } from '#/db/schema';

export const DEFAULT_QUERY_LIMIT = 50;
export const MAX_QUERY_LIMIT = 100;

export const QUERY_ALL_POKEMON_PARAMS = {
  page: 1,
  limit: DEFAULT_QUERY_LIMIT,
}

interface AllPokemonQueryParams {
  page: number,
  limit: number,
}

export const queryAllPokemon = async ({
  page,
  limit,
}: AllPokemonQueryParams) => {
  const sanitizedPage = Math.max(1, Math.floor(page));
  const sanitizedLimit = Math.min(MAX_QUERY_LIMIT, Math.max(1, Math.floor(limit)));

  const offset = (sanitizedPage - 1) * sanitizedLimit;
  const rows = await db
    .select({
      id: pokemon.id,
      name: pokemon.name,
      order: pokemon.order,
      images: pokemon.sprites,
    })
    .from(pokemon)
    .orderBy(asc(pokemon.name))
    .limit(sanitizedLimit)
    .offset(offset)

    return { pokemonList: rows };
};