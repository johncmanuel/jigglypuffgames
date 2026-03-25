import Image from "next/image";
import { getWigglytuffSprite } from "@/internal/pokeapi/pokemon";

interface WigglytuffProps {
  width?: number;
  height?: number;
}

const Wigglytuff: React.FC<WigglytuffProps> = ({ width, height, ...props }) => {
  const wigglytuffSprite = getWigglytuffSprite();
  const _width = width ?? 250;
  const _height = height ?? 250;

  return (
    <Image
      src={wigglytuffSprite}
      alt={"Image of Wigglytuff"}
      width={_width}
      height={_height}
      {...props}
    />
  );
};

export default Wigglytuff;
