"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MatchReplay = dynamic(() => import("@/components/MatchReplay"), { ssr: false });

export default function DraftPageInner() {
  const { data: session } = useSession();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myTeam, setMyTeam] = useState(null);
  const searchParams = useSearchParams();
  const draftId = searchParams.get("id");
  const router = useRouter();

  useEffect(() => {
    if (!draftId || !session?.user?.id) return;

    const fetchDraft = async () => {
      try {
        const res = await fetch(`/api/draft/${draftId}`);
        if (!res.ok) throw new Error("Draft not found");
        const data = await res.json();
        setDraft(data);

        if (data.players) {
          const foundTeam =
            data.players.A?.id === session.user.id
              ? "A"
              : data.players.B?.id === session.user.id
              ? "B"
              : null;
          setMyTeam(foundTeam);
        }

        if (data.phase === "done" && !data.result) {
          const simulateRes = await fetch(`/api/draft/${draftId}/simulate`, { method: "POST" });
          if (simulateRes.ok) {
            const simData = await simulateRes.json();
            setDraft(simData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const pingServer = async () => {
      try {
        await fetch(`/api/draft/${draftId}/ping`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id })
        });
      } catch (err) {
        console.error("Ping failed", err);
      }
    };

    fetchDraft();
    pingServer();

    const interval = setInterval(() => {
      fetchDraft();
      pingServer();
    }, 10000);

    return () => clearInterval(interval);
  }, [draftId, session]);

  const handleAction = async (champion) => {
    if (!draftId || !draft || !myTeam || draft.turn !== myTeam || draft.phase === "done") return;

    const res = await fetch(`/api/draft/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ championName: champion.name })
    });

    if (!res.ok) return;

    const updated = await res.json();
    setDraft(updated);
  };

  if (loading) return <div className="text-center text-lightPurple">Loading draft...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  const { pool, teamA, teamB, bans, phase, turn, players, result } = draft;
  const takenNames = [...bans, ...teamA, ...teamB].map((c) => c.name);
  const displayPool = phase === "done" ? [] : pool.filter((champ) => !takenNames.includes(champ.name));

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto text-offWhite">
      <h1 className="text-4xl font-bold text-gold text-center mb-4">Champion Draft</h1>

      <p className="text-center text-lightPurple mb-2 text-lg">
        {phase === "ban"
          ? `🛑 Ban Phase – Team ${turn}'s turn`
          : teamA.length + teamB.length < 10
          ? `⚔️ Pick Phase – Team ${turn}'s turn`
          : "✅ Draft Complete!"}
      </p>

      {myTeam && players?.A && players?.B && (
        <div className="text-center text-lightPurple mb-6 text-lg">
          <p className="mb-1">
            You are{" "}
            <span className="text-gold font-bold">
              Team {myTeam} ({players[myTeam]?.name})
            </span>
          </p>
          <p className="mb-1">
            Your opponent is{" "}
            <span className="text-gold font-bold">
              Team {myTeam === "A" ? "B" : "A"} ({players[myTeam === "A" ? "B" : "A"]?.name})
            </span>
          </p>
          {turn !== myTeam && phase !== "done" && (
            <p className="italic text-sm mt-1 text-lightPurple">Waiting for opponent’s pick...</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="text-xl text-lightPurple font-semibold mb-2">🟥 Team A</h2>
          <ul className="space-y-1">{teamA.map((champ, i) => <li key={i} className="text-gold">{champ.name}</li>)}</ul>
        </div>
        <div>
          <h2 className="text-xl text-lightPurple font-semibold mb-2">🟦 Team B</h2>
          <ul className="space-y-1">{teamB.map((champ, i) => <li key={i} className="text-gold">{champ.name}</li>)}</ul>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {displayPool.map((champ, idx) => {
          const canAct = myTeam && turn === myTeam && phase !== "done";

          return (
            <button
              key={idx}
              onClick={() => canAct && handleAction(champ)}
              disabled={!canAct}
              className={`rounded-xl overflow-hidden border-2 flex flex-col items-center transition-all p-2
                ${canAct
                  ? "bg-darkPurple border-lightPurple text-gold hover:scale-105 hover:border-gold"
                  : "bg-darkPurple border-lightPurple text-gold opacity-50"}`}
            >
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
                alt={champ.name}
                className="w-[96px] h-[192px] object-cover rounded mb-1"
              />
              <div className="font-semibold text-center">{champ.name}</div>
              <div className="text-xs text-lightPurple text-center">
                {champ.possibleRoles?.join(", ") || champ.roles.join(", ")}
              </div>
            </button>
          );
        })}
      </div>

      {bans.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lightPurple font-semibold text-center mb-2 text-lg">🚫 Banned Champions</h2>
          <ul className="flex flex-wrap gap-2 justify-center">
            {bans.map((champ, idx) => (
              <li key={idx} className="px-3 py-1 rounded-lg border border-lightPurple text-gold bg-gray-900 text-sm">
                {champ.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && <MatchReplay log={result.log} winner={result.winner} />}
    </main>
  );
}
