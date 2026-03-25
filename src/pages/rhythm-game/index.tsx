import ExtendedHead from "@/components/ExtendedHead";
import Wigglytuff from "@/components/Wigglytuff";
import {
  RhythmGame,
  Difficulty,
  DifficultyConfig,
  DIFFICULTY_CONFIGS,
  RhythmResult,
} from "@/internal/rhythm-game";
import { useState } from "react";
import Link from "next/link";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: "Slower pace, more forgiving",
  medium: "Standard speed and challenge",
  hard: "Fast and intense",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-500 hover:bg-green-600 focus:ring-green-300",
  medium: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300",
  hard: "bg-red-500 hover:bg-red-600 focus:ring-red-300",
};

export default function RhythmGamePage() {
  const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [lastResult, setLastResult] = useState<RhythmResult | null>(null);

  const handleDifficultyClick = (diff: Difficulty) => {
    setDifficulty(diff);
    setLastResult(null);
    setStatus("playing");
  };

  const handleComplete = (result: RhythmResult) => {
    setLastResult(result);
    setStatus("finished");
  };

  const config = difficulty
    ? DIFFICULTY_CONFIGS[difficulty]
    : DIFFICULTY_CONFIGS.medium;

  return (
    <>
      <ExtendedHead title={"Rhythm Challenge"} />
      {status === "idle" && (
        <div className="h-screen flex items-center justify-center bg-pink-100">
          <div className="flex flex-col items-center gap-6 max-w-md px-4">
            <Wigglytuff width={160} height={160} />
            <h1 className="text-3xl font-extrabold text-pink-700">
              Rhythm Challenge
            </h1>
            <p className="text-pink-600 text-center">
              Tap the buttons in time with the falling notes!
            </p>
            <p className="text-pink-400 text-sm text-center">
              Keyboard: Arrow keys or W-A-S-D
            </p>

            <div className="flex flex-col gap-3 w-full">
              {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyClick(diff)}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-lg transition-all focus:ring-4 ${DIFFICULTY_COLORS[diff]}`}
                >
                  <div className="text-lg">{DIFFICULTY_LABELS[diff]}</div>
                  <div className="text-xs font-normal opacity-80">
                    {DIFFICULTY_DESCRIPTIONS[diff]}
                  </div>
                </button>
              ))}
            </div>

            <Link
              href="/"
              className="mt-2 text-pink-600 hover:text-purple-700 font-medium text-sm underline underline-offset-2"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      )}

      {status === "playing" && (
        <RhythmGame
          onComplete={handleComplete}
          config={config}
          title="Rhythm Challenge"
          skipIntro
        />
      )}

      {status === "finished" && (
        <div className="min-h-screen flex items-center justify-center bg-pink-100">
          <div className="flex flex-col items-center gap-4 max-w-md px-4">
            <Wigglytuff width={160} height={160} />
            <h1 className="text-3xl font-extrabold text-pink-700">
              {lastResult === "success" ? "You Passed!" : "You Failed!"}
            </h1>
            {difficulty && (
              <p className="text-pink-600 text-lg">
                Difficulty: {DIFFICULTY_LABELS[difficulty]}
              </p>
            )}
            <div className="flex flex-col gap-3 w-full mt-2">
              {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyClick(diff)}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-lg transition-all focus:ring-4 ${DIFFICULTY_COLORS[diff]}`}
                >
                  <div className="text-lg">{DIFFICULTY_LABELS[diff]}</div>
                  <div className="text-xs font-normal opacity-80">
                    {DIFFICULTY_DESCRIPTIONS[diff]}
                  </div>
                </button>
              ))}
            </div>
            <Link
              href="/"
              className="mt-2 text-pink-600 hover:text-purple-700 font-medium text-sm underline underline-offset-2"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
