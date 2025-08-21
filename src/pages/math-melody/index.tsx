import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getEeveeSprite,
  getIgglybuffSprite,
  getPikachuSprite,
  getWigglytuffSprite,
  getJigglyPuffSprite,
  getScreamTailSprite,
} from "@/internal/pokeapi/pokemon";
import SettingsIcon from "@/components/SettingsIcon";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type JigglypuffStatus = "happy" | "sad" | "neutral";

const UNLOCKABLE_POKEMON = [
  { name: "eevee", displayName: "Eevee", level: 2, sprite: getEeveeSprite },
  {
    name: "igglybuff",
    displayName: "Igglybuff",
    level: 4,
    sprite: getIgglybuffSprite,
  },
  {
    name: "pikachu",
    displayName: "Pikachu",
    level: 6,
    sprite: getPikachuSprite,
  },
  {
    name: "wigglytuff",
    displayName: "Wigglytuff",
    level: 9,
    sprite: getWigglytuffSprite,
  },
  {
    name: "scream-tail",
    displayName: "Scream Tail",
    level: 13,
    sprite: getScreamTailSprite,
  },
];

// too lazy to refactor, so use this for lookups needed in some of the code
const POKEMON_DICT = Object.fromEntries(
  UNLOCKABLE_POKEMON.map((pokemon) => [pokemon.name, pokemon])
);

interface DebugWindowProps {
  gameState: { [key: string]: number };
  onStateChange: (key: string, value: number) => void;
  onClose: () => void;
}

const DebugWindow = ({
  gameState,
  onStateChange,
  onClose,
}: DebugWindowProps) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e: any) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // im sorry for using "any" types
  const handleInputChange = (e: any, key: any) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onStateChange(key, value);
    }
  };

  return (
    <div
      ref={windowRef}
      className="fixed bg-gray-800 text-white rounded-lg shadow-2xl z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div
        className="bg-gray-900 p-2 rounded-t-lg cursor-move flex justify-between items-center"
        onMouseDown={handleMouseDown}
      >
        <h4 className="font-bold text-sm">Debug Panel</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg"
        >
          &times;
        </button>
      </div>
      <div className="p-4 space-y-2">
        {Object.keys(gameState).map((key) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <label htmlFor={key} className="capitalize mr-4">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="number"
              id={key}
              value={gameState[key]}
              onChange={(e) => handleInputChange(e, key)}
              className="bg-gray-700 rounded p-1 w-20 text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfirmationModal = ({
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  confirmColor,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 my-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`w-full text-white font-bold py-2 px-4 rounded-lg transition ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StickerProps {
  pokemonName: string;
}

const Sticker = (props: StickerProps) => {
  const [sprite, setSprite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pokemon = POKEMON_DICT[props.pokemonName];

  useEffect(() => {
    if (!pokemon) {
      console.error(`Unknown Pokémon: ${props.pokemonName}`);
      setSprite(null);
      setIsLoading(false);
      return;
    }

    const fetchSprite = async () => {
      setIsLoading(true);
      try {
        const officialArt = pokemon.sprite();
        setSprite(officialArt);
      } catch (error) {
        console.error(`Failed to fetch ${pokemon.name}`, error);
        setSprite(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSprite();
  }, [props.pokemonName]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-200 p-2 rounded-lg aspect-square">
      {isLoading ? (
        <div className="h-16 w-16 bg-gray-300 rounded-full animate-pulse"></div>
      ) : sprite ? (
        <img
          src={sprite}
          alt={props.pokemonName}
          className="h-16 w-16 object-contain"
        />
      ) : (
        <div className="h-16 w-16 flex items-center justify-center bg-gray-300 rounded-full text-gray-500 font-bold text-2xl">
          ?
        </div>
      )}
      <p className="text-sm font-semibold capitalize text-gray-700 mt-1">
        {pokemon ? pokemon.displayName : "Unknown Pokémon"}
      </p>
    </div>
  );
};

interface StickerBookModalProps {
  unlockedPokemon: string[];
  onClose: () => void;
}

const StickerBookModal = ({
  unlockedPokemon,
  onClose,
}: StickerBookModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold text-center text-pink-600 mb-4">
          Pokémon Collection
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2 bg-gray-100 rounded-lg">
          {unlockedPokemon.map((name) => (
            <Sticker key={name} pokemonName={name} />
          ))}
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-200 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-bold text-xl hover:bg-gray-300"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

interface NoteProps {
  id: number;
  onAnimationEnd: (id: number) => void;
}

const Note = ({ id, onAnimationEnd }: NoteProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onAnimationEnd(id), 1000);
    return () => clearTimeout(timer);
  }, [id, onAnimationEnd]);

  return (
    <div
      className="absolute text-4xl animate-floatUp"
      style={{
        left: `${Math.random() * 80 - 40}%`,
        animationDelay: `${Math.random() * 0.3}s`,
      }}
    >
      &#9835;
    </div>
  );
};

export default function MathMelody() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [correctAnswersInRow, setCorrectAnswersInRow] = useState(0);
  const [problem, setProblem] = useState({ text: "", answer: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState({
    message: "",
    color: "text-gray-500",
  });
  const [jigglypuffStatus, setJigglypuffStatus] =
    useState<JigglypuffStatus>("neutral");
  const [notes, setNotes] = useState([]);
  const [jigglypuffSprite, setJigglypuffSprite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [unlockedPokemon, setUnlockedPokemon] = useState(["jigglypuff"]);
  const [isStickerBookOpen, setIsStickerBookOpen] = useState(false);
  const [newUnlock, setNewUnlock] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(1);
  const [isResetConfirmationVisible, setIsResetConfirmationVisible] =
    useState(false);
  const [isResetLevelConfirmationVisible, setIsResetLevelConfirmationVisible] =
    useState(false);
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sounds = useSoundEffects();

  useEffect(() => {
    try {
      setIsLoading(true);
      const jiggly = getJigglyPuffSprite();
      setJigglypuffSprite(jiggly);
    } catch (error) {
      setIsLoading(false);
      setError("Failed to fetch Jigglypuff sprite.");
    }
    const fetchJigglypuff = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon/jigglypuff"
        );
        if (!response.ok) throw new Error("Could not fetch Jigglypuff!");
        const data = await response.json();
        setJigglypuffSprite(
          data.sprites.other["official-artwork"].front_default
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJigglypuff();
  }, []);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem("jigglypuffMathGameReact");
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      if (savedState) {
        const {
          level,
          score,
          highScore,
          unlockedPokemon,
          dailyStreak,
          lastPlayedDate,
        } = JSON.parse(savedState);
        setLevel(level || 1);
        setScore(score || 0);
        setHighScore(highScore || 0);
        setUnlockedPokemon(unlockedPokemon || ["jigglypuff"]);
        if (lastPlayedDate) {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          if (lastPlayedDate === todayStr) setDailyStreak(dailyStreak || 1);
          else if (lastPlayedDate === yesterdayStr)
            setDailyStreak((dailyStreak || 1) + 1);
          else setDailyStreak(1);
        } else setDailyStreak(1);
      } else setDailyStreak(1);
    } catch (error) {
      console.error("Could not load saved progress.", error);
      setDailyStreak(1);
    }
  }, []);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const stateToSave = JSON.stringify({
        level,
        score,
        highScore,
        unlockedPokemon,
        dailyStreak,
        lastPlayedDate: todayStr,
      });
      localStorage.setItem("jigglypuffMathGameReact", stateToSave);
    } catch (error) {
      console.error("Could not save progress.", error);
    }
  }, [level, score, highScore, unlockedPokemon, dailyStreak]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // gonna need to clean this up...
  const generateProblem = useCallback(() => {
    let text = "";
    let answer = 0;
    const random = (max: number, min = 1) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    if (level < 4) {
      let num1, num2;
      const operator = Math.random() > 0.5 ? "+" : "-";
      if (operator === "+") {
        num1 = random(10, 1);
        num2 = random(10, 1);
        answer = num1 + num2;
      } else {
        num1 = random(10, 1);
        num2 = random(num1 - 1, 1);
        answer = num1 - num2;
      }
      text = `${num1} ${operator} ${num2} = ?`;
    } else if (level < 7) {
      const isThreeTerm = Math.random() < 0.3;
      let operator;
      let num1, num2, num3;
      const operators = ["+", "-", "×", "÷"];
      operator = operators[random(3, 0)];
      if (isThreeTerm && operator === "÷") operator = "×";
      if (isThreeTerm) {
        if (operator === "+") {
          num1 = random(10, 1);
          num2 = random(10, 1);
          num3 = random(10, 1);
          answer = num1 + num2 + num3;
          text = `${num1} + ${num2} + ${num3} = ?`;
        } else if (operator === "-") {
          num1 = random(30, 20);
          num2 = random(9, 1);
          num3 = random(9, 1);
          if (num1 < num2 + num3) num1 = num2 + num3 + random(5, 1);
          answer = num1 - num2 - num3;
          text = `${num1} - ${num2} - ${num3} = ?`;
        } else if (operator === "×") {
          num1 = random(4, 2);
          num2 = random(4, 2);
          num3 = random(3, 1);
          answer = num1 * num2 * num3;
          text = `${num1} × ${num2} × ${num3} = ?`;
        }
      } else {
        if (operator === "+") {
          num1 = random(15, 1);
          num2 = random(15, 1);
          answer = num1 + num2;
          text = `${num1} + ${num2} = ?`;
        } else if (operator === "-") {
          num1 = random(20, 10);
          num2 = random(num1 - 1, 1);
          answer = num1 - num2;
          text = `${num1} - ${num2} = ?`;
        } else if (operator === "×") {
          num1 = random(8, 2);
          num2 = random(8, 2);
          answer = num1 * num2;
          text = `${num1} × ${num2} = ?`;
        } else if (operator === "÷") {
          answer = random(8, 2);
          num2 = random(8, 2);
          num1 = answer * num2;
          text = `${num1} ÷ ${num2} = ?`;
        }
      }
    } else {
      let num1 = random(10, 2);
      let num2 = random(8, 1);
      let num3 = random(8, 1);
      const op = Math.random() > 0.5 ? "+" : "-";
      if (op === "+") {
        text = `${num1} × (${num2} + ${num3}) = ?`;
        answer = num1 * (num2 + num3);
      } else {
        if (num2 < num3) [num2, num3] = [num3, num2];
        text = `${num1} × (${num2} - ${num3}) = ?`;
        answer = num1 * (num2 - num3);
      }
    }
    setProblem({ text, answer });
  }, [level]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const createNoteAnimation = () => {
    setNotes((prev) => [...prev, { id: Date.now() }]);
    setTimeout(
      () => setNotes((prev) => [...prev, { id: Date.now() + 1 }]),
      200
    );
  };

  const handleNoteAnimationEnd = (id: any) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const answerNum = parseInt(userAnswer, 10);
    if (isNaN(answerNum)) {
      setFeedback({
        message: "Please enter a number!",
        color: "text-yellow-500",
      });
      return;
    }
    let leveledUp = false;
    if (answerNum === problem.answer) {
      const newCorrectAnswers = correctAnswersInRow + 1;
      if (newCorrectAnswers >= 5) {
        leveledUp = true;
        const newLevel = level + 1;
        setLevel(newLevel);
        setCorrectAnswersInRow(0);
        setScore((s) => s + 10);
        setJigglypuffStatus("happy");
        sounds.playSound("levelUp");
        createNoteAnimation();
        const unlocked = UNLOCKABLE_POKEMON.find((p) => p.level === newLevel);
        if (unlocked && !unlockedPokemon.includes(unlocked.name)) {
          setUnlockedPokemon((prev) => [...prev, unlocked.name]);
          setFeedback({
            message: `You unlocked ${unlocked.displayName}!`,
            color: "text-purple-500",
          });
          setNewUnlock(true);
        } else {
          setFeedback({ message: "Level Up!", color: "text-pink-500" });
        }
      } else {
        setScore((s) => s + 10);
        setCorrectAnswersInRow((c) => c + 1);
        setFeedback({ message: "Correct!", color: "text-green-500" });
        setJigglypuffStatus("happy");
        sounds.playSound("correct");
        createNoteAnimation();
      }
    } else {
      setCorrectAnswersInRow(0);
      setFeedback({
        message: `Puff! The answer was ${problem.answer}.`,
        color: "text-red-500",
      });
      setJigglypuffStatus("sad");
      sounds.playSound("incorrect");
      const penalty = Math.ceil(level / 2);
      setScore((s) => Math.max(0, s - penalty));
    }
    setUserAnswer("");
    setTimeout(() => {
      setJigglypuffStatus("neutral");
      if (!leveledUp) generateProblem();
    }, 1500);
  };

  const confirmResetLevel = () => {
    setLevel(1);
    setScore(0);
    setCorrectAnswersInRow(0);
    setFeedback({ message: "Level Reset!", color: "text-blue-500" });
    setIsResetLevelConfirmationVisible(false);
  };

  const handleClearProgress = () => {
    localStorage.removeItem("jigglypuffMathGameReact");
    window.location.reload();
  };

  const handleDebugStateChange = (key: any, value: any) => {
    const setters = {
      level: setLevel,
      score: setScore,
      highScore: setHighScore,
      dailyStreak: setDailyStreak,
    };
    setters[key]?.(value);
  };

  const jigglypuffStatusClasses = {
    happy: "animate-bounce",
    sad: "scale-110",
    neutral: "",
  };

  return (
    <>
      {isResetLevelConfirmationVisible && (
        <ConfirmationModal
          onConfirm={confirmResetLevel}
          onCancel={() => setIsResetLevelConfirmationVisible(false)}
          title="Reset Level?"
          message="This will reset your current level and score, but not your high score or collection."
          confirmText="Yes, Reset"
          confirmColor="bg-blue-500 hover:bg-blue-600"
        />
      )}
      {isResetConfirmationVisible && (
        <ConfirmationModal
          onConfirm={handleClearProgress}
          onCancel={() => setIsResetConfirmationVisible(false)}
          title="Reset All Progress?"
          message="This will erase all your progress. This action cannot be undone."
          confirmText="Yes, Erase Everything"
          confirmColor="bg-red-500 hover:bg-red-600"
        />
      )}
      {isStickerBookOpen && (
        <StickerBookModal
          unlockedPokemon={unlockedPokemon}
          onClose={() => setIsStickerBookOpen(false)}
        />
      )}
      {isDebugVisible && (
        <DebugWindow
          gameState={{ level, score, highScore, dailyStreak }}
          onStateChange={handleDebugStateChange}
          onClose={() => setIsDebugVisible(false)}
        />
      )}

      <div className="bg-pink-100 flex items-center justify-center min-h-screen font-sans p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center space-y-6 relative">
          <button
            onClick={() => setIsDebugVisible((v) => !v)}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            aria-label="Toggle Debug Menu"
          >
            <SettingsIcon />
          </button>

          <button
            onClick={() => {
              setIsStickerBookOpen(true);
              setNewUnlock(false);
            }}
            className={`absolute top-4 right-4 bg-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${newUnlock ? "animate-glow" : ""}`}
            aria-label="Open Pokémon Collection"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </button>

          <header>
            <h1 className="text-3xl md:text-4xl font-bold text-pink-600">
              Jigglypuff's Math Melody
            </h1>
            <p className="text-gray-500">Let's sing and solve!</p>
          </header>

          <div className="flex justify-center items-center h-48 relative">
            {isLoading && (
              <div className="text-pink-500">Finding Jigglypuff...</div>
            )}
            {error && <div className="text-red-500">Oh no! {error}</div>}
            {jigglypuffSprite && (
              <img
                src={jigglypuffSprite}
                alt="Jigglypuff"
                className={`h-36 w-36 md:h-40 md:w-40 object-contain transition-transform duration-300 ${jigglypuffStatusClasses[jigglypuffStatus]}`}
              />
            )}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {notes.map((note) => (
                <Note
                  key={note.id}
                  id={note.id}
                  onAnimationEnd={handleNoteAnimationEnd}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-pink-50 p-3 rounded-lg text-center">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-pink-500">
                LEVEL
              </p>
              <p className="text-xl sm:text-2xl font-bold text-pink-700">
                {level}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-pink-500">
                SCORE
              </p>
              <p className="text-xl sm:text-2xl font-bold text-pink-700">
                {score}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-pink-500">
                HIGH SCORE
              </p>
              <p className="text-xl sm:text-2xl font-bold text-pink-700">
                {highScore}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span
                className="text-2xl sm:text-3xl"
                role="img"
                aria-label="streak flame"
              >
                🔥
              </span>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
                {dailyStreak}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wider">
              {problem.text}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full p-3 text-2xl text-center border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition"
              placeholder="Your Answer"
              autoFocus
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 active:bg-pink-700 transform hover:scale-105 transition"
            >
              Submit
            </button>
          </form>

          <div
            className={`h-6 text-xl font-semibold transition-colors duration-300 ${feedback.color}`}
          >
            {feedback.message}
          </div>

          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <button
              onClick={() => setIsResetLevelConfirmationVisible(true)}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Reset Level
            </button>
            <button
              onClick={() => setIsResetConfirmationVisible(true)}
              className="text-sm text-red-500 hover:text-red-700 hover:underline"
            >
              Reset All Progress
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
