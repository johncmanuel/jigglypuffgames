import Image from "next/image";
import { getJigglyPuffSprite } from "@/internal/pokeapi/jigglypuff";

export const Jigglypuff = () => {
	const jigglypuffSprite = getJigglyPuffSprite();

	return (
		<Image
			src={jigglypuffSprite}
			alt={"Jigglypuff"}
			width={500}
			height={500}
		/>
	);
};
