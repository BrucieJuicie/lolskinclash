"use client";

import { useEffect, useState, use } from "react";
import IncrementProfileView from "@/components/IncrementProfileView";

export default function PublicProfilePage({ params }) {
  const { id } = use(params);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();

      const allUsersRes = await fetch(`/api/users`);
      const allUsers = await allUsersRes.json();

      const sortedUsers = allUsers.sort((a, b) => b.votesCast - a.votesCast);
      const userRank = sortedUsers.findIndex((u) => u._id === data._id) + 1;

      setUserData({
        ...data,
        rank: userRank,
        totalUsers: allUsers.length,
      });
    };

    fetchData();
  }, [id]);

  if (!userData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lightPurple">Loading profile...</p>
      </main>
    );
  }

  const achievementLabels = {
    vote_100: "100 Votes Cast",
    vote_500: "500 Votes Cast",
    vote_1000: "1,000 Votes Cast",
    vote_2500: "2,500 Votes Cast",
    vote_5000: "5,000 Votes Cast",
    vote_7500: "7,500 Votes Cast",
    vote_10000: "10,000 Votes Cast",
    vote_15000: "15,000 Votes Cast",
    vote_25000: "25,000 Votes Cast",
    vote_50000: "50,000 Votes Cast",
    vote_75000: "75,000 Votes Cast",
    vote_100000: "100,000 Votes Cast",

    champion_judge: "Champion Judge: Voted on each champion at least one time.",
    champion_betrayer: "Champion Betrayer: Voted against one champion 50 times.",

    profile_1000: "1,000 Profile Views",
    champion_all_skins: "Champion Master: Voted on every skin for at least one champion.",

    champion_diversity_50: "Voted for 50 different Champions.",
    vote_100_day: "100 Votes in One Day",
    early_bird: "Early Bird (4AM–7AM)",
    night_owl: "Night Owl (1AM–4AM)",
  };

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="bg-darkPurple border border-lightPurple/30 rounded-2xl shadow-2xl max-w-5xl w-full p-6 flex flex-col md:grid md:grid-cols-[auto_1fr] gap-4 md:gap-6">
        {/* Left Side */}
        <div className="flex flex-col items-center justify-start mb-4 md:mb-0">
          <h1 className="text-[48px] font-bold text-gold mb-1 text-center">
            {userData.username}
          </h1>
          <div className="text-lightPurple text-[24px] mb-[16px] text-center">
            Rank #{userData.rank} of {userData.totalUsers}
          </div>

          <div className="relative mb-[16px]">
            <img
              src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${userData.avatar || "266"}.png`}
              alt="User Avatar"
              className="w-28 h-28 rounded-full border-4 border-gold shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gold opacity-10 blur-xl" />
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-[8px] mb-[24px]">
            {[
              { label: "Total Votes", value: userData.votesCast },
              {
                label: "Most Voted For",
                value: userData.mostVotedForSkin || "N/A",
              },
              {
                label: "Most Voted Against",
                value: userData.mostVotedAgainstSkin || "N/A",
              },
              { label: "Profile Views", value: userData.profileViews },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1f1b2e] border border-lightPurple/30 p-[8px] rounded-lg text-center"
              >
                <div className="text-lightPurple text-sm">{stat.label}</div>
                <div className="text-gold text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="mt-4 mx-auto">
  <h2 className="text-gold text-2xl font-bold mb-2 text-center md:text-left">
    Achievements
  </h2>

  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-[8px]">
    {userData.achievements?.length > 0 ? (
      userData.achievements.map((achv) => (
        <div key={achv} className="relative group">
          <img
            src={`/badges/${achv}.png`}
            alt={achv}
            className="w-14 h-14 rounded border border-lightPurple shadow"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-darkPurple text-lightPurple text-xs px-2 py-1 rounded border border-gold z-10 whitespace-nowrap text-center pointer-events-none">
            {achievementLabels[achv] || achv}
          </div>
        </div>
      ))
    ) : (
      <div className="text-lightPurple text-sm">No achievements yet.</div>
    )}
  </div>
</div>

        </div>
      </div>

      {/* Safe View Increment */}
      <IncrementProfileView userId={id} />
    </main>
  );
}
