// import { getPokemon, pokeAPIUrl } from "@/internal/pokeapi/pokemon";
import jigglypuff from "@/internal/pokeapi/jigglypuff.json";

// Get the official artwork of Jigglypuff
export const getJigglyPuffSprite = () => {
  return jigglypuff.sprites.other["official-artwork"].front_default;
};

// export const getJigglypuff = async () => {
// 	return await getPokemon(pokeAPIUrl, "jigglypuff");
// };
