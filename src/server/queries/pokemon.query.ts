import { asc } from 'drizzle-orm';

import { db } from '#/db';
import { pokemon } from '#/db/schema';
import { MAX_POKEMON_QUERY_LIMIT } from '../constants';

export type PokemonInfinitePage = Awaited<
  ReturnType<typeof queryInfinitePokemon>
>;

interface PokemonInfiniteQueryParams {
  page: number,
  limit: number,
}

export const queryInfinitePokemon = async ({
  page,
  limit,
}: PokemonInfiniteQueryParams) => {
  const sanitizedPage = Math.max(1, Math.floor(page));
  const sanitizedLimit = Math.min(MAX_POKEMON_QUERY_LIMIT, Math.max(1, Math.floor(limit)));

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
    .limit(sanitizedLimit + 1)
    .offset(offset)

    const hasNextPage = rows.length > sanitizedLimit;
    const paginatedRows = hasNextPage ? rows.slice(0, sanitizedLimit) : rows;

    const result = {
      pokemonList: paginatedRows,
      page: sanitizedPage,
      limit: sanitizedLimit,
      hasNextPage,
    }

    return result;
};