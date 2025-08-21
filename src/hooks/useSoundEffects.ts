import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

export type SoundType = "correct" | "incorrect" | "levelUp";

export const useSoundEffects = () => {
  const synth = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    synth.current = new Tone.Synth().toDestination();
    return () => {
      synth.current?.dispose();
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!synth.current) return;

    const now = Tone.now();

    switch (type) {
      case "correct":
        synth.current.triggerAttackRelease("C5", "8n", now);
        synth.current.triggerAttackRelease("E5", "8n", now + 0.1);
        synth.current.triggerAttackRelease("G5", "8n", now + 0.2);
        break;
      case "incorrect":
        synth.current.triggerAttackRelease("C3", "8n", now);
        break;
      case "levelUp":
        synth.current.triggerAttackRelease("C4", "8n", now);
        synth.current.triggerAttackRelease("E4", "8n", now + 0.1);
        synth.current.triggerAttackRelease("G4", "8n", now + 0.2);
        synth.current.triggerAttackRelease("C5", "8n", now + 0.3);
        break;
    }
  }, []);

  return { playSound };
};
