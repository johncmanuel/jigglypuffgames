import React, { useState, useEffect, useRef, useCallback } from "react";
import Wigglytuff from "@/components/Wigglytuff";

const LANE_COUNT = 4;
const LANE_LABELS = ["←", "↓", "↑", "→"];
const LANE_KEY_HINTS = ["A", "S", "W", "D"];
const LANE_COLORS = ["#ec4899", "#a855f7", "#6366f1", "#3b82f6"];

const RHYTHM_DURATION_MS = 20000;
const FALL_DURATION_MS = 2500;
const COUNTDOWN_SECS = 3;

const PERFECT_WINDOW = 60;
const GREAT_WINDOW = 120;
const GOOD_WINDOW = 180;

export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyConfig {
  bpm: number;
  maxMisses: number;
  doubleChance: number;
  finalSpeedMultiplier: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    bpm: 100,
    maxMisses: 5,
    doubleChance: 0,
    finalSpeedMultiplier: 1,
  },
  medium: {
    bpm: 150,
    maxMisses: 3,
    doubleChance: 0.1,
    finalSpeedMultiplier: 0.75,
  },
  hard: {
    bpm: 200,
    maxMisses: 3,
    doubleChance: 0.25,
    finalSpeedMultiplier: 0.5,
  },
};

export interface Note {
  id: number;
  lane: number;
  targetTime: number;
  hit: boolean;
  missed: boolean;
}

function generateNotes(config: DifficultyConfig): Note[] {
  const notes: Note[] = [];
  let id = 0;
  const beatMs = 60000 / config.bpm;
  const startTime = COUNTDOWN_SECS * 1000;
  const endTime = startTime + RHYTHM_DURATION_MS;

  let time = startTime;
  while (time < endTime) {
    const progress = (time - startTime) / RHYTHM_DURATION_MS;

    let interval: number;
    if (progress < 0.25) {
      interval = beatMs * 2;
    } else if (progress < 0.5) {
      interval = beatMs;
    } else if (progress < 0.75) {
      interval = beatMs;
    } else {
      interval = beatMs * config.finalSpeedMultiplier;
    }

    const lastNote = notes[notes.length - 1];

    let lane: number;
    do {
      lane = Math.floor(Math.random() * LANE_COUNT);
    } while (lastNote && lane === lastNote.lane && Math.random() < 0.5);

    notes.push({ id: id++, lane, targetTime: time, hit: false, missed: false });

    if (progress > 0.5 && Math.random() < config.doubleChance) {
      let lane2: number;
      do {
        lane2 = Math.floor(Math.random() * LANE_COUNT);
      } while (lane2 === lane);
      notes.push({
        id: id++,
        lane: lane2,
        targetTime: time,
        hit: false,
        missed: false,
      });
    }

    time += interval;
  }

  return notes;
}

export type RhythmResult = "success" | "fail";
export type HitRating = "perfect" | "great" | "good";

export interface HitFeedback {
  id: number;
  lane: number;
  rating: HitRating;
}

let feedbackId = 0;

interface UseRhythmGameOptions {
  onComplete: (result: RhythmResult) => void;
  config: DifficultyConfig;
  skipIntro?: boolean;
}

export function useRhythmGame({
  onComplete,
  config,
  skipIntro,
}: UseRhythmGameOptions) {
  const [phase, setPhase] = useState<
    "intro" | "countdown" | "playing" | "result" | "fading"
  >(skipIntro ? "countdown" : "intro");
  const [result, setResult] = useState<RhythmResult | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const [misses, setMisses] = useState(0);
  const [hits, setHits] = useState(0);
  const [notes, setNotes] = useState<Note[]>(() => generateNotes(config));
  const [elapsed, setElapsed] = useState(0);
  const [hitFlash, setHitFlash] = useState<number | null>(null);
  const [hitFeedback, setHitFeedback] = useState<HitFeedback[]>([]);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const missesRef = useRef(0);
  const notesRef = useRef<Note[]>(notes);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("countdown"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("playing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "result") return;
    const t = setTimeout(() => setPhase("fading"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading" || !result) return;
    const t = setTimeout(() => onCompleteRef.current(result), 600);
    return () => clearTimeout(t);
  }, [phase, result]);

  useEffect(() => {
    if (phase !== "playing") return;

    startTimeRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const elapsedMs = now - startTimeRef.current;
      setElapsed(elapsedMs);

      setNotes((prev) => {
        let newMisses = 0;
        const updated = prev.map((note) => {
          if (
            !note.hit &&
            !note.missed &&
            elapsedMs > note.targetTime + GOOD_WINDOW
          ) {
            newMisses++;
            return { ...note, missed: true };
          }
          return note;
        });
        if (newMisses > 0) {
          missesRef.current += newMisses;
          setMisses(missesRef.current);
        }
        notesRef.current = updated;
        return updated;
      });

      if (missesRef.current >= config.maxMisses) {
        setPhase("result");
        setResult("fail");
        return;
      }

      if (elapsedMs >= RHYTHM_DURATION_MS + GOOD_WINDOW) {
        setPhase("result");
        setResult("success");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, config.maxMisses]);

  const handleLane = useCallback(
    (lane: number) => {
      if (phase !== "playing") return;

      const now = performance.now();
      const elapsedMs = now - startTimeRef.current;

      let bestNote: Note | null = null;
      let bestDiff = Infinity;

      for (const note of notesRef.current) {
        if (note.lane !== lane || note.hit || note.missed) continue;
        const diff = Math.abs(elapsedMs - note.targetTime);
        if (diff < bestDiff && diff <= GOOD_WINDOW) {
          bestDiff = diff;
          bestNote = note;
        }
      }

      if (!bestNote) return;

      let rating: HitRating;
      if (bestDiff <= PERFECT_WINDOW) rating = "perfect";
      else if (bestDiff <= GREAT_WINDOW) rating = "great";
      else rating = "good";

      notesRef.current = notesRef.current.map((n) =>
        n.id === bestNote!.id ? { ...n, hit: true } : n
      );

      setNotes(notesRef.current);
      setHits((h) => h + 1);
      setHitFlash(lane);
      setTimeout(() => setHitFlash(null), 150);

      const fbId = feedbackId++;
      setHitFeedback((prev) => [...prev, { id: fbId, lane, rating }]);
      setTimeout(() => {
        setHitFeedback((prev) => prev.filter((f) => f.id !== fbId));
      }, 800);
    },
    [phase]
  );

  useEffect(() => {
    if (phase !== "playing") return;

    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        arrowleft: 0,
        a: 0,
        arrowdown: 1,
        s: 1,
        arrowup: 2,
        w: 2,
        arrowright: 3,
        d: 3,
      };
      const lane = keyMap[e.key.toLowerCase()];
      if (lane !== undefined) {
        e.preventDefault();
        handleLane(lane);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleLane]);

  return {
    phase,
    result,
    countdown,
    misses,
    hits,
    notes,
    elapsed,
    hitFlash,
    hitFeedback,
    handleLane,
  };
}

interface RhythmGameProps {
  onComplete: (result: RhythmResult) => void;
  config: DifficultyConfig;
  title?: string;
  resultMessages?: {
    success: string;
    fail: string;
  };
  skipIntro?: boolean;
}

const LANE_WIDTH_PERCENT = 100 / LANE_COUNT;

export const RhythmGame: React.FC<RhythmGameProps> = ({
  onComplete,
  config,
  title = "Wigglytuff Challenge!",
  resultMessages,
  skipIntro,
}) => {
  const {
    phase,
    result,
    countdown,
    misses,
    notes,
    elapsed,
    hitFlash,
    hitFeedback,
    handleLane,
  } = useRhythmGame({ onComplete, config, skipIntro });

  return (
    <div
      className={`w-screen h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 flex flex-col overflow-hidden select-none transition-opacity duration-500 ${
        phase === "fading" ? "opacity-0" : "opacity-100 animate-fadeIn"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-2 pb-1 z-10">
        <div
          className={`transition-all duration-500 ${
            phase === "intro" ? "animate-scaleIn" : ""
          }`}
          style={{ width: 120, height: 120 }}
        >
          <Wigglytuff width={120} height={120} />
        </div>
        <span
          className={`text-white font-bold text-lg mt-1 transition-opacity duration-500 ${
            phase === "intro" ? "animate-fadeIn" : ""
          }`}
        >
          {title}
        </span>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: config.maxMisses }).map((_, i) => (
            <span
              key={i}
              className={`text-2xl ${i < misses ? "opacity-30" : ""}`}
            >
              {i < misses ? "\u2605" : "\u2605"}
            </span>
          ))}
        </div>
      </div>

      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/30 animate-fadeIn">
          <p className="text-white/80 text-lg animate-fadeIn">Get ready...</p>
        </div>
      )}

      {phase === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 animate-fadeIn">
          <span className="text-8xl font-extrabold text-white animate-pulse drop-shadow-lg">
            {countdown}
          </span>
        </div>
      )}

      {phase === "result" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/50 animate-fadeIn">
          <div className="animate-scaleIn flex flex-col items-center">
            <span className="text-7xl mb-4">
              {result === "success" ? "\u2705" : "\u274C"}
            </span>
            <span
              className={`text-5xl font-extrabold drop-shadow-lg ${
                result === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {result === "success" ? "You Passed!" : "You Failed!"}
            </span>
            {resultMessages && (
              <p className="text-white/70 text-lg mt-3">
                {result === "success"
                  ? resultMessages.success
                  : resultMessages.fail}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lane area */}
      <div className="flex-1 relative flex">
        {Array.from({ length: LANE_COUNT }).map((_, laneIdx) => (
          <div
            key={laneIdx}
            className="relative border-l border-white/10 first:border-l-0"
            style={{ width: `${LANE_WIDTH_PERCENT}%` }}
          >
            {notes
              .filter((n) => n.lane === laneIdx && !n.hit)
              .map((note) => {
                const noteProgress =
                  (elapsed - (note.targetTime - FALL_DURATION_MS)) /
                  FALL_DURATION_MS;
                const topPercent = noteProgress * 80;

                if (topPercent < -10 || topPercent > 95) return null;

                return (
                  <div
                    key={note.id}
                    className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full shadow-lg"
                    style={{
                      top: `${topPercent}%`,
                      backgroundColor: LANE_COLORS[laneIdx],
                      opacity: note.missed ? 0.2 : 0.9,
                      boxShadow: note.missed
                        ? "none"
                        : `0 0 12px ${LANE_COLORS[laneIdx]}`,
                    }}
                  />
                );
              })}
          </div>
        ))}

        <div
          className="absolute left-0 right-0 h-1 bg-white/60 z-10"
          style={{ top: "80%" }}
        >
          <div className="absolute inset-0 animate-rhythmGlow bg-white/40" />
        </div>

        {hitFeedback.map((fb) => (
          <div
            key={fb.id}
            className="absolute z-20 animate-hitFloat pointer-events-none"
            style={{
              left: `${(fb.lane + 0.5) * LANE_WIDTH_PERCENT}%`,
              top: "76%",
              transform: "translateX(-50%)",
            }}
          >
            <span
              className="text-lg font-extrabold whitespace-nowrap drop-shadow-lg"
              style={{
                color:
                  fb.rating === "perfect"
                    ? "#fbbf24"
                    : fb.rating === "great"
                      ? "#a78bfa"
                      : "#6ee7b7",
              }}
            >
              {fb.rating === "perfect"
                ? "Perfect!"
                : fb.rating === "great"
                  ? "Great!"
                  : "Good!"}
            </span>
          </div>
        ))}
      </div>

      {/* Touch/click buttons */}
      <div className="flex z-10 pb-[env(safe-area-inset-bottom)]">
        {Array.from({ length: LANE_COUNT }).map((_, laneIdx) => (
          <button
            key={laneIdx}
            onPointerDown={(e) => {
              e.preventDefault();
              handleLane(laneIdx);
            }}
            className="flex-1 h-28 flex flex-col items-center justify-center text-white border-l border-white/10 first:border-l-0"
            style={{
              backgroundColor:
                hitFlash === laneIdx
                  ? LANE_COLORS[laneIdx]
                  : `${LANE_COLORS[laneIdx]}88`,
              touchAction: "none",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="text-2xl font-bold">{LANE_LABELS[laneIdx]}</span>
            <span className="text-xs opacity-60 mt-1">
              {LANE_KEY_HINTS[laneIdx]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
