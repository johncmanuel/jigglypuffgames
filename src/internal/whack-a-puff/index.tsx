import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from "react";
import Jigglypuff from "@/components/Jigglypuff";
import Clefairy from "@/components/Clefairy";
import Igglybuff from "@/components/Igglybuff";
import ScreamTail from "@/components/ScreamTail";
import { Stats, getStats, saveStats } from "./saveStats";

const TIME_LIMIT_SECS = 30;

export type CharacterType = "jigglypuff" | "clefairy" | "scream-tail";

interface CharacterSpawn {
  type: CharacterType;
  weight: number;
}

const CHARACTER_SPAWNS: CharacterSpawn[] = [
  { type: "jigglypuff", weight: 0.6 },
  { type: "clefairy", weight: 0.2 },
  { type: "scream-tail", weight: 0.2 },
];

const STUN_DURATION_MS = 2000;
const CLEFAIRY_DESPAWN_MS = 1000;
const SCREAM_TAIL_DESPAWN_MS = 1500;
const HIDE_DURATION_MS = 100;

function pickRandomCharacter(): CharacterType {
  const roll = Math.random();
  let cumulative = 0;
  for (const spawn of CHARACTER_SPAWNS) {
    cumulative += spawn.weight;
    if (roll < cumulative) {
      return spawn.type;
    }
  }
  return "jigglypuff";
}

export interface GameState {
  status: "idle" | "playing" | "rhythm" | "finished";
  timer: number;
  timerDuration: number;
  points: number;
  streak: number;
  maxStreak: number;
  stunned: boolean;
  characterCount: number;
  wigglytuffSpawned: boolean;
  wigglytuffDone: boolean;
  wigglytuffThreshold: number;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "END_GAME" }
  | { type: "TICK" }
  | { type: "HIT_PUFF" }
  | { type: "HIT_CLEFAIRY" }
  | { type: "HIT_SCREAM_TAIL" }
  | { type: "STUN_END" }
  | { type: "MISS" }
  | { type: "SET_CHARACTER_COUNT"; count: number }
  | { type: "SET_TIMER_DURATION"; duration: number }
  | { type: "START_RHYTHM" }
  | { type: "RHYTHM_SUCCESS" }
  | { type: "RHYTHM_FAIL" }
  | { type: "WIGGLYTUFF_SKIP" };

const initialState: GameState = {
  status: "idle",
  timer: TIME_LIMIT_SECS,
  timerDuration: TIME_LIMIT_SECS,
  points: 0,
  streak: 0,
  maxStreak: 0,
  stunned: false,
  characterCount: 1,
  wigglytuffSpawned: false,
  wigglytuffDone: false,
  wigglytuffThreshold: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_GAME": {
      const min = Math.floor(state.timerDuration * 0.5);
      const max = Math.floor(state.timerDuration * 0.83);
      const threshold = Math.floor(Math.random() * (max - min + 1)) + min;
      return {
        ...initialState,
        status: "playing",
        timer: state.timerDuration,
        timerDuration: state.timerDuration,
        characterCount: state.characterCount,
        wigglytuffThreshold: threshold,
      };
    }
    case "END_GAME":
      return {
        ...state,
        status: "finished",
      };
    case "TICK":
      if (state.stunned) return state;
      if (state.status !== "playing") return state;
      const newTime = state.timer - 1;
      return {
        ...state,
        timer: newTime,
        status: newTime > 0 ? "playing" : "finished",
      };
    case "HIT_PUFF":
      if (state.stunned) return state;
      const newStreak = state.streak + 1;
      return {
        ...state,
        points: state.points + 1,
        streak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
      };
    case "HIT_CLEFAIRY":
      if (state.stunned) return state;
      return {
        ...state,
        points: Math.max(0, state.points - 10),
        streak: 0,
      };
    case "HIT_SCREAM_TAIL":
      if (state.stunned) return state;
      return {
        ...state,
        streak: 0,
        stunned: true,
      };
    case "STUN_END":
      return {
        ...state,
        stunned: false,
      };
    case "MISS":
      if (state.stunned) return state;
      return {
        ...state,
        streak: 0,
      };
    case "SET_CHARACTER_COUNT":
      return {
        ...state,
        characterCount: action.count,
      };
    case "SET_TIMER_DURATION":
      return {
        ...state,
        timerDuration: action.duration,
      };
    case "START_RHYTHM":
      return {
        ...state,
        status: "rhythm",
        wigglytuffSpawned: true,
      };
    case "RHYTHM_SUCCESS":
      return {
        ...state,
        status: "playing",
        wigglytuffDone: true,
        points: state.points + 15,
        timer: state.timer + 10,
      };
    case "RHYTHM_FAIL":
      return {
        ...state,
        status: "playing",
        wigglytuffDone: true,
        points: 0,
        streak: 0,
      };
    case "WIGGLYTUFF_SKIP":
      return {
        ...state,
        wigglytuffDone: true,
      };
    default:
      return state;
  }
};

export const useWhackAPuffGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [stats, setStats] = useState<Stats>(getStats());

  useEffect(() => {
    if (state.status === "finished") {
      saveStats({ points: state.points, maxStreak: state.maxStreak });
      setStats(getStats());
    }
  }, [state.status, state.points, state.maxStreak]);

  useEffect(() => {
    if (state.status !== "playing") {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status]);

  useEffect(() => {
    if (
      state.status === "playing" &&
      !state.wigglytuffSpawned &&
      !state.wigglytuffDone &&
      state.wigglytuffThreshold > 0 &&
      state.timer <= state.wigglytuffThreshold
    ) {
      if (Math.random() < 0.5) {
        dispatch({ type: "START_RHYTHM" });
      } else {
        dispatch({ type: "WIGGLYTUFF_SKIP" });
      }
    }
  }, [
    state.status,
    state.timer,
    state.wigglytuffSpawned,
    state.wigglytuffDone,
    state.wigglytuffThreshold,
  ]);

  useEffect(() => {
    if (!state.stunned) return;
    const timeout = setTimeout(() => {
      dispatch({ type: "STUN_END" });
    }, STUN_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [state.stunned]);

  return { state, dispatch, stats };
};

const getRandomPos = (imgWidth?: number, imgHeight?: number) => {
  const maxTop = imgHeight
    ? window.innerHeight - imgHeight
    : window.innerHeight;
  const maxLeft = imgWidth ? window.innerWidth - imgWidth : window.innerWidth;

  const top = Math.floor(Math.random() * (maxTop / 2));
  const left = Math.floor(Math.random() * (maxLeft / 2));
  return { top, left };
};

const CHARACTER_COMPONENTS: Record<
  CharacterType,
  React.FC<{ width?: number; height?: number }>
> = {
  jigglypuff: Jigglypuff,
  clefairy: Clefairy,
  "scream-tail": ScreamTail,
};

interface ClickableCharacterProps {
  onHit: (type: CharacterType) => void;
  stunned: boolean;
}

export const ClickableCharacter: React.FC<ClickableCharacterProps> = ({
  onHit,
  stunned,
}) => {
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState(getRandomPos());
  const [charType, setCharType] = useState<CharacterType>(
    pickRandomCharacter()
  );

  const resetTarget = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setPosition(getRandomPos());
      setCharType(pickRandomCharacter());
      setVisible(true);
    }, HIDE_DURATION_MS);
  }, []);

  useEffect(() => {
    if (!visible) return;

    let despawnMs: number | null = null;

    if (charType === "clefairy") {
      despawnMs = CLEFAIRY_DESPAWN_MS;
    } else if (charType === "scream-tail") {
      despawnMs = SCREAM_TAIL_DESPAWN_MS;
    }

    if (despawnMs !== null) {
      const timeout = setTimeout(() => {
        resetTarget();
      }, despawnMs);
      return () => clearTimeout(timeout);
    }
  }, [charType, visible, resetTarget]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stunned) return;
    onHit(charType);
    resetTarget();
  };

  const CharacterComponent = CHARACTER_COMPONENTS[charType];

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        visibility: visible ? "visible" : "hidden",
        cursor: stunned ? "not-allowed" : "pointer",
        transition: "opacity 0.3s",
        opacity: visible ? 1 : 0,
      }}
    >
      <CharacterComponent />
    </div>
  );
};

interface CharacterGridProps {
  count: number;
  onHit: (type: CharacterType) => void;
  stunned: boolean;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  count,
  onHit,
  stunned,
}) => {
  const [keys, setKeys] = useState<number[]>(() =>
    Array.from({ length: count }, (_, i) => i)
  );

  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count !== prevCountRef.current) {
      prevCountRef.current = count;
      setKeys(Array.from({ length: count }, (_, i) => Date.now() + i));
    }
  }, [count]);

  return (
    <>
      {keys.map((key) => (
        <ClickableCharacter key={key} onHit={onHit} stunned={stunned} />
      ))}
    </>
  );
};

const IGGLYBUFF_SPAWN_INTERVAL_MS = 4000;

interface MovingIgglybuffProps {
  stunned: boolean;
}

export const MovingIgglybuff: React.FC<MovingIgglybuffProps> = ({
  stunned,
}) => {
  const [active, setActive] = useState(false);
  const [top, setTop] = useState(0);
  const [goesRight, setGoesRight] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const spawn = useCallback(() => {
    const maxTop = window.innerHeight - 250;
    setTop(Math.floor(Math.random() * Math.max(maxTop, 1)));
    setGoesRight(Math.random() < 0.5);
    setAnimKey((k) => k + 1);
    setActive(true);
  }, []);

  useEffect(() => {
    if (active) return;
    const timeout = setTimeout(spawn, IGGLYBUFF_SPAWN_INTERVAL_MS);
    return () => clearTimeout(timeout);
  }, [active, spawn]);

  const handleDone = useCallback(() => {
    setActive(false);
  }, []);

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!active) return null;

  return (
    <div
      key={animKey}
      onClick={handleBlock}
      onAnimationEnd={handleDone}
      className={
        goesRight ? "animate-moveLeftToRight" : "animate-moveRightToLeft"
      }
      style={{
        position: "absolute",
        top: `${top}px`,
        left: 0,
        cursor: stunned ? "not-allowed" : "default",
        zIndex: 5,
      }}
    >
      <Igglybuff />
    </div>
  );
};

export { RhythmGame } from "./rhythm";
export type { RhythmResult } from "./rhythm";
