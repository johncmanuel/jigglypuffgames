import Image from "next/image";
import { getScreamTailSprite } from "@/internal/pokeapi/pokemon";

interface ScreamTailProps {
  width?: number;
  height?: number;
}

const ScreamTail: React.FC<ScreamTailProps> = ({ width, height, ...props }) => {
  const screamTailSprite = getScreamTailSprite();
  const _width = width ?? 250;
  const _height = height ?? 250;

  return (
    <Image
      src={screamTailSprite}
      alt={"Image of Scream Tail"}
      width={_width}
      height={_height}
      {...props}
    />
  );
};

export default ScreamTail;
