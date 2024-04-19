import { getPokemon, pokeAPIUrl } from "@/internal/pokeapi/pokemon";

export const getJigglyPuffSprite = async () => {
	const jigglypuff = await getJigglypuff();

	// Get the official artwork of Jigglypuff
	return jigglypuff.sprites.other.official_artwork.front_default;
};

export const getJigglypuff = async () => {
	const res = await getPokemon(pokeAPIUrl, "jigglypuff");
	return res.json();
};
