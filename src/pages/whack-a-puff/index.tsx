import Jigglypuff from "@/components/Jigglypuff";
import ExtendedHead from "@/components/ExtendedHead";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Container from "@/components/Container";

export default function WhackAPuff() {
	return (
		<>
			<Header>
				<Navbar />
			</Header>
			<ExtendedHead title={"Home"} />
			<Container>
				<h1>Whack-A-Puff</h1>
				<p>Whack the puff</p>
				<Jigglypuff />
			</Container>
		</>
	);
}
