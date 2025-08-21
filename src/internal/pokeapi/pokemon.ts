import wigglytuff from "@/internal/pokeapi/wigglytuff.json";
import pikachu from "@/internal/pokeapi/pikachu.json";
import jigglypuff from "@/internal/pokeapi/jigglypuff.json";
import clefairy from "@/internal/pokeapi/clefairy.json";
import igglybuff from "@/internal/pokeapi/igglybuff.json";
import screamTail from "@/internal/pokeapi/scream-tail.json";
import eevee from "@/internal/pokeapi/eevee.json";

export const getJigglyPuffSprite = () => {
  return jigglypuff.sprites.other["official-artwork"].front_default;
};

export const getClefairySprite = () => {
  return clefairy.sprites.other["official-artwork"].front_default;
};

export const getIgglybuffSprite = () => {
  return igglybuff.sprites.other["official-artwork"].front_default;
};

export const getScreamTailSprite = () => {
  return screamTail.sprites.other["official-artwork"].front_default;
};

export const getEeveeSprite = () => {
  return eevee.sprites.other["official-artwork"].front_default;
};

export const getPikachuSprite = () => {
  return pikachu.sprites.other["official-artwork"].front_default;
};

export const getWigglytuffSprite = () => {
  return wigglytuff.sprites.other["official-artwork"].front_default;
};
