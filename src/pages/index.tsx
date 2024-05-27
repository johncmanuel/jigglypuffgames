import ExtendedHead from "@/components/ExtendedHead";
import Jigglypuff from "@/components/Jigglypuff";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";

export default function Home() {
	return (
		<>
			<Header>
				<Navbar />
			</Header>
			<ExtendedHead title={"Home"} />
			<main className="container">
				<p>jiggly</p>
				<Jigglypuff />
			</main>
		</>
	);
}
