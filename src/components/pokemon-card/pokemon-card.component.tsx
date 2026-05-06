import type { Ref } from "react";

import { PRIMITIVE } from "#/constants";
import type { Pokemon } from "#/routes/types/ui_pokemon.types";

import { pokemonCardStyle } from "./pokemon-card.css";

type PokemonCardProps = Pokemon & {
  ref?: Ref<HTMLDivElement>;
}

export const PokemonCard = ({
  name,
  images,
  ref,
}: PokemonCardProps) => {
  const defaultImage = images?.front_default || PRIMITIVE.undefined;
  return (
    <div
      ref={ref}
      className={pokemonCardStyle}
    >
      <div
        style={{ height: '64px', width: '64px', border: '1px solid blue' }}
      >
        <img src={defaultImage} />
      </div>
      <span>{name}</span>
    </div>
  );
};