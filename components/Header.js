"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col items-center py-4">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="LoL Skin Clash Logo"
        width={200}
        height={200}
        priority
      />

      {/* Navigation Menu */}
      <nav className="flex gap-6 mt-4">
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
      </nav>
    </header>
  );
}
