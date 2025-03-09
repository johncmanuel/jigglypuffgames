import Image from "next/image";
import { getIgglybuffSprite } from "@/internal/pokeapi/pokemon";

interface IgglybuffProps {
  width?: number;
  height?: number;
}

const Igglybuff: React.FC<IgglybuffProps> = ({ width, height, ...props }) => {
  const igglybuffSprite = getIgglybuffSprite();
  const _width = width ?? 250;
  const _height = height ?? 250;

  return (
    <Image
      src={igglybuffSprite}
      alt={"Image of Jigglypuff"}
      width={_width}
      height={_height}
      {...props}
    />
  );
};

export default Igglybuff;
