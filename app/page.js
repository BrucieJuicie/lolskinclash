"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [skins, setSkins] = useState([]);

  useEffect(() => {
    fetch("/api/skins/random")
      .then((res) => res.json())
      .then((data) => setSkins(data));
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
    return <div className="text-center text-gold text-2xl mt-20">Loading...</div>;
  }

  const [skin1, skin2] = skins;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8">
      <h1 className="text-4xl font-extrabold text-gold mt-[24px] text-center">
        Vote Your Favorite Skin
      </h1>

      <div className="flex justify-center items-center gap-[48px] mt-[24px]">
        {/* Skin 1 */}
        <form
          action={handleVote}
          className="flex flex-col items-center"
        >
          <input type="hidden" name="winnerId" value={skin1._id.toString()} />
          <input type="hidden" name="loserId" value={skin2._id.toString()} />

          <button className="border-4 border-purple-600 rounded-xl hover:border-gold hover:scale-105 transition p-2 shadow-lg">
            <Image
              src={skin1.image}
              alt={skin1.name}
              width={400}
              height={600}
              className="rounded-xl border border-gold shadow-xl"
            />
            <span className="text-xl font-bold text-gold mt-2">
              {skin1.name}
            </span>
          </button>
        </form>

        {/* VS */}
        <div className="text-7xl font-extrabold text-gold mx-4">VS</div>

        {/* Skin 2 */}
        <form
          action={handleVote}
          className="flex flex-col items-center"
        >
          <input type="hidden" name="winnerId" value={skin2._id.toString()} />
          <input type="hidden" name="loserId" value={skin1._id.toString()} />

          <button className="border-4 border-purple-600 rounded-xl hover:border-gold hover:scale-105 transition p-2 shadow-lg">
            <Image
              src={skin2.image}
              alt={skin2.name}
              width={400}
              height={600}
              className="rounded-xl border border-gold shadow-xl"
            />
            <span className="text-xl font-bold text-gold mt-2">
              {skin2.name}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
