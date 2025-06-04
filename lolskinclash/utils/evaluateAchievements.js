// lolskinclash\utils\evaluateAchievements.js
import { Skin } from "@/models/Skin";
import { RiftPost } from "@/models/RiftPost";

export async function evaluateAchievements(user) {
  const updates = [];
  const achievements = new Set(user.achievements || []);
  const now = new Date();

  // --- Vote milestones ---
  const voteMilestones = [100, 500, 1000, 2500, 5000, 7500, 10000, 15000, 25000, 50000, 75000, 100000];
  for (const count of voteMilestones) {
    if (user.votesCast >= count && !achievements.has(`vote_${count}`)) {
      achievements.add(`vote_${count}`);
      updates.push(`vote_${count}`);
    }
  }

  // --- Profile view milestone ---
  if (user.profileViews >= 1000 && !achievements.has("view_1000")) {
    achievements.add("view_1000");
    updates.push("view_1000");
  }

  // --- Champion Judge: voted for or against every champion at least once ---
  const allChampions = await Skin.distinct("champion");
  if (
    allChampions.every((champ) => user.votedChampions && user.votedChampions.includes(champ)) &&
    !achievements.has("champion_judge")
  ) {
    achievements.add("champion_judge");
    updates.push("champion_judge");
  }

  // --- Champion Master: voted for every skin of any ONE champion ---
  if (!achievements.has("champion_all_skins") && Array.isArray(user.votedSkins)) {
    for (const champ of allChampions) {
      const champSkins = await Skin.find({ champion: champ });
      const skinKeys = champSkins.map((s) => `${s.champion}-${s.num}`);
      const hasAll = skinKeys.every((k) => user.votedSkins.includes(k));
      if (hasAll) {
        achievements.add("champion_all_skins");
        updates.push("champion_all_skins");
        user.votedSkins = []; // Optional cleanup
        break;
      }
    }
  }

  // --- Champion Betrayer: voted for/against any one champion 50+ times ---
  // UPDATED LOGIC: Awards a single generic "champion_betrayer" achievement
  if (!achievements.has("champion_betrayer")) { 
    if (user.championVoteCounts && typeof user.championVoteCounts.entries === 'function') {
      for (const [champ, count] of user.championVoteCounts.entries()) {
        if (count >= 50) { 
          achievements.add("champion_betrayer"); 
          updates.push("champion_betrayer");
          break; 
        }
      }
    }
  }

  // --- Early Bird (votes cast between 4am-7am local time) ---
  const early = user.voteTimestamps.filter((t) => {
    const h = new Date(t).getHours();
    return h >= 4 && h < 7;
  });
  if (early.length >= 50 && !achievements.has("early_bird")) {
    achievements.add("early_bird");
    updates.push("early_bird");
  }

  // --- Night Owl (votes cast between 1am-4am local time) ---
  const night = user.voteTimestamps.filter((t) => {
    const h = new Date(t).getHours();
    return h >= 1 && h < 4;
  });
  if (night.length >= 50 && !achievements.has("night_owl")) {
    achievements.add("night_owl");
    updates.push("night_owl");
  }

  // --- Unique Champions Voted: 50 different champions ---
  if (
    user.votedChampions && user.votedChampions.length >= 50 &&
    !achievements.has("champion_diversity_50")
  ) {
    achievements.add("champion_diversity_50");
    updates.push("champion_diversity_50");
  }

  // --- 100 votes in a single day ---
  const todayForDailyVoteCheck = new Date();
  const todayVotes = user.voteTimestamps.filter((t) => {
    const d = new Date(t);
    return (
      d.getFullYear() === todayForDailyVoteCheck.getFullYear() &&
      d.getMonth() === todayForDailyVoteCheck.getMonth() &&
      d.getDate() === todayForDailyVoteCheck.getDate()
    );
  });
  if (todayVotes.length >= 100 && !achievements.has("vote_100_today")) {
    achievements.add("vote_100_today");
    updates.push("vote_100_today");
  }

  if (updates.length > 0) {
    user.achievements = Array.from(achievements);
    // REMOVED: await user.save(); // The calling function will handle saving

    const achievementPosts = updates.map((key) => ({
      userId: user._id,
      username: user.username,
      avatar: user.avatar || "266",
      text: key,
      type: "achievement",
      createdAt: new Date(),
    }));
    if (achievementPosts.length > 0) {
        await RiftPost.insertMany(achievementPosts);
    }
  }

  return updates;
}