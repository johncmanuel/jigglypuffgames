import Image from "next/image";
import { getClefairySprite } from "@/internal/pokeapi/pokemon";

interface ClefairyProps {
  width?: number;
  height?: number;
}

const Clefairy: React.FC<ClefairyProps> = ({ width, height, ...props }) => {
  const clefairySprite = getClefairySprite();
  const _width = width ?? 250;
  const _height = height ?? 250;

  return (
    <Image
      src={clefairySprite}
      alt={"Image of Clefairy"}
      width={_width}
      height={_height}
      {...props}
    />
  );
};

export default Clefairy;
