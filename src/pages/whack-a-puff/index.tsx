import Jigglypuff from "@/components/Jigglypuff";
import ExtendedHead from "@/components/ExtendedHead";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Container from "@/components/Container";
import {
  useState,
  useEffect,
  useRef,
  MutableRefObject,
  RefObject,
} from "react";
import useClickOutside from "@/hooks/useOnOutsideClick";
import Clefairy from "@/components/Clefairy";

export default function WhackAPuff() {
  const initPoints = 0;
  const initStreak = 0;
  const TIME_LIMIT_SECS = 30;
  const initTimerSecs = TIME_LIMIT_SECS;

  const [timerSecs, setTimerSecs] = useState(initTimerSecs);
  const [gameBegin, setGameBegin] = useState(false);
  const [playedPreviously, setPlayedPreviously] = useState(false);
  const [points, setPoints] = useState(initPoints);
  const [pointsStreak, setPointsStreak] = useState(initStreak);
  const [maxPointsStreak, setMaxPointsStreak] = useState(initStreak);
  const [isStreakBroken, setStreakBroken] = useState(false);

  const triggerRef = useRef<HTMLElement>(null);
  const refs: MutableRefObject<HTMLElement | null>[] = [triggerRef];

  // Track any clicks in the playable area, excluding Jigglypuff
  useClickOutside(refs, () => setStreakBroken(true));

  // Reset any state data to their initial values
  // when starting the game
  const startGame = () => {
    setGameBegin(true);
    setPoints(points >= 0 ? initPoints : points);
    setTimerSecs(TIME_LIMIT_SECS);
    setPointsStreak(pointsStreak > 0 ? initStreak : pointsStreak);
    setMaxPointsStreak(maxPointsStreak > 0 ? initStreak : maxPointsStreak);
    setPlayedPreviously(playedPreviously ? false : playedPreviously);
    setStreakBroken(isStreakBroken ? false : isStreakBroken);
  };

  const endGame = () => {
    setPlayedPreviously(true);
    setGameBegin(false);
  };

  const handlePoints = (updatedPoints: number) => {
    setPoints(updatedPoints);
  };

  const handleStreak = (updatedStreak: number) => {
    setPointsStreak(isStreakBroken ? 0 : updatedStreak);
    setMaxPointsStreak(Math.max(maxPointsStreak, pointsStreak));
  };

  const handleBrokenStreak = (updatedIsStreakBroken: boolean) => {
    setStreakBroken(updatedIsStreakBroken);
  };

  // Manage timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!gameBegin && timerSecs !== TIME_LIMIT_SECS) {
      // @ts-ignore: ignore error regarding usage of variable before
      // assignment
      clearInterval(interval);
    } else {
      interval = setInterval(() => {
        setTimerSecs((sec) => {
          const nextSec = sec - 1;
          if (nextSec <= 0) {
            endGame();
            // () => clearInterval(interval);
            return 0;
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameBegin]);

  // Manage streak
  useEffect(() => {
    if (isStreakBroken) {
      setPointsStreak(initStreak);
      setStreakBroken(false);
    }
    return () => {
      setPointsStreak(initStreak);
    };
  }, [isStreakBroken]);

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
            <h2>Total points earned: {points}</h2>
            <h2>Highest streak: {maxPointsStreak}</h2>
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
                Timer: {timerSecs} {timerSecs === 1 && <span>second</span>}{" "}
                {timerSecs !== 1 && <span>seconds</span>}
                <br />
                Clicks: {points}
                <br />
                Streak: {pointsStreak}
              </h1>
            )}
            {/* https://stackoverflow.com/a/63130433 */}
            <div ref={triggerRef as RefObject<HTMLDivElement>}>
              <GameManager
                currentPoints={points}
                currentStreak={pointsStreak}
                updatePoints={handlePoints}
                updateStreak={handleStreak}
                updateIfStreakBroken={handleBrokenStreak}
              />
            </div>
          </>
        )}
      </Container>
    </>
  );
}

interface GameManagerProps {
  currentPoints: number;
  currentStreak: number;
  updatePoints: (points: number) => void;
  updateStreak: (streak: number) => void;
  updateIfStreakBroken: (streakBroken: boolean) => void;
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

const GameManager: React.FC<GameManagerProps> = ({
  currentPoints,
  currentStreak,
  updatePoints,
  updateStreak,
  updateIfStreakBroken,
}) => {
  const initPos = getRandomPos();
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({
    top: initPos.top,
    left: initPos.left,
  });
  const [isClefairy, setIsClefairy] = useState(false);

  const chanceClefairySpawns = 0.2;
  const canSpawnClefairy = Math.random() < chanceClefairySpawns;

  // hide clefairy after 1 second if not clicked
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isClefairy && visible) {
      timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          const { top, left } = getRandomPos();
          setPosition({ top, left });
          setVisible(true);
          setIsClefairy(canSpawnClefairy);
        }, 500);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [isClefairy, visible]);

  const handleClick = () => {
    setVisible(false);

    const { top, left } = getRandomPos();

    if (isClefairy) {
      // points can't go below 0
      const deductedPoints = Math.max(currentPoints - 10, 0);
      updatePoints(deductedPoints);
      updateIfStreakBroken(true);
    } else {
      updatePoints(currentPoints + 1);
      updateIfStreakBroken(false);
      updateStreak(currentStreak + 1);
    }

    setIsClefairy(canSpawnClefairy);
    setTimeout(() => {
      setPosition({ top, left });
      setVisible(true);
    });
  };

  return (
    <>
      {isClefairy ? (
        <Clefairy
          // @ts-ignore
          onClick={handleClick}
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            visibility: visible ? "visible" : "hidden",
            cursor: "pointer",
          }}
        />
      ) : (
        <Jigglypuff
          // @ts-ignore
          onClick={handleClick}
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            visibility: visible ? "visible" : "hidden",
            cursor: "pointer",
          }}
        />
      )}
    </>
  );
};
