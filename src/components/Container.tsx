import { ReactNode, FC, Ref } from "react";

// export default function Container({
// 	children,
// 	...props
// }: {
// 	children: ReactNode;
// }) {
// 	return (
// 		<main className="container" {...props}>
// 			{children}
// 		</main>
// 	);
// }

interface ContainerProps {
  children: ReactNode;
}

const Container: FC<ContainerProps> = ({ children, ...props }) => {
  return (
    <main className="container" {...props}>
      {children}
    </main>
  );
};

export default Container;
