// TODO:
// Come up with some way to automatically update jigglypuff.json
// if new changes from the API are made. Maybe that's the right way
// to handle it? Or would it be better to store the image(s) I want
// locally in the project repo?
export const pokeAPIUrl = "https://pokeapi.co/api/v2";
export const pokemonEndpoint = "pokemon";

export const getPokemon = async (apiUrl: string, pokemon: string) => {
	const res = await fetch(`${apiUrl}/${pokemonEndpoint}/${pokemon}`);
	return res.json();
};
