"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [skins, setSkins] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("winPercent");
  const [sortDirection, setSortDirection] = useState("desc");

  const fieldIsNumeric = ["winPercent", "appearances", "votesFor", "votesAgainst"];

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setSkins(data));
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const filteredSkins = skins
    .filter(
      (skin) =>
        skin.name.toLowerCase().includes(search.toLowerCase()) ||
        skin.champion.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = fieldIsNumeric.includes(sortBy) ? parseFloat(a[sortBy]) : a[sortBy];
      const bValue = fieldIsNumeric.includes(sortBy) ? parseFloat(b[sortBy]) : b[sortBy];
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-gold mb-8">Leaderboard</h1>

      <input
        type="text"
        placeholder="Search skins or champions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-3 border border-lightPurple bg-darkPurple text-foreground rounded w-full max-w-md"
      />

      <div className="overflow-x-auto w-full max-w-5xl border border-lightPurple rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-darkPurple text-lightPurple">
            <tr>
              {[
                { label: "Skin Name", field: "name" },
                { label: "Champion", field: "champion" },
                { label: "Win %", field: "winPercent" },
                { label: "Appearances", field: "appearances" },
                { label: "Wins", field: "votesFor" },
                { label: "Losses", field: "votesAgainst" },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="cursor-pointer p-4 border-b border-lightPurple hover:text-gold transition"
                >
                  {label}
                  {sortBy === field && (sortDirection === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSkins.map((skin, index) => (
              <tr
                key={skin.id}
                className="even:bg-lightPurple/10 odd:bg-darkPurple hover:bg-purple-900 transition duration-150"
              >
                <td className="p-3 border-b border-lightPurple">{skin.name}</td>
                <td className="p-3 border-b border-lightPurple">{skin.champion}</td>
                <td className="p-3 border-b border-lightPurple">{skin.winPercent}%</td>
                <td className="p-3 border-b border-lightPurple">{skin.appearances}</td>
                <td className="p-3 border-b border-lightPurple">{skin.votesFor}</td>
                <td className="p-3 border-b border-lightPurple">{skin.votesAgainst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
