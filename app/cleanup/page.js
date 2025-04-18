"use client";
import { useState } from "react";

export default function CleanupPage() {
  const [status, setStatus] = useState(null);
  const [count, setCount] = useState(null);

  const handleCleanup = async () => {
    setStatus("Cleaning...");
    setCount(null);

    try {
      const res = await fetch("/api/cleanup-drafts"); // ← GET request
      const data = await res.json();

      if (res.ok) {
        setStatus("Cleanup complete.");
        setCount(data.deleted);
      } else {
        setStatus(`Error: ${data.error || "Unknown failure"}`);
      }
    } catch (err) {
      setStatus("Failed to run cleanup.");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6 text-offWhite">
      <h1 className="text-3xl font-bold text-gold mb-4 text-center">Cleanup Drafts</h1>

      <p className="text-lightPurple text-center mb-6">
        This will delete all completed, stale, or abandoned draft lobbies.
      </p>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleCleanup}
          className="bg-gold text-darkPurple px-6 py-3 rounded-xl font-bold text-lg hover:scale-105 transition"
        >
          Run Cleanup
        </button>
      </div>

      {status && (
        <div className="text-center text-lightPurple mt-2">
          {status} {count !== null && <span>({count} deleted)</span>}
        </div>
      )}
    </main>
  );
}
