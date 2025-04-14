"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || "Registration failed.");
    }
  };

  return (
    <main className="p-4 pt-[16px] flex flex-col items-center">
      <h1 className="text-[32px] text-gold font-bold mb-[16px]">Register</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-[12px]"
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
          required
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-gold text-background font-bold py-2 px-4 rounded hover:scale-105 transition"
        >
          Register
        </button>
      </form>

      <p className="text-lightPurple text-sm mt-[16px]">
        Already have an account?{" "}
        <Link href="/login" className="hover:text-gold">
          Login
        </Link>
      </p>
    </main>
  );
}
