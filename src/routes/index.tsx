import { createFileRoute } from '@tanstack/react-router';
import { fetchAllPokemon } from '#/server/handlers/pokemon.handlers';
import type { Pokemon } from './types/ui_pokemon.types';
import { PokemonCard } from '#/components/pokemon-card/pokemon-card.component';

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await fetchAllPokemon(),
});

function App() {
  const { pokemonList }: { pokemonList: Pokemon[] } = Route.useLoaderData();
  return (
    <main>
      {pokemonList.map((pokemon) => {
        return (
          <PokemonCard
            key={pokemon.id}
            {...pokemon}
          />
        )
      })}
    </main>
  )
}
