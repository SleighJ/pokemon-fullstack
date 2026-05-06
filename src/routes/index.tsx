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
    <main style={{ overflow: 'auto' }}>

      {pokemon.map((item, i) => {
        const { id, name, images } = item;
        const pokemonKey = `${i}-${id}-${name}`;
        // TODO: use an icon/fallback for image when not populated
        const frontImage = images.front_default || undefined;
        return (
          <div
            key={pokemonKey}
            style={{ height: '64px', width: '64px' }}
          >
            <img src={frontImage} />
            <span>{name}</span>
          </div>
        )
      })}
    </main>
  )
}
