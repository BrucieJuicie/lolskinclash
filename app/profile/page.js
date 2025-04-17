"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        await fetch(`/api/users/${session.user.id}/views`, { method: "POST" });

        const res = await fetch(`/api/users/${session.user.id}`);
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
      }
    };

    fetchData();
  }, [session, status]);

  if (status === "loading" || (status === "authenticated" && !userData)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lightPurple">Loading profile...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lightPurple">Please log in to view your profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
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

          <div className="flex flex-wrap gap-[24px] mb-[16px]">
            {[266, 103, 17, 36, 222].map((champId) => (
              <img
                key={champId}
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`}
                onClick={async () => {
                  await fetch(`/api/users/${session.user.id}/avatar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatar: champId }),
                  });

                  const res = await fetch(`/api/users/${session.user.id}`);
                  const data = await res.json();
                  setUserData((prev) => ({
                    ...prev,
                    avatar: data.avatar,
                  }));
                }}
                className={`w-[48px] h-[48px] rounded-full cursor-pointer border-2 hover:scale-110 transition ${
                  userData.avatar == champId
                    ? "border-gold"
                    : "border-lightPurple"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-[8px] mb-[24px]">
            {[{
              label: "Total Votes", value: userData.votesCast
            }, {
              label: "Most Voted For", value: userData.mostVotedForSkin || "N/A"
            }, {
              label: "Most Voted Against", value: userData.mostVotedAgainstSkin || "N/A"
            }, {
              label: "Profile Views", value: userData.profileViews
            }].map((stat) => (
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
          {/* Achievements */}
<div className="mt-4">
  <h2 className="text-gold text-2xl font-bold mb-2 text-center md:text-left">
    Achievements
  </h2>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {userData.achievements?.length > 0 ? (
      userData.achievements.map((achv) => {
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

          champion_master: "Champion Master",
          champion_judge: "Champion Judge",
          champion_betrayer: "Champion Betrayer",
          champion_all: "All Champions Voted",

          profile_1000: "1,000 Profile Views",
          champion_all_skins: "Completed a Champion's Skins",

          voted_50_champs: "Voted 50 Champions",
          vote_100_day: "100 Votes in One Day",
          early_bird: "Early Bird (6AM–9AM)",
          night_owl: "Night Owl (12AM–3AM)",
          early_supporter: "Early Supporter",
        };

        return (
          <div
            key={achv}
            className="bg-[#1f1b2e] border border-lightPurple/30 text-gold text-center text-sm p-2 rounded-lg font-bold"
          >
            {achievementLabels[achv] || achv}
          </div>
        );
      })
    ) : (
      <div className="text-lightPurple text-sm">No achievements yet.</div>
    )}
  </div>
</div>

        </div>
      </div>
    </main>
  );
}
