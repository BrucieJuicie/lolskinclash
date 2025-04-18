"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex flex-col items-center py-2">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="LoL Skin Clash Logo"
        width={200}
        height={200}
        priority
      />

      {/* Navigation Menu */}
      <nav className="flex flex-wrap justify-center p-[2px] mt-[4px] mb-[4px]">
        <Link href="/" className="hover:scale-105 transition duration-200">
          <Image
            src="/vote.png"
            alt="Vote Button"
            width={120}
            height={40}
            priority
            style={{ display: "block" }}
          />
        </Link>

        <Link href="/leaderboard" className="hover:scale-105 transition duration-200">
          <Image
            src="/rankings.png"
            alt="Rankings Button"
            width={120}
            height={40}
            priority
            style={{ display: "block" }}
          />
        </Link>

        <Link href="/users" className="hover:scale-105 transition duration-200">
          <Image
            src="/users.png"
            alt="Users Button"
            width={120}
            height={40}
            priority
            style={{ display: "block" }}
          />
        </Link>

        <Link href="/arena" className="hover:scale-105 transition duration-200">
          <Image
            src="/arena.png"
            alt="Arena Button"
            width={120}
            height={40}
            priority
            style={{ display: "block" }}
          />
        </Link>

        {session?.user && (
          <Link href="/rift" className="hover:scale-105 transition duration-200">
            <Image
              src="/rift.png"
              alt="Rift Button"
              width={120}
              height={40}
              priority
              style={{ display: "block" }}
            />
          </Link>
        )}

        {session?.user ? (
          <>
            <Link href="/profile" className="hover:scale-105 transition duration-200">
              <Image
                src="/profile.png"
                alt="Profile Button"
                width={120}
                height={40}
                priority
                style={{ display: "block" }}
              />
            </Link>

            <button
              onClick={() => signOut()}
              className="hover:scale-105 transition duration-200"
            >
              <Image
                src="/logout.png"
                alt="Logout Button"
                width={120}
                height={40}
                priority
                style={{ display: "block" }}
              />
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className="hover:scale-105 transition duration-200">
              <Image
                src="/register.png"
                alt="Register Button"
                width={120}
                height={40}
                priority
                style={{ display: "block" }}
              />
            </Link>

            <Link href="/login" className="hover:scale-105 transition duration-200">
              <Image
                src="/login.png"
                alt="Login Button"
                width={120}
                height={40}
                priority
                style={{ display: "block" }}
              />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
