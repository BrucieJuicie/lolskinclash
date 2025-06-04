"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RiftPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [newPost, setNewPost] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    fetch(`/api/rift/posts?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setTotalPosts(data.totalCount || 0);
      });
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/rift/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newPost }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Failed to post.");
    } else {
      setNewPost("");
      setSuccess("Posted successfully!");
      setPosts((prev) => [data.post, ...prev.slice(0, 9)]);
      setTotalPosts((prev) => prev + 1);
    }
  };

  const achievementLabel = (key) => {
    const map = {
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
      champion_judge: "Champion Judge",
      champion_betrayer: "Champion Betrayer",
      profile_1000: "1,000 Profile Views",
      champion_all_skins: "Champion Master",
      champion_diversity_50: "Voted 50 Champions",
      vote_100_today: "100 Votes in One Day",
      early_bird: "Early Bird",
      night_owl: "Night Owl",
    };
    return map[key] || key;
  };

  if (status === "loading") {
    return <p className="text-lightPurple text-center mt-10">Loading...</p>;
  }

  if (status !== "authenticated") {
    return (
      <p className="text-lightPurple text-center mt-10">
        You must be{" "}
        <Link href="/login" className="text-gold underline">
          logged in
        </Link>{" "}
        to view the Rift.
      </p>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-gold text-3xl font-bold mb-6 text-center">The Rift</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          rows="3"
          maxLength="200"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="w-full p-3 rounded border border-lightPurple bg-darkPurple text-foreground resize-none"
          placeholder="Share your thoughts..."
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-lightPurple">{newPost.length}/280</span>
          <button
            type="submit"
            disabled={!newPost.trim() || loading}
            className="bg-gold text-background font-bold py-2 px-4 rounded hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 mt-2 text-sm text-center">{success}</p>}
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-[#1f1b2e] border border-lightPurple/30 p-4 rounded-xl shadow"
          >
            <div className="flex items-center gap-[16px] p-[16px]">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${post.avatar || "266"}.png`}
                alt="avatar"
                className="w-[64px] h-[64px] rounded-full border border-gold"
              />
              <Link
                href={`/users/${post.userId}`}
                className="text-[24px] text-gold font-semibold hover:underline hover:text-lightPurple transition"
              >
                {post.username}
              </Link>
              <span className="text-lightPurple text-xs ml-auto">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>

            {post.type === "achievement" ? (
              <div className="flex items-center gap-[8px] p-[8px] text-sm text-gold">
                <img
                  src={`/badges/${post.text}.png`}
                  alt={post.text}
                  className="w-[64px] h-[64px] border border-lightPurple rounded"
                />
                <span>
                  ⚡ {post.username} earned the{" "}
                  <span className="italic">{achievementLabel(post.text)}</span> achievement!
                </span>
              </div>
            ) : (
              <p className="text-lightPurple text-sm p-[8px] whitespace-pre-wrap">{post.text}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPosts > pageSize && (
        <div className="flex justify-center gap-[4px] mt-6">
          {Array.from({ length: Math.ceil(totalPosts / pageSize) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border text-sm ${
                page === p
                  ? "bg-gold text-background font-bold"
                  : "bg-darkPurple text-lightPurple border-lightPurple"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
