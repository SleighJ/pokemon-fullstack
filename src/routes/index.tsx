import { createFileRoute } from '@tanstack/react-router';
import { fetchAllPokemon } from '#/server/handlers/pokemon.handlers';
import type { Pokemon } from './types/ui_pokemon.types';

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await fetchAllPokemon(),
});

function App() {
  const { pokemon }: { pokemon: Pokemon[] } = Route.useLoaderData();

  return (
    <main>

      {pokemon.map((item, i) => {
        const { id, name, image } = item;
        const pokemonKey = `${i}-${id}-${name}`;
        console.log(image)
        return (
          <div
            key={pokemonKey}
            style={{ height: '64px', width: '64px' }}
          >
            <img src={image.front_default} />
            <span>{name}</span>
          </div>
        )
      })}
    </main>
  )
}
