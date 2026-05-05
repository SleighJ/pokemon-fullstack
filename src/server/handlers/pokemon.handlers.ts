import { createServerFn } from '@tanstack/react-start';
import { queryAllPokemon } from '../queries/pokemon.query';

export const fetchAllPokemon = createServerFn({ method: 'GET' })
  .handler(async () => {
    const pokemon = await queryAllPokemon();
    return pokemon;
  });
  