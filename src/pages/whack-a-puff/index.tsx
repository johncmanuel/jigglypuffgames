import Jigglypuff from "@/components/Jigglypuff";
import ExtendedHead from "@/components/ExtendedHead";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { useState, useEffect } from "react";

export default function WhackAPuff() {
	const [timerSecs, setTimerSecs] = useState(1);
	const [gameBegin, setGameBegin] = useState(false);
	const [clicks, setClicks] = useState(1);
	const TIME_LIMIT_SECS = 60;

	const startGame = () => {
		setGameBegin(true);
	};

	const endGame = () => {
		setGameBegin(false);
	};

	const incrementCount = () => {
		setClicks(clicks + 1);
		console.log("clicks", clicks);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (gameBegin) {
			interval = setInterval(() => {
				setTimerSecs((sec) => {
					const nextSec = sec + 1;
					if (nextSec >= TIME_LIMIT_SECS) {
						return TIME_LIMIT_SECS;
					}
					return sec + 1;
				});
			}, 1000);
		} else if (!gameBegin && timerSecs !== 0) {
			// @ts-ignore: ignore local variable being used before
			// assignment
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [gameBegin, timerSecs]);

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
				{gameBegin && (
					<>
						{timerSecs === TIME_LIMIT_SECS && <h1>Times up!</h1>}
						{timerSecs !== TIME_LIMIT_SECS && (
							<h1>Timer: {timerSecs} seconds</h1>
						)}
						<Jigglypuff onClick={incrementCount} />
					</>
				)}
			</Container>
		</>
	);
}
