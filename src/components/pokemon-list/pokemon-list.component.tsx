import { PokemonCard } from "../pokemon-card/pokemon-card.component"
import type { Pokemon } from "#/routes/types/ui_pokemon.types"
import { pokemonListContainer } from "./pokemon-list.css";

export const PokemonList = ({ pokemonList }: { pokemonList: Pokemon[] }) => (
  <div className={pokemonListContainer}>
    {pokemonList.map((pokemon) => {
      return (
        <PokemonCard
          key={pokemon.id}
          {...pokemon}
        />
      )
    })}
  </div>
);