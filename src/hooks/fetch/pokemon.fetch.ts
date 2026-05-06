import { useInfiniteQuery } from '@tanstack/react-query';
import { handleInfinitePokemon } from '#/server/handlers/pokemon.handlers';
import { DEFAULT_QUERY_LIMIT } from '#/server/constants';
import { PRIMITIVE } from '#/constants';

export const QUERY_KEY_POKEMON_LIST = 'pokemon-list' as const;

export function useFetchPokemonList(pageSize = DEFAULT_QUERY_LIMIT) {
  const pokemonQuery = useInfiniteQuery({
    queryKey: [QUERY_KEY_POKEMON_LIST, { pageSize }] as const,
    queryFn: ({ pageParam }) => handleInfinitePokemon({
      data: {
        page: pageParam,
        limit: pageSize
      }}),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasNextPage ? last.page + 1 : PRIMITIVE.undefined,
  });

  const pages = pokemonQuery.data?.pages || [];
  const pokemonList = pages.flatMap((page) => page.pokemonList);

  const pokemonInfiniteList = {
    ...pokemonQuery,
    pokemonList,
  };

  return pokemonInfiniteList;
};