import { ExtendedHead } from "@/components/ExtendedHead";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	return (
		<>
			<ExtendedHead title={"Home"} description={""} />
			<main className={`${inter.className}`}>
				<p>hello world</p>
			</main>
		</>
	);
}
