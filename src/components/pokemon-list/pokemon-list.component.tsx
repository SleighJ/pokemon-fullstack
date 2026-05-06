import { useRef } from "react";

import { PokemonCard } from "../pokemon-card/pokemon-card.component"
import { useFetchPokemonList } from "#/hooks/fetch/pokemon.fetch";

import { pokemonListContainer } from "./pokemon-list.css";
import { useInfiniteListBindings } from "#/hooks/infinite-list/useInfiniteListBindings.hook";

export const PokemonList = () => {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  
  const {
    pokemonList,
    fetchNextPage,
    isPending,
    isFetchingNextPage,
    hasNextPage,
  } = useFetchPokemonList();

  const { lastRowRef } = useInfiniteListBindings({
    fetchNextPage,
    isPending,
    isFetchingNextPage,
    hasNextPage,
  }, { root: scrollRootRef.current });

  return (
    <div
      ref={scrollRootRef}
      className={pokemonListContainer}
    >
      {pokemonList.map((pokemon, i) => {
        return (
          <PokemonCard
            key={pokemon.id}
            ref={i === pokemonList.length - 1 ? lastRowRef : undefined}
            {...pokemon}
          />
        )
      })}
    </div>
  );
};