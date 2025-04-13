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
      <nav className="flex gap-4 mt-1 flex-wrap justify-center">
        <Link href="/" className="hover:scale-105 transition duration-200">
          <Image
            src="/vote.png"
            alt="Vote Button"
            width={150}
            height={50}
            priority
          />
        </Link>

        <Link href="/leaderboard" className="hover:scale-105 transition duration-200">
          <Image
            src="/rankings.png"
            alt="Rankings Button"
            width={150}
            height={50}
            priority
          />
        </Link>

        <Link href="/users" className="hover:scale-105 transition duration-200">
          <Image
            src="/users.png"
            alt="Users Button"
            width={150}
            height={50}
            priority
          />
        </Link>

        {session?.user ? (
          <>
            <Link href="/profile" className="hover:scale-105 transition duration-200">
              <Image
                src="/profile.png"
                alt="Profile Button"
                width={150}
                height={50}
                priority
              />
            </Link>

            <button
              onClick={() => signOut()}
              className="hover:scale-105 transition duration-200"
            >
              <Image
                src="/logout.png"
                alt="Logout Button"
                width={150}
                height={50}
                priority
              />
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className="hover:scale-105 transition duration-200">
              <Image
                src="/register.png"
                alt="Register Button"
                width={150}
                height={50}
                priority
              />
            </Link>

            <Link href="/login" className="hover:scale-105 transition duration-200">
              <Image
                src="/login.png"
                alt="Login Button"
                width={150}
                height={50}
                priority
              />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
