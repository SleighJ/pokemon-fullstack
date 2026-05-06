import type { Sprites } from "#/server/types/db_pokemon.types"

export type Pokemon = {
  id: number,
  name: string,
  images: Sprites | null,
}