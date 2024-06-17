import Image from "next/image";
import { getJigglyPuffSprite } from "@/internal/pokeapi/jigglypuff";

export default function Jigglypuff({ ...props }) {
	const jigglypuffSprite = getJigglyPuffSprite();

	return (
		<Image
			src={jigglypuffSprite}
			alt={"Jigglypuff"}
			width={250}
			height={250}
			{...props}
		/>
	);
}
