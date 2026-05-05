import { createServerFn } from '@tanstack/react-start';
import {
  queryAllPokemon,
  QUERY_ALL_POKEMON_PARAMS,
} from '../queries/pokemon.query';

export const fetchAllPokemon = createServerFn({ method: 'GET' })
  .handler(async () => {
    const pokemon = await queryAllPokemon(QUERY_ALL_POKEMON_PARAMS);
    return pokemon;
  });
