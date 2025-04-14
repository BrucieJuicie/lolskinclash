"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [skins, setSkins] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popularityRating");
  const [sortDirection, setSortDirection] = useState("desc");
  const [activeSkin, setActiveSkin] = useState(null);

  const fieldIsNumeric = [
    "popularityRating",
    "winPercent",
    "appearances",
    "votesFor",
    "votesAgainst",
  ];

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
      if (sortBy === "popularityRating") {
        if (b.popularityRating !== a.popularityRating) {
          return b.popularityRating - a.popularityRating;
        }
        if (b.votesFor !== a.votesFor) {
          return b.votesFor - a.votesFor;
        }
        if (parseFloat(b.winPercent) !== parseFloat(a.winPercent)) {
          return parseFloat(b.winPercent) - parseFloat(a.winPercent);
        }
        return b.appearances - a.appearances;
      }

      const aValue = fieldIsNumeric.includes(sortBy)
        ? parseFloat(a[sortBy])
        : a[sortBy];
      const bValue = fieldIsNumeric.includes(sortBy)
        ? parseFloat(b[sortBy])
        : b[sortBy];
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-gold mb-4">
        Skin Rankings
      </h1>

      <input
        type="text"
        placeholder="Search skins or champions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-3 border border-lightPurple bg-darkPurple text-foreground rounded w-full max-w-md text-center"
      />

      <div className="w-full max-w-4xl">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-lightPurple">#</th>
              {[
                { label: "Skin Name", field: "name" },
                { label: "Champion", field: "champion" },
                { label: "Popularity", field: "popularityRating" },
                { label: "Win %", field: "winPercent" },
                { label: "Appearances", field: "appearances" },
                { label: "Wins", field: "votesFor" },
                { label: "Losses", field: "votesAgainst" },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="cursor-pointer p-3 text-lightPurple hover:text-gold transition"
                >
                  {label}
                  {sortBy === field &&
                    (sortDirection === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredSkins.map((skin, index) => (
              <tr
                key={skin.id}
                className={`${
                  index % 2 === 0
                    ? "bg-darkPurple"
                    : "bg-lightPurple/10"
                } rounded-lg transition duration-200 hover:bg-purple-900 hover:scale-[1.01]`}
              >
                <td className="p-3 text-gold font-bold">{index + 1}</td>
                <td
                  onClick={() => setActiveSkin(skin)}
                  className="p-3 text-gold font-bold cursor-pointer hover:underline"
                >
                  {skin.name}
                </td>
                <td className="p-3 text-lightPurple">{skin.champion}</td>
                <td className="p-3 text-lightPurple">
                  {skin.popularityRating}
                </td>
                <td className="p-3 text-lightPurple">{skin.winPercent}%</td>
                <td className="p-3 text-lightPurple pl-6">
                  {skin.appearances}
                </td>
                <td className="p-3 text-lightPurple pl-6">
                  {skin.votesFor}
                </td>
                <td className="p-3 text-lightPurple pl-6">
                  {skin.votesAgainst}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeSkin && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setActiveSkin(null)}
        >
          <div
            className="relative max-w-2xl w-[640px] max-h-[480px] overflow-hidden p-2 cursor-pointer"
            onClick={() => setActiveSkin(null)}
          >
            <img
              src={activeSkin.image}
              alt={activeSkin.name}
              className="w-full h-auto rounded-lg border-4 border-gold object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
