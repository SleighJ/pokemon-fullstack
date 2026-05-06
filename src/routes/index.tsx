import { createFileRoute } from '@tanstack/react-router';
import { handleInfinitePokemon } from '#/server/handlers/pokemon.handlers';
import { DEFAULT_QUERY_LIMIT } from '#/server/constants';
import { QUERY_KEY_POKEMON_LIST } from '#/hooks/fetch/pokemon.fetch';
import { PokemonList } from '#/components/pokemon-list/pokemon-list.component';
import type { PokemonInfinitePage } from '#/server/queries/pokemon.query';

export const Route = createFileRoute('/')({
  component: App,
  loader: async ({ context }) => {
    const pageSize = DEFAULT_QUERY_LIMIT;
    await context.queryClient.prefetchInfiniteQuery({
      queryKey: [QUERY_KEY_POKEMON_LIST, { pageSize }] as const,
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        handleInfinitePokemon({
          data: {
            page: pageParam,
            limit: pageSize
          },
        }),
      getNextPageParam: (last: PokemonInfinitePage) => last.hasNextPage ? last.page + 1 : undefined }
    );
  },
});

function App() {
  return (
    <main>
      <PokemonList />
    </main>
  );
}