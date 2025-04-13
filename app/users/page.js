"use client";

import { useEffect, useState } from "react";

export default function UserLeaderboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-gold mb-4">User Leaderboard</h1>

      <div className="w-full max-w-2xl">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-lightPurple">Rank</th>
              <th className="p-3 text-lightPurple">Avatar</th>
              <th className="p-3 text-lightPurple">Username</th>
              <th className="p-3 text-lightPurple">Votes Cast</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={`${
                  index % 2 === 0 ? "bg-darkPurple" : "bg-lightPurple/10"
                } transition duration-200 hover:bg-purple-900 hover:scale-[1.01]`}
              >
                <td className="p-3 text-gold font-bold">{index + 1}</td>
                <td className="p-3">
                  <img
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${user.avatar || "266"}.png`}
                    alt="Avatar"
                    className="w-[32px] h-[32px] rounded-full mx-auto border-2 border-lightPurple"
                  />
                </td>
                <td className="p-3 text-gold font-bold">
                <a href={`/users/${user._id}`} className="hover:underline hover:text-lightPurple">
  {user.username}
</a>

</td>
                <td className="p-3 text-lightPurple">{user.votesCast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
