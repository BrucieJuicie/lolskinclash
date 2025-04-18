// /components/MatchReplay.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MatchReplay({ log, winner }) {
  const [visibleLog, setVisibleLog] = useState([]);
  const [step, setStep] = useState(0);
  const [chance, setChance] = useState({ a: 50, b: 50 });
  const [aName, setAName] = useState("Team A");
  const [bName, setBName] = useState("Team B");

  useEffect(() => {
    if (!log || step >= log.length) return;

    const interval = setInterval(() => {
      const nextLine = log[step];
      setVisibleLog((prev) => [...prev, nextLine]);

      // Detect usernames on first few lines
      if (step === 0) {
        const foundA = log.find((line) => line.includes("✅ has Top"));
        if (foundA) setAName(foundA.split(" ✅ has Top")[0]);
        const foundB = log.find((line) => line.includes("✅ has Jungle") || line.includes("❌ missing Jungle"));
        if (foundB) setBName(foundB.split(" ✅ has Jungle")[0].split(" ❌ missing Jungle")[0]);
      }

      if (nextLine.includes("Win Chance:")) {
        const match = nextLine.match(/Win Chance: (.*?) (\d+)% vs Opponent (\d+)%/);
        if (match) {
          const [_, name, winA, winB] = match;
          if (name === aName) {
            setChance({ a: parseInt(winA), b: parseInt(winB) });
          } else {
            setChance({ a: parseInt(winB), b: parseInt(winA) });
          }
        }
      }

      setStep((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [step, log, aName, bName]);

  return (
    <div className="mt-10 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl text-gold font-bold mb-4">Match Replay</h2>

      {/* Win Chance Meter */}
      <div className="w-full bg-gray-800 rounded-full h-6 mb-4 border border-lightPurple overflow-hidden relative">
        <div
          className="bg-gold h-full transition-all duration-500"
          style={{ width: `${chance.a}%` }}
        ></div>
        <div className="absolute inset-0 flex justify-between px-4 text-sm text-lightPurple font-semibold">
          <span>{aName}</span>
          <span>{bName}</span>
        </div>
      </div>

      {/* Replay Log */}
      <div className="bg-gray-900 border border-lightPurple rounded-lg p-4 text-left text-sm space-y-2">
        {visibleLog.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>

      {/* Winner + Return Button */}
      {step >= log.length && (
        <div className="mt-6">
          <p className="text-xl text-gold font-semibold mb-4">
            🏆 {winner === "A" ? aName : bName} Wins!
          </p>
          <Link href="/arena">
            <button className="bg-gold text-darkPurple px-6 py-3 rounded-xl font-bold text-lg hover:scale-105 transition">
              Return to Queue
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
