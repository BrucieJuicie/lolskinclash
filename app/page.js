"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [skins, setSkins] = useState([]);

  const fetchSkins = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/skins/random`);
    const data = await res.json();
    setSkins(data);
  };

  useEffect(() => {
    fetchSkins();
  }, []);

  const handleVote = async (formData) => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/vote`, {
      method: "POST",
      body: JSON.stringify({
        winnerId: formData.get("winnerId"),
        loserId: formData.get("loserId"),
      }),
    });

    fetchSkins(); // Refresh new skins after vote
  };

  if (skins.length < 2) {
    return <div className="text-center text-gold text-2xl mt-20">Loading...</div>;
  }

  const [skin1, skin2] = skins;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-extrabold text-gold mb-8 text-center">
        Vote Your Favorite Skin
      </h1>

      <div className="flex items-end justify-center gap-20 w-full max-w-7xl">
        {[skin1, skin2].map((skin, idx) => (
          <form
            key={skin._id.toString() + idx}
            action={handleVote}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <input type="hidden" name="winnerId" value={skin._id.toString()} />
            <input type="hidden" name="loserId" value={(idx === 0 ? skin2._id : skin1._id).toString()} />

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
              <span className="text-xl font-bold text-gold mt-2">{skin.name}</span>
            </button>
          </form>
        ))}

        <div className="text-8xl font-extrabold text-lightPurple select-none">VS</div>
      </div>
    </main>
  );
}
