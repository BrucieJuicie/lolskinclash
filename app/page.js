"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [skins, setSkins] = useState([]);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    fetch("/api/skins/random")
      .then((res) => res.json())
      .then((data) => setSkins(data))
      .catch((err) => console.error("Error fetching skins:", err));

    fetch("/api/skins/highlights")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .sort((a, b) => b.votesFor - a.votesFor)
          .slice(0, 3);
        setHighlights(sorted);
      });
  }, []);

  async function handleVote(formData) {
    await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({
        winnerId: formData.get("winnerId"),
        loserId: formData.get("loserId"),
      }),
    });

    const res = await fetch("/api/skins/random");
    const data = await res.json();
    setSkins(data);
  }

  if (skins.length < 2) {
    return (
      <div className="text-center text-gold text-2xl mt-8">
        Loading...
      </div>
    );
  }

  const [skin1, skin2] = skins;

  return (
    <main className="flex flex-col items-center justify-center px-8 pt-4 pb-8">
      <h1 className="text-[24px] font-extrabold text-gold mt-[12px] text-center">
        Vote Your Favorite Skin
      </h1>

      <div className="relative flex items-center justify-center gap-[48px] mt-[12px]">
        {[skin1, skin2].map((skin, idx) => (
          <form
            key={skin._id.toString() + idx}
            action={handleVote}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <input type="hidden" name="winnerId" value={skin._id.toString()} />
            <input
              type="hidden"
              name="loserId"
              value={(idx === 0 ? skin2._id : skin1._id).toString()}
            />

            <button className="flex flex-col items-center border-4 border-purple-600 rounded-xl hover:border-gold hover:scale-105 transition duration-200 p-2 shadow-lg">
              {skin.image ? (
                <Image
                  src={skin.image}
                  alt={skin.name}
                  width={400}
                  height={600}
                  className="rounded-xl border border-gold shadow-xl"
                />
              ) : (
                <div className="w-[400px] h-[600px] flex items-center justify-center text-lightPurple border rounded-xl">
                  Image Missing
                </div>
              )}
              <span className="text-xl font-bold text-gold mt-2">
                {skin.name}
              </span>
            </button>
          </form>
        ))}

        <div className="absolute text-7xl font-extrabold text-gold">
          VS
        </div>
      </div>

      {/* Divider */}
      <div className="h-[2px] bg-lightPurple w-full my-[48px]" />

      {/* About Section */}
      <section className="max-w-4xl text-center">
        <h2 className="text-[32px] text-gold font-bold mb-[16px]">About LoL Skin Clash</h2>
        <p className="text-lightPurple mb-[24px]">
          LoL Skin Clash is the ultimate community voting platform where League of Legends players decide which skins reign supreme. Vote between two skins, track rankings, and see which champions rise to the top based on player votes worldwide.
        </p>
      </section>

      {/* Leaderboard Highlights */}
      <section className="max-w-6xl mt-[48px]">
        <h2 className="text-[32px] text-gold font-bold text-center mb-[24px]">
          Recent Leaderboard Highlights
        </h2>

        <div className="grid grid-cols-3 gap-[24px] mb-[64px]">
          {highlights.map((skin) => (
            <div
              key={skin._id}
              className="bg-[#1f1b2e] border border-lightPurple/30 rounded-xl p-[16px] text-center hover:scale-105 transition"
            >
              <img
                src={skin.image}
                alt={skin.name}
                className="w-full h-auto rounded-md mb-[16px] border border-gold"
              />
              <h3 className="text-gold text-xl font-bold">{skin.name}</h3>
              <p className="text-lightPurple text-sm mt-[4px]">
                {skin.votesFor} Votes
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <p className="text-lightPurple mt-[48px] text-center max-w-2xl mb-[64px]">
        Ready to help your favorite skin climb the ranks? Start voting now and make your voice heard in the ultimate LoL skin showdown!
      </p>
    </main>
  );
}
