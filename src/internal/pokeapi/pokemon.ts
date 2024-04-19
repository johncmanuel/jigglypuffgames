export const pokeAPIUrl = "https://pokeapi.co/api/v2";
export const pokemonEndpoint = "pokemon";

export const getPokemon = async (apiUrl: string, pokemon: string) => {
	const res = await fetch(`${apiUrl}/${pokemonEndpoint}/${pokemon}`);
	return res.json();
};
