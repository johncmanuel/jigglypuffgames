import React from "react";
import {
  RhythmGame as RhythmGameBase,
  DIFFICULTY_CONFIGS,
  RhythmResult,
} from "@/internal/rhythm-game";

export type { RhythmResult } from "@/internal/rhythm-game";

interface RhythmGameProps {
  onComplete: (result: RhythmResult) => void;
}

export const RhythmGame: React.FC<RhythmGameProps> = ({ onComplete }) => {
  return (
    <RhythmGameBase
      onComplete={onComplete}
      config={DIFFICULTY_CONFIGS.medium}
      title="Wigglytuff Challenge!"
      resultMessages={{
        success: "+15 points & +10s bonus",
        fail: "Score and streak reset",
      }}
    />
  );
};
