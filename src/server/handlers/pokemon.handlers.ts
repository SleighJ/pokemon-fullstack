import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import {
  DEFAULT_QUERY_LIMIT,
  MAX_POKEMON_QUERY_LIMIT,
} from '../constants';
import { queryInfinitePokemon } from '../queries/pokemon.query';

const infinitePokemonInputSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(MAX_POKEMON_QUERY_LIMIT).optional(),
});

export const handleInfinitePokemon = createServerFn({ method: 'GET' })
  .inputValidator(infinitePokemonInputSchema)
  .handler(async ({ data }) => {
    return queryInfinitePokemon({
      page: data.page,
      limit: data.limit ?? DEFAULT_QUERY_LIMIT,
    });
  });