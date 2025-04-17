import { Skin } from "@/models/Skin";

export async function evaluateAchievements(user) {
  const updates = [];
  const achievements = new Set(user.achievements || []);
  const now = new Date();

  const voteMilestones = [100, 500, 1000, 2500, 5000, 7500, 10000, 15000, 25000, 50000, 75000, 100000];
  for (const count of voteMilestones) {
    if (user.votesCast >= count && !achievements.has(`vote_${count}`)) {
      achievements.add(`vote_${count}`);
      updates.push(`vote_${count}`);
    }
  }

  if (user.profileViews >= 1000 && !achievements.has("view_1000")) {
    achievements.add("view_1000");
    updates.push("view_1000");
  }

  const allChampions = await Skin.distinct("champion");

  if (
    allChampions.every((champ) => user.votedChampions.includes(champ)) &&
    !achievements.has("champion_judge")
  ) {
    achievements.add("champion_judge");
    updates.push("champion_judge");
  }

  for (const champ of allChampions) {
    const champSkins = await Skin.find({ champion: champ });
    const skinKeys = champSkins.map((s) => `${s.champion}-${s.num}`);
    const hasAll = skinKeys.every((k) => user.votedSkins.includes(k));
    if (hasAll && !achievements.has(`champion_master_${champ}`)) {
      achievements.add(`champion_master_${champ}`);
      updates.push(`champion_master_${champ}`);
    }
  }

  for (const [champ, count] of user.championVoteCounts.entries()) {
    if (count >= 50 && !achievements.has(`champion_betrayer_${champ}`)) {
      achievements.add(`champion_betrayer_${champ}`);
      updates.push(`champion_betrayer_${champ}`);
    }
  }

  const early = user.voteTimestamps.filter((t) => {
    const h = new Date(t).getHours();
    return h >= 4 && h < 7;
  });

  if (early.length >= 50 && !achievements.has("early_bird")) {
    achievements.add("early_bird");
    updates.push("early_bird");
  }

  const night = user.voteTimestamps.filter((t) => {
    const h = new Date(t).getHours();
    return h >= 1 && h < 4;
  });

  if (night.length >= 50 && !achievements.has("night_owl")) {
    achievements.add("night_owl");
    updates.push("night_owl");
  }

  // Apply the achievements back to the user, but do NOT save here
  user.achievements = Array.from(achievements);

  return updates;
}
