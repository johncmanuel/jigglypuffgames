import Jigglypuff from "@/components/Jigglypuff";
import ExtendedHead from "@/components/ExtendedHead";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { useState } from "react";

export default function WhackAPuff() {
	const [timerSecs, setTimerSecs] = useState(0);
	const [gameBegin, setGameBegin] = useState(false);
	const [clicks, setClicks] = useState(1);

	const timeLimitSecs = 60;

	const startGame = () => {
		setGameBegin(true);
	};

	const incrementCount = () => {
		setClicks(clicks + 1);
		console.log("clicks", clicks);
	};

	return (
		<>
			<Header>
				<Navbar />
			</Header>
			<ExtendedHead title={"Home"} />
			<Container>
				{!gameBegin && (
					<button
						type="button"
						className="focus:outline-none text-white bg-pink-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
						onClick={startGame}
					>
						Start game
					</button>
				)}
				{gameBegin && <Jigglypuff onClick={incrementCount} />}
			</Container>
		</>
	);
}
