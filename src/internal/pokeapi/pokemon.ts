// import { getPokemon, pokeAPIUrl } from "@/internal/pokeapi/pokemon";
import jigglypuff from "@/internal/pokeapi/jigglypuff.json";
import clefairy from "@/internal/pokeapi/clefairy.json";

export const getJigglyPuffSprite = () => {
  return jigglypuff.sprites.other["official-artwork"].front_default;
};

export const getClefairySprite = () => {
  return clefairy.sprites.other["official-artwork"].front_default;
};

// export const getJigglypuff = async () => {
// 	return await getPokemon(pokeAPIUrl, "jigglypuff");
// };
