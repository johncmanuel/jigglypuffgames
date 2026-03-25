import ExtendedHead from "@/components/ExtendedHead";
import {
  useWhackAPuffGame,
  CharacterGrid,
  MovingIgglybuff,
  CharacterType,
  RhythmGame,
  RhythmResult,
} from "@/internal/whack-a-puff";
import { useState, useEffect } from "react";
import Link from "next/link";

function SettingsPanel({
  sliderValue,
  timerDuration,
  onSliderChange,
  onTimerChange,
}: {
  sliderValue: number;
  timerDuration: number;
  onSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white/40 border border-pink-300 shadow-lg rounded-xl px-6 py-4 flex flex-col items-center gap-3 min-w-[280px]">
      <label className="font-bold text-pink-600 text-sm">
        Characters on screen: {sliderValue}
      </label>
      <input
        type="range"
        min={1}
        max={5}
        value={sliderValue}
        onChange={onSliderChange}
        className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
      />
      <div className="flex justify-between w-full text-xs text-pink-400">
        <span>Easy</span>
        <span>Hard</span>
      </div>
      <label className="font-bold text-pink-600 text-sm mt-1">
        Timer: {timerDuration}s
      </label>
      <input
        type="range"
        min={10}
        max={120}
        step={5}
        value={timerDuration}
        onChange={onTimerChange}
        className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
      />
      <div className="flex justify-between w-full text-xs text-pink-400">
        <span>10s</span>
        <span>120s</span>
      </div>
    </div>
  );
}

export default function WhackAPuff() {
  const { state, dispatch, stats } = useWhackAPuffGame();
  const {
    status,
    timer,
    points,
    streak,
    maxStreak,
    stunned,
    characterCount,
    timerDuration,
  } = state;

  const [showCountdown, setShowCountdown] = useState(false);
  const startingCountdownNum = 3;
  const [countdown, setCountdown] = useState(startingCountdownNum);
  const [sliderValue, setSliderValue] = useState(characterCount);
  const [timerValue, setTimerValue] = useState(timerDuration);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      dispatch({ type: "START_GAME" });
    }
  }, [showCountdown, countdown, dispatch]);

  const handleStartClick = () => {
    setCountdown(3);
    setShowCountdown(true);
  };

  const handleMiss = () => {
    dispatch({ type: "MISS" });
  };

  const handleHit = (type: CharacterType) => {
    switch (type) {
      case "jigglypuff":
        dispatch({ type: "HIT_PUFF" });
        break;
      case "clefairy":
        dispatch({ type: "HIT_CLEFAIRY" });
        break;
      case "scream-tail":
        dispatch({ type: "HIT_SCREAM_TAIL" });
        break;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
    dispatch({ type: "SET_CHARACTER_COUNT", count: value });
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTimerValue(value);
    dispatch({ type: "SET_TIMER_DURATION", duration: value });
  };

  const handleRhythmComplete = (result: RhythmResult) => {
    if (result === "success") {
      dispatch({ type: "RHYTHM_SUCCESS" });
    } else {
      dispatch({ type: "RHYTHM_FAIL" });
    }
  };

  return (
    <>
      <ExtendedHead title={"Whack a Puff!"} />
      {status === "idle" && (
        <div className="h-screen flex items-center justify-center">
          {showCountdown ? (
            <div className="text-center">
              <span className="text-7xl font-extrabold text-pink-600 drop-shadow-lg animate-pulse">
                {countdown}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <button
                type="button"
                className="focus:outline-none text-white bg-pink-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-lg px-8 py-4 shadow-lg"
                onClick={handleStartClick}
              >
                Start Game
              </button>
              <SettingsPanel
                sliderValue={sliderValue}
                timerDuration={timerValue}
                onSliderChange={handleSliderChange}
                onTimerChange={handleTimerChange}
              />
            </div>
          )}
        </div>
      )}

      {status === "finished" && (
        <div className="min-h-screen flex items-center justify-center">
          {showCountdown ? (
            <div className="text-center">
              <span className="text-7xl font-extrabold text-pink-600 drop-shadow-lg animate-pulse">
                {countdown}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl font-bold">Time&apos;s up!</h1>
              <h2 className="text-xl">Total points earned: {points}</h2>
              <h2 className="text-xl">Highest streak: {maxStreak}</h2>
              <div className="mt-2 text-pink-600">
                <div>Best Points: {stats.points}</div>
                <div>Best Streak: {stats.maxStreak}</div>
              </div>
              <button
                type="button"
                className="mt-2 focus:outline-none text-white bg-pink-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 shadow-lg"
                onClick={handleStartClick}
              >
                Play Again?
              </button>
              <SettingsPanel
                sliderValue={sliderValue}
                timerDuration={timerValue}
                onSliderChange={handleSliderChange}
                onTimerChange={handleTimerChange}
              />
              <Link
                href="/"
                className="mt-2 text-pink-600 hover:text-purple-700 font-medium text-sm underline underline-offset-2"
              >
                Go Back Home
              </Link>
            </div>
          )}
        </div>
      )}

      {status === "playing" && (
        <div
          className={`w-screen h-screen ${stunned ? "animate-screenShake" : ""}`}
          onClick={stunned ? undefined : handleMiss}
          style={{ pointerEvents: stunned ? "none" : "auto" }}
        >
          <div
            className="fixed top-4 left-4 bg-white/40 border border-pink-300 shadow-lg rounded-xl px-6 py-4 flex flex-col gap-2 min-w-[180px] transition-all"
            style={{ width: "190px", pointerEvents: "auto" }}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-pink-400">Timer:</span>
              <span className="font-mono text-lg">{timer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-pink-400">Points:</span>
              <span className="font-mono text-lg">{points}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-pink-400">Streak:</span>
              <span className="font-mono text-lg">{streak}</span>
            </div>
            {stunned && (
              <div className="text-center font-bold text-red-500 animate-pulse mt-1">
                STUNNED!
              </div>
            )}
          </div>
          <CharacterGrid
            count={characterCount}
            onHit={handleHit}
            stunned={stunned}
          />
          <MovingIgglybuff stunned={stunned} />
        </div>
      )}

      {status === "rhythm" && <RhythmGame onComplete={handleRhythmComplete} />}
    </>
  );
}
