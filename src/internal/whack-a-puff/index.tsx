// still need to account for multiple pokemon rather than limiting these two 

import React, { useState, useEffect, useReducer, useCallback } from "react";
import Jigglypuff from "@/components/Jigglypuff";
import Clefairy from "@/components/Clefairy";
import { Stats, getStats, saveStats } from "./saveStats";

const TIME_LIMIT_SECS = 30;
const CLEFAIRY_SPAWN_CHANCE = 0.2;

interface GameState {
  status: "idle" | "playing" | "finished";
  timer: number;
  points: number;
  streak: number;
  maxStreak: number;
}

type GameAction =
  | { type: "START_GAME" }
  | { type: "END_GAME" }
  | { type: "TICK" }
  | { type: "HIT_PUFF" }
  | { type: "HIT_CLEFAIRY" }
  | { type: "MISS" };

const initialState: GameState = {
  status: "idle",
  timer: TIME_LIMIT_SECS,
  points: 0,
  streak: 0,
  maxStreak: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        status: "playing",
      };
    case "END_GAME":
      return {
        ...state,
        status: "finished",
      };
    case "TICK":
      const newTime = state.timer - 1;
      return {
        ...state,
        timer: newTime,
        status: newTime > 0 ? "playing" : "finished",
      };
    case "HIT_PUFF":
      const newStreak = state.streak + 1;
      return {
        ...state,
        points: state.points + 1,
        streak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
      };
    case "HIT_CLEFAIRY":
      return {
        ...state,
        points: Math.max(0, state.points - 10), 
        // hitting clefairy breaks the streak
        streak: 0, 
      };
    case "MISS":
      return {
        ...state,
        // missing also breaks the streak
        streak: 0, 
      };
    default:
      return state;
  }
}

export const useWhackAPuffGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [stats, setStats] = useState<Stats>(getStats());

  useEffect(() => {
    if (state.status === "finished") {
      saveStats({points: state.points, maxStreak: state.maxStreak});
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

  return { state, dispatch, stats };
};

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

interface TargetProps {
  onHit: (isClefairy: boolean) => void;
}

export const ClickableCharacter: React.FC<TargetProps> = ({ onHit }) => {
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState(getRandomPos());
  const [isClefairy, setIsClefairy] = useState(
    Math.random() < CLEFAIRY_SPAWN_CHANCE
  );

  const resetTarget = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setPosition(getRandomPos());
      setIsClefairy(Math.random() < CLEFAIRY_SPAWN_CHANCE);
      setVisible(true);
    }, 100); 
  }, []);

  useEffect(() => {
    if (isClefairy && visible) {
      const timeout = setTimeout(() => {
        resetTarget();
      }, 1000); 
      return () => clearTimeout(timeout);
    }
  }, [isClefairy, visible, resetTarget]);

    // stop the click from bubbling up to the main game container,
    // which would incorrectly register a miss
  const handleClick = (e: any) => {
   e.stopPropagation(); 
    onHit(isClefairy);
    resetTarget();
  };

  const CharacterComponent = isClefairy ? Clefairy : Jigglypuff;

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        visibility: visible ? "visible" : "hidden",
        cursor: "pointer",
        transition: "opacity 0.3s", 
        opacity: visible ? 1 : 0,
      }}
    >
      <CharacterComponent />
    </div>
  );
};
