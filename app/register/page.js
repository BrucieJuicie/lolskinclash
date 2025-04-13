// /app/register/page.jsx

"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className=" p-4 pt-[24px] flex flex-col items-center">
      <h1 className="text-[32px] text-gold font-bold mb-[24px]">Register</h1>

      <form className="w-full max-w-sm flex flex-col gap-[12px]">
        <input
          type="text"
          placeholder="Username"
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded border border-lightPurple bg-darkPurple text-foreground"
        />

        <button
          type="submit"
          className="bg-gold text-background font-bold py-2 px-4 rounded hover:scale-105 transition"
        >
          Register
        </button>
      </form>

      <p className="text-lightPurple text-sm mt-[16px]">
        Already have an account?{' '}
        <Link href="/login" className="hover:text-gold">
          Login
        </Link>
      </p>
    </main>
  );
}