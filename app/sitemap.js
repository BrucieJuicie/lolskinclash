const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolskinclash.com";

export default function sitemap() {
  const now = new Date();

  return [
    "",
    "/leaderboard",
    "/users",
    "/rift",
    "/login",
    "/register",
    "/forgot-password",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
