import Jigglypuff from "@/components/Jigglypuff";
import ExtendedHead from "@/components/ExtendedHead";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { useState, useEffect } from "react";

// TODO: Create a mobile friendly version of this game. This
// would require a lot of CSS makeovers and make the
export default function WhackAPuff() {
	const initTimerSecs = 1;
	const initClicks = 0;
	const TIME_LIMIT_SECS = 30;

	const [timerSecs, setTimerSecs] = useState(initTimerSecs);
	const [gameBegin, setGameBegin] = useState(false);
	const [playedPreviously, setPlayedPreviously] = useState(false);
	const [clicks, setClicks] = useState(initClicks);

	const startGame = () => {
		setPlayedPreviously(false);
		setGameBegin(true);
		if (clicks >= 0) {
			setClicks(initClicks);
		}
		if (timerSecs < 0) {
			setTimerSecs(initTimerSecs);
		}
	};

	const endGame = () => {
		setPlayedPreviously(true);
		setGameBegin(false);
		setTimerSecs(1);
	};

	const handleClicks = (updatedClicks: number) => {
		setClicks(updatedClicks);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (!gameBegin && timerSecs !== 0) {
			// @ts-ignore: ignore error regarding usage of variable before
			// assignment
			clearInterval(interval);
		} else {
			interval = setInterval(() => {
				setTimerSecs((sec) => {
					const nextSec = sec + 1;
					if (nextSec >= TIME_LIMIT_SECS) {
						endGame();
						// () => clearInterval(interval);
						return TIME_LIMIT_SECS;
					}
					return sec + 1;
				});
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [gameBegin]);

	return (
		<>
			<Header>
				<Navbar />
			</Header>
			<ExtendedHead title={"Whack a Puff!"} />
			<Container>
				{playedPreviously && (
					<>
						<h1>Times up!</h1>
						<h2>Total points earned: {clicks}</h2>
						<p>Play again?</p>
					</>
				)}
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
						{timerSecs !== TIME_LIMIT_SECS && (
							<h1>
								Timer: {timerSecs}{" "}
								{timerSecs === 1 && <span>second</span>}{" "}
								{timerSecs !== 1 && <span>seconds</span>}
								Clicks: {clicks}
							</h1>
						)}
						<JigglypuffManager
							currentClicks={clicks}
							updateClicks={handleClicks}
						/>
					</>
				)}
			</Container>
		</>
	);
}

interface JigglypuffManagerProps {
	currentClicks: number;
	updateClicks: (clicks: number) => void;
}

const getRandomPos = (imgWidth?: number, imgHeight?: number) => {
	const maxTop = imgHeight
		? window.innerHeight - imgHeight
		: window.innerHeight;
	const maxLeft = imgWidth ? window.innerWidth - imgWidth : window.innerWidth;

	// To prevent Jigglypuff from spawning beyond the viewport,
	// divide the max values by 2. This should keep Jigglypuff
	// within the window.
	const top = Math.floor(Math.random() * (maxTop / 2));
	const left = Math.floor(Math.random() * (maxLeft / 2));
	return { top, left };
};

const JigglypuffManager: React.FC<JigglypuffManagerProps> = ({
	currentClicks,
	updateClicks,
}) => {
	const JIGGLYPUFF_WIDTH_PX = 250;
	const JIGGLYPUFF_HEIGHT_PX = 250;

	const initPos = getRandomPos();
	const [visible, setVisible] = useState(true);
	const [position, setPosition] = useState({
		top: initPos.top,
		left: initPos.left,
	});

	const handleClick = () => {
		setVisible(false);
		const { top, left } = getRandomPos();

		updateClicks(currentClicks + 1);

		setTimeout(() => {
			setPosition({ top, left });
			setVisible(true);
		});
	};

	return (
		<Jigglypuff
			width={JIGGLYPUFF_WIDTH_PX}
			height={JIGGLYPUFF_HEIGHT_PX}
			// @ts-ignore
			onClick={handleClick}
			style={{
				position: "absolute",
				top: position.top,
				left: position.left,
				visibility: visible ? "visible" : "hidden",
				// transition: "visibility 0.5s ease-in-out",
				cursor: "pointer",
			}}
		/>
	);
};
