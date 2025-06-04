"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid Credentials");
    } else {
      router.push("/profile");
    }
  };

  return (
    <main className="p-4 pt-[16px] flex flex-col items-center">
      <h1 className="text-[32px] text-gold font-bold mb-[16px]">Login</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-[12px]"
      >
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
          Login
        </button>

      </form>

      <p className="text-lightPurple text-sm mt-[16px]">
      Don&apos;t have an account?{" "}
        <Link href="/register" className="hover:text-gold">
          Register
        </Link>
      </p>
      <p className="text-lightPurple text-sm mt-2">
          <Link href="/forgot-password" className="hover:text-gold">
           Forgot Password?
          </Link>
        </p>
    </main>
  );
}
