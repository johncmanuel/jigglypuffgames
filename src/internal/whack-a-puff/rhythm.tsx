import React, { useState, useEffect, useRef, useCallback } from "react";
import Wigglytuff from "@/components/Wigglytuff";

const LANE_COUNT = 4;
const LANE_LABELS = ["D", "F", "J", "K"];
const LANE_COLORS = ["#ec4899", "#a855f7", "#6366f1", "#3b82f6"];

const RHYTHM_DURATION_MS = 20000;
const FALL_DURATION_MS = 2500;
const BPM = 150;
const BEAT_MS = 60000 / BPM;
const MAX_MISSES = 3;
const COUNTDOWN_SECS = 3;

const PERFECT_WINDOW = 60;
const GREAT_WINDOW = 120;
const GOOD_WINDOW = 180;

interface Note {
  id: number;
  lane: number;
  targetTime: number;
  hit: boolean;
  missed: boolean;
}

function generateNotes(): Note[] {
  const notes: Note[] = [];
  let id = 0;
  const startTime = COUNTDOWN_SECS * 1000;
  const endTime = startTime + RHYTHM_DURATION_MS;

  // Build a pattern of notes across the rhythm duration
  // Start slow, build up, then fast section near the end
  let time = startTime;
  while (time < endTime) {
    const progress = (time - startTime) / RHYTHM_DURATION_MS;

    // Variable beat density based on progress
    // Early: every 2 beats, Mid: every beat, Late: every beat with doubles, Final: faster
    let interval: number;
    if (progress < 0.25) {
      interval = BEAT_MS * 2;
    } else if (progress < 0.5) {
      interval = BEAT_MS;
    } else if (progress < 0.75) {
      interval = BEAT_MS;
    } else {
      interval = BEAT_MS * 0.75;
    }

    // avoid repeating the same lane too often
    const lastNote = notes[notes.length - 1];

    let lane: number;
    do {
      lane = Math.floor(Math.random() * LANE_COUNT);
    } while (lastNote && lane === lastNote.lane && Math.random() < 0.5);

    notes.push({ id: id++, lane, targetTime: time, hit: false, missed: false });

    if (progress > 0.5 && Math.random() < 0.2) {
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

interface HitFeedback {
  id: number;
  lane: number;
  rating: HitRating;
}

let feedbackId = 0;

interface UseRhythmGameOptions {
  onComplete: (result: RhythmResult) => void;
}

export function useRhythmGame({ onComplete }: UseRhythmGameOptions) {
  const [phase, setPhase] = useState<
    "intro" | "countdown" | "playing" | "result" | "fading"
  >("intro");
  const [result, setResult] = useState<RhythmResult | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const [misses, setMisses] = useState(0);
  const [hits, setHits] = useState(0);
  const [notes, setNotes] = useState<Note[]>(() => generateNotes());
  const [elapsed, setElapsed] = useState(0);
  const [hitFlash, setHitFlash] = useState<number | null>(null);
  const [hitFeedback, setHitFeedback] = useState<HitFeedback[]>([]);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const missesRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

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

  // Game loop
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
        return updated;
      });

      if (missesRef.current >= MAX_MISSES) {
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
  }, [phase]);

  // Handle lane tap
  const handleLane = useCallback(
    (lane: number) => {
      if (phase !== "playing") return;

      const now = performance.now();
      const elapsedMs = now - startTimeRef.current;

      setNotes((prev) => {
        let bestNote: Note | null = null;
        let bestDiff = Infinity;

        for (const note of prev) {
          if (note.lane !== lane || note.hit || note.missed) continue;
          const diff = Math.abs(elapsedMs - note.targetTime);
          if (diff < bestDiff && diff <= GOOD_WINDOW) {
            bestDiff = diff;
            bestNote = note;
          }
        }

        if (!bestNote) return prev;

        let rating: HitRating;
        if (bestDiff <= PERFECT_WINDOW) rating = "perfect";
        else if (bestDiff <= GREAT_WINDOW) rating = "great";
        else rating = "good";

        setHits((h) => h + 1);
        setHitFlash(lane);
        setTimeout(() => setHitFlash(null), 150);

        const fbId = feedbackId++;
        setHitFeedback((prev) => [...prev, { id: fbId, lane, rating }]);
        setTimeout(() => {
          setHitFeedback((prev) => prev.filter((f) => f.id !== fbId));
        }, 800);

        return prev.map((n) =>
          n.id === bestNote!.id ? { ...n, hit: true } : n
        );
      });
    },
    [phase]
  );

  // Keyboard support (D, F, J, K)
  useEffect(() => {
    if (phase !== "playing") return;

    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = { d: 0, f: 1, j: 2, k: 3 };
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
}

const LANE_WIDTH_PERCENT = 100 / LANE_COUNT;

export const RhythmGame: React.FC<RhythmGameProps> = ({ onComplete }) => {
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
  } = useRhythmGame({ onComplete });

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
          Wigglytuff Challenge!
        </span>
        {/* Miss counter */}
        <div className="flex gap-1 mt-1">
          {Array.from({ length: MAX_MISSES }).map((_, i) => (
            <span
              key={i}
              className={`text-2xl ${i < misses ? "opacity-30" : ""}`}
            >
              {i < misses ? "\u2605" : "\u2605"}
            </span>
          ))}
        </div>
      </div>

      {/* Intro overlay */}
      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/30 animate-fadeIn">
          <p className="text-white/80 text-lg animate-fadeIn">Get ready...</p>
        </div>
      )}

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 animate-fadeIn">
          <span className="text-8xl font-extrabold text-white animate-pulse drop-shadow-lg">
            {countdown}
          </span>
        </div>
      )}

      {/* Result overlay */}
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
            {result === "success" && (
              <p className="text-white/70 text-lg mt-3">
                +15 points &amp; +10s bonus
              </p>
            )}
            {result === "fail" && (
              <p className="text-white/70 text-lg mt-3">
                Score and streak reset
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lane area */}
      <div className="flex-1 relative flex">
        {/* Lane dividers and notes */}
        {Array.from({ length: LANE_COUNT }).map((_, laneIdx) => (
          <div
            key={laneIdx}
            className="relative border-l border-white/10 first:border-l-0"
            style={{ width: `${LANE_WIDTH_PERCENT}%` }}
          >
            {/* Notes in this lane */}
            {notes
              .filter((n) => n.lane === laneIdx && !n.hit)
              .map((note) => {
                const noteProgress =
                  (elapsed - (note.targetTime - FALL_DURATION_MS)) /
                  FALL_DURATION_MS;
                const topPercent = noteProgress * 80; // 80% of lane height before hit zone

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

        {/* Hit zone line */}
        <div
          className="absolute left-0 right-0 h-1 bg-white/60 z-10"
          style={{ top: "80%" }}
        >
          <div className="absolute inset-0 animate-rhythmGlow bg-white/40" />
        </div>

        {/* Hit feedback text */}
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

      {/* Touch buttons */}
      <div className="flex z-10 pb-[env(safe-area-inset-bottom)]">
        {Array.from({ length: LANE_COUNT }).map((_, laneIdx) => (
          <button
            key={laneIdx}
            onTouchStart={(e) => {
              e.preventDefault();
              handleLane(laneIdx);
            }}
            onClick={() => handleLane(laneIdx)}
            className="flex-1 h-28 flex items-center justify-center text-white text-xl font-bold transition-transform active:scale-95 border-l border-white/10 first:border-l-0"
            style={{
              backgroundColor:
                hitFlash === laneIdx
                  ? LANE_COLORS[laneIdx]
                  : `${LANE_COLORS[laneIdx]}88`,
              touchAction: "manipulation",
              userSelect: "none",
            }}
          >
            {LANE_LABELS[laneIdx]}
          </button>
        ))}
      </div>
    </div>
  );
};
