import { ExtendedHead } from "@/components/ExtendedHead";
import { Jigglypuff } from "@/components/Jigglypuff";

export default function Home() {
	return (
		<>
			<ExtendedHead title={"Home"} description={""} />
			<main>
				<p>hello world</p>
				<Jigglypuff />
			</main>
		</>
	);
}
