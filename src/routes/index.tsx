import { createFileRoute } from '@tanstack/react-router';
import { fetchAllPokemon } from '#/server/handlers/pokemon.handlers';
import { PokemonList } from '#/components/pokemon-list/pokemon-list.component';
import type { Pokemon } from './types/ui_pokemon.types';

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await fetchAllPokemon(),
});

function App() {
  const { pokemonList }: { pokemonList: Pokemon[] } = Route.useLoaderData();
  return (
    <main>
      <PokemonList pokemonList={pokemonList} />
    </main>
  )
}
