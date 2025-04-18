"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArenaPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [queued, setQueued] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleQueue = async () => {
    setStatus("joining...");
    const res = await fetch("/api/arena/queue", { method: "POST" });
    const data = await res.json();

    if (data.redirect) {
      router.push(data.redirect);
    } else {
      setQueued(true);
      setStatus("waiting...");
    }
  };

  useEffect(() => {
    if (!queued) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/arena/status");
      const data = await res.json();
      if (data.redirect) {
        clearInterval(interval);
        router.push(data.redirect);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [queued, router]);

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto text-center text-offWhite">
      <h1 className="text-4xl font-bold text-gold mb-4">Arena</h1>
      <p className="text-lightPurple mb-6">
  {session?.user?.username
    ? `Welcome, ${session.user.username}`
    : "Please log in to queue"}
</p>


      <button
        onClick={handleQueue}
        disabled={!session || queued}
        className="bg-gold text-darkPurple px-6 py-3 rounded-xl font-bold text-lg hover:scale-105 transition"
      >
        {queued ? status : "Queue for Match"}
      </button>
    </main>
  );
}
