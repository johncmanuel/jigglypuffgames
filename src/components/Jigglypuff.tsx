import Image from "next/image";
import { getJigglyPuffSprite } from "@/internal/pokeapi/pokemon";

interface JigglypuffProps {
  width?: number;
  height?: number;
}

const Jigglypuff: React.FC<JigglypuffProps> = ({ width, height, ...props }) => {
  const jigglypuffSprite = getJigglyPuffSprite();
  const _width = width ?? 250;
  const _height = height ?? 250;

  return (
    <Image
      src={jigglypuffSprite}
      alt={"Image of Jigglypuff"}
      width={_width}
      height={_height}
      {...props}
    />
  );
};

export default Jigglypuff;
