import { PRIMITIVE } from "#/constants";
import type { Pokemon } from "#/routes/types/ui_pokemon.types";

import { pokemonCardStyle } from "./pokemon-card.css";

export const PokemonCard = ({
  name,
  images,
}: Pokemon) => {
  const defaultImage = images.front_default || PRIMITIVE.undefined;
  return (
    <div className={pokemonCardStyle}>
      <div
        style={{ height: '64px', width: '64px' }}
      >
        <img src={defaultImage} />
      </div>
      <span>{name}</span>
    </div>
  );
};