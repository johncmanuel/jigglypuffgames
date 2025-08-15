import ExtendedHead from "@/components/ExtendedHead";
import Container from "@/components/Container";
import { useWhackAPuffGame, ClickableCharacter} from "@/internal/whack-a-puff";

export default function WhackAPuff() {
  const { state, dispatch } = useWhackAPuffGame();
  const { status, timer, points, streak, maxStreak } = state;

  const handleMiss = () => {
    dispatch({ type: "MISS" });
  };

  const handleHit = (isClefairy: boolean) => {
    if (isClefairy) {
      dispatch({ type: "HIT_CLEFAIRY" });
    } else {
      dispatch({ type: "HIT_PUFF" });
    }
  };

  return (
    <>
      <ExtendedHead title={"Whack a Puff!"} />
      <Container>
        {status === "idle" && (
          <button
            type="button"
            className="focus:outline-none text-white bg-pink-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
            onClick={() => dispatch({ type: "START_GAME" })}
          >
            Start Game
          </button>
        )}

        {status === "finished" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold">Time's up!</h1>
            <h2 className="text-xl">Total points earned: {points}</h2>
            <h2 className="text-xl">Highest streak: {maxStreak}</h2>
            <button
              type="button"
              className="mt-4 focus:outline-none text-white bg-pink-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              onClick={() => dispatch({ type: "START_GAME" })}
            >
              Play Again?
            </button>
          </div>
        )}

        {status === "playing" && (
          <div className="w-screen h-screen" onClick={handleMiss}>
            <div
              className="fixed top-4 left-4 bg-white/40 border border-pink-300 shadow-lg rounded-xl px-6 py-4 flex flex-col gap-2 min-w-[180px] transition-all"
              style={{ width: "190px" }} 
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
            </div>
            <ClickableCharacter onHit={handleHit} />
          </div>
        )}
      </Container>
    </>
  );
}
