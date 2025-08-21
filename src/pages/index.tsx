import ExtendedHead from "@/components/ExtendedHead";
import Jigglypuff from "@/components/Jigglypuff";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <ExtendedHead title={"Jigglypuff Games"} />
      <main className="min-h-screen bg-pink-100 flex flex-col items-center justify-center">
        <section className="w-full max-w-2xl text-center py-12 px-4 rounded-xl shadow-lg bg-white/80 border border-pink-200">
          <div className="flex flex-col items-center gap-4">
            <Jigglypuff width={200} height={200} />
            <h1 className="text-5xl font-extrabold text-pink-700 drop-shadow-lg mb-2">
              Welcome to Jigglypuff Games!
            </h1>
            <Link
              href="/whack-a-puff"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow transition duration-200"
            >
              Whack-A-Puff
            </Link>
            <Link
              href="/math-melody"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow transition duration-200"
            >
              Math Melody
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
