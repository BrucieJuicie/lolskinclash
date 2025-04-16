"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setMessage("Check your email for a password reset link.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="p-4 pt-[16px] flex flex-col items-center">
      <h1 className="text-[32px] text-gold font-bold mb-[16px]">
        Forgot Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-[12px]"
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
          required
        />

        {message && (
          <p className="text-green-500 text-sm text-center">{message}</p>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-gold text-background font-bold py-2 px-4 rounded hover:scale-105 transition"
        >
          Send Reset Link
        </button>
      </form>
    </main>
  );
}