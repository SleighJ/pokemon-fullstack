import { createFileRoute } from '@tanstack/react-router';
import { fetchAllPokemon } from '#/server/handlers/pokemon.handlers';

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await fetchAllPokemon(),
});

function App() {
  const { pokemon } = Route.useLoaderData();
  console.log(pokemon);
  return (
    <main>
      Hi jj
    </main>
  )
}
