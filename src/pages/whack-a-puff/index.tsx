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

	const handleClicks = (newClicks: number) => {
		setClicks(newClicks);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (!gameBegin) {
		} else if (!gameBegin && timerSecs !== 0) {
			// @ts-ignore: ignore local variable being used before
			// assignment
			clearInterval(interval);
		}
		interval = setInterval(() => {
			setTimerSecs((sec) => {
				const nextSec = sec + 1;
				if (nextSec >= TIME_LIMIT_SECS) {
					endGame();
					return TIME_LIMIT_SECS;
				}
				return sec + 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [gameBegin, timerSecs]);

	return (
		<>
			<Header>
				<Navbar />
			</Header>
			<ExtendedHead title={"Whack a Puff!"} />
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
							<h1>
								Timer: {timerSecs}{" "}
								{timerSecs === 1 && <span>second</span>}{" "}
								{timerSecs !== 1 && <span>seconds</span>}
								Clicks: {clicks}
							</h1>
						)}
						{/* <Jigglypuff onClick={handleClicks} /> */}
						<JigglypuffManager
							currentClicks={clicks}
							relayClicks={handleClicks}
						/>
					</>
				)}
			</Container>
		</>
	);
}

interface JigglypuffManagerProps {
	currentClicks: number;
	relayClicks: (clicks: number) => void;
}

const getRandomPos = (imgWidth?: number, imgHeight?: number) => {
	const maxTop = imgHeight
		? window.innerHeight - imgHeight
		: window.innerHeight;
	const maxLeft = imgWidth ? window.innerWidth - imgWidth : window.innerWidth;

	const top = Math.floor(Math.random() * maxTop);
	const left = Math.floor(Math.random() * maxLeft);
	return { top, left };
};

const JigglypuffManager: React.FC<JigglypuffManagerProps> = ({
	currentClicks,
	relayClicks,
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

		relayClicks(currentClicks + 1);

		const delayMs = 500;

		setTimeout(() => {
			setPosition({ top, left });
			setVisible(true);
		}, delayMs);
	};

	return (
		<Jigglypuff
			width={JIGGLYPUFF_WIDTH_PX}
			height={JIGGLYPUFF_HEIGHT_PX}
			onClick={handleClick}
			style={{
				position: "absolute",
				top: position.top,
				left: position.left,
				visibility: visible ? "visible" : "hidden",
				transition: "visibility 0.5s ease-in-out",
				cursor: "pointer",
			}}
		/>
	);
};
