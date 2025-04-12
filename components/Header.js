"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col items-center w-full py-4">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="LoL Skin Clash Logo"
        width={200}
        height={200}
        priority
      />

      {/* Divider with Buttons */}
      <div className="relative w-full max-w-3xl my-4">
        {/* Gold Line */}
        <div className="absolute inset-y-1/2 left-0 right-0 border-t-2 border-gold"></div>

        {/* Navigation Buttons over Line */}
        <nav className="relative z-10 flex justify-center gap-6">
          <Link href="/">
            <Image
              src="/vote.png"
              alt="Vote Button"
              width={150}
              height={50}
              priority
              className="hover:scale-105 transition duration-200"
            />
          </Link>
          <Link href="/leaderboard">
            <Image
              src="/rankings.png"
              alt="Rankings Button"
              width={150}
              height={50}
              priority
              className="hover:scale-105 transition duration-200"
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}
