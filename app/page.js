"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const TRANSITION_MS = 260;

export default function HomePage() {
  const [skins, setSkins] = useState([]);
  const [queuedSkins, setQueuedSkins] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const transitionTimerRef = useRef(null);

  const fetchRandomSkins = useCallback(async () => {
    const response = await fetch("/api/skins/random", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch random skins.");
    }

    return response.json();
  }, []);

  useEffect(() => {
    fetchRandomSkins()
      .then((data) => setSkins(data))
      .catch((err) => console.error("Error fetching skins:", err));

    fetch("/api/skins/highlights", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setHighlights(data))
      .catch((err) => console.error("Error fetching highlights:", err));

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [fetchRandomSkins]);

  const beginTransition = useCallback((nextSkins) => {
    setQueuedSkins(nextSkins);
    setIsTransitioning(true);

    transitionTimerRef.current = setTimeout(() => {
      setSkins(nextSkins);
      setQueuedSkins(null);
      setIsTransitioning(false);
    }, TRANSITION_MS);
  }, []);

  async function handleVote(formData) {
    if (isVoting || isTransitioning || skins.length < 2) {
      return;
    }

    try {
      setIsVoting(true);

      const voteResponse = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winnerId: formData.get("winnerId"),
          loserId: formData.get("loserId"),
        }),
      });

      if (!voteResponse.ok) {
        throw new Error("Vote request failed.");
      }

      const nextSkins = await fetchRandomSkins();
      beginTransition(nextSkins);
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setIsVoting(false);
    }
  }

  if (skins.length < 2) {
    return <div className="text-center text-gold text-2xl mt-8">Loading...</div>;
  }

  const [skin1, skin2] = skins;

  return (
    <main className="flex flex-col items-center justify-center px-8 pt-4 pb-8">
      <h1 className="text-[24px] font-extrabold text-gold mt-[12px] text-center">Vote Your Favorite Skin</h1>

      <div className="relative mt-[12px] w-full">
        <div className="relative min-h-[735px]">
          <VotePair
            skins={[skin1, skin2]}
            onVote={handleVote}
            disabled={isVoting || isTransitioning}
            className={`absolute inset-0 transition-all duration-300 ${
              isTransitioning ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100"
            }`}
          />

          {queuedSkins?.length === 2 && (
            <VotePair
              skins={queuedSkins}
              onVote={handleVote}
              disabled
              className={`absolute inset-0 transition-all duration-300 ${
                isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-[1.01]"
              }`}
            />
          )}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl font-extrabold text-gold pointer-events-none">
            VS
          </div>
        </div>
      </div>

      <div className="h-[2px] bg-lightPurple w-full my-[48px]" />

      <section className="max-w-4xl text-center">
        <h2 className="text-[32px] text-gold font-bold mb-[16px]">About LoL Skin Clash</h2>
        <p className="text-lightPurple mb-[24px]">
          LoL Skin Clash is the ultimate community voting platform where League of Legends players decide which skins reign supreme. Vote between two skins, track rankings, and see which champions rise to the top based on player votes worldwide.
        </p>
      </section>

      <section className="max-w-6xl mt-[48px] w-full">
        <h2 className="text-[32px] text-gold font-bold text-center mb-[24px]">Recent Leaderboard Highlights</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[24px] mb-[64px]">
          {highlights.map((skin) => (
            <div
              key={skin._id}
              className="bg-[#1f1b2e] border border-lightPurple/30 rounded-xl p-[16px] text-center hover:scale-105 transition"
            >
              <Image
                src={skin.image}
                alt={skin.name}
                width={300}
                height={420}
                className="w-full h-auto rounded-md mb-[16px] border border-gold"
              />
              <h3 className="text-gold text-xl font-bold">{skin.name}</h3>
              <p className="text-lightPurple text-sm mt-[4px]">{skin.votesFor} Votes</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-lightPurple mt-[48px] text-center max-w-2xl mb-[64px]">
        Ready to help your favorite skin climb the ranks? Start voting now and make your voice heard in the ultimate LoL skin showdown!
      </p>
    </main>
  );
}

function VotePair({ skins, onVote, disabled, className }) {
  const [left, right] = skins;

  return (
    <div className={`${className} flex items-center justify-center gap-[48px]`}>
      {[left, right].map((skin, idx) => (
        <VoteCard
          key={`${skin._id.toString()}-${idx}`}
          skin={skin}
          loserId={(idx === 0 ? right._id : left._id).toString()}
          onVote={onVote}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function VoteCard({ skin, loserId, onVote, disabled = false }) {
  return (
    <form action={onVote} className="w-full max-w-sm flex flex-col items-center" aria-busy={disabled}>
      <input type="hidden" name="winnerId" value={skin._id.toString()} />
      <input type="hidden" name="loserId" value={loserId} />

      <button
        disabled={disabled}
        className="flex flex-col items-center border-4 border-purple-600 rounded-xl hover:border-gold hover:scale-105 transition duration-200 p-2 shadow-lg disabled:opacity-90 disabled:cursor-not-allowed"
      >
        {skin.image ? (
          <Image
            src={skin.image}
            alt={skin.name}
            width={400}
            height={600}
            className="w-[400px] h-[600px] rounded-xl border border-gold shadow-xl object-cover"
            sizes="(max-width: 1024px) 45vw, 400px"
          />
        ) : (
          <div className="w-[400px] h-[600px] flex items-center justify-center text-lightPurple border rounded-xl">
            Image Missing
          </div>
        )}
        <span className="text-xl font-bold text-gold mt-2">{skin.name}</span>
      </button>
    </form>
  );
}
