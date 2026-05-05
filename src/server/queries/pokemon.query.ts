import { db } from '#/db';
import { pokemon } from '#/db/schema';

export const queryAllPokemon = async () => {
  const rows = await db
    .select({
      id: pokemon.id,
      name: pokemon.name,
      order: pokemon.order,
    })
    .from(pokemon)
    console.log(rows);
    return { pokemon: rows };
};