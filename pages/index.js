import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import posts from "../data/posts.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [voteData, setVoteData] = useState({});
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem("ltav_votes") || "{}");
    setUserVotes(savedVotes);
    loadVotes();
  }, []);

  async function loadVotes() {
    const { data } = await supabase.from("votes").select("*");
    const grouped = {};

    data?.forEach((v) => {
      if (!grouped[v.post_id]) {
        grouped[v.post_id] = { agree: 0, disagree: 0 };
      }
      grouped[v.post_id][v.choice]++;
    });

    setVoteData(grouped);
  }

  async function handleVote(postId, choice) {
    if (userVotes[postId]) return;

    const voterId =
      localStorage.getItem("ltav_voter") ||
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("ltav_voter", id);
        return id;
      })();

    await supabase.from("votes").insert({
      post_id: postId,
      voter_id: voterId,
      choice,
    });

    const updated = { ...userVotes, [postId]: choice };
    localStorage.setItem("ltav_votes", JSON.stringify(updated));
    setUserVotes(updated);
    loadVotes();
  }

  function renderBar(postId) {
    const agree = voteData[postId]?.agree || 0;
    const disagree = voteData[postId]?.disagree || 0;
    const total = agree + disagree || 1;

    const agreePct = Math.round((agree / total) * 100);
    const disagreePct = 100 - agreePct;

    return (
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            display: "flex",
            height: 10,
            borderRadius: 6,
            overflow: "hidden",
            background: "#333",
          }}
        >
          <div
            style={{
              width: `${agreePct}%`,
              background: "#22c55e",
            }}
          />
          <div
            style={{
              width: `${disagreePct}%`,
              background: "#ef4444",
            }}
          />
        </div>
        <div style={{ fontSize: 12, marginTop: 4, color: "#aaa" }}>
          👍 {agree} ({agreePct}%) · 👎 {disagree} ({disagreePct}%)
        </div>
      </div>
    );
  }

  return (
    <main style={{ padding: 40, background: "#0f0f11", minHeight: "100vh" }}>
      <h1 style={{ color: "#e5e5e5" }}>Let’s Talk and Vote</h1>
      <p style={{ color: "#9ca3af" }}>
        Anonymous opinions. Quick votes. Real arguments.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >
        {posts.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#1a1a1e",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <small style={{ color: "#6b7280" }}>
              {p.category} · ID #{p.id}
            </small>
            <h3 style={{ color: "#f3f4f6", marginTop: 10 }}>{p.title}</h3>
            <p style={{ color: "#9ca3af" }}>{p.description}</p>

            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button
                onClick={() => handleVote(p.id, "agree")}
                disabled={userVotes[p.id]}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  background:
                    userVotes[p.id] === "agree" ? "#22c55e" : "#26262b",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                👍 Agree
              </button>
              <button
                onClick={() => handleVote(p.id, "disagree")}
                disabled={userVotes[p.id]}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  background:
                    userVotes[p.id] === "disagree" ? "#ef4444" : "#26262b",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                👎 Disagree
              </button>
            </div>

            {renderBar(p.id)}

            {userVotes[p.id] && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#a7f3d0",
                }}
              >
                You voted: {userVotes[p.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
