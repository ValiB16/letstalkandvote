import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import posts from "../data/posts.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// sichere, build-freundliche anonyme ID
function getVoterId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("ltav_voter_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("ltav_voter_id", id);
  }
  return id;
}

export default function Home() {
  const [voteData, setVoteData] = useState({});
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = JSON.parse(localStorage.getItem("ltav_votes") || "{}");
    setUserVotes(saved);
    loadVotes();
  }, []);

  async function loadVotes() {
    const { data, error } = await supabase
      .from("votes")
      .select("post_id, choice");

    if (error) {
      console.error(error);
      return;
    }

    const grouped = {};
    data.forEach((v) => {
      if (!grouped[v.post_id]) grouped[v.post_id] = { agree: 0, disagree: 0 };
      grouped[v.post_id][v.choice]++;
    });

    setVoteData(grouped);
  }

  async function handleVote(postId, choice) {
    if (userVotes[postId]) return;

    const voterId = getVoterId();
    if (!voterId) return;

    const { error } = await supabase.from("votes").upsert(
      {
        post_id: postId,
        voter_id: voterId,
        choice,
      },
      { onConflict: "post_id,voter_id" }
    );

    if (error) {
      console.error(error);
      return;
    }

    const updated = { ...userVotes, [postId]: choice };
    localStorage.setItem("ltav_votes", JSON.stringify(updated));
    setUserVotes(updated);
    loadVotes();
  }

  function VoteBar({ postId }) {
    const agree = voteData[postId]?.agree || 0;
    const disagree = voteData[postId]?.disagree || 0;
    const total = agree + disagree;

    const agreePct = total ? Math.round((agree / total) * 100) : 0;
    const disagreePct = total ? 100 - agreePct : 0;

    return (
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            height: 18,
            borderRadius: 999,
            overflow: "hidden",
            background: "#222",
            display: "flex",
          }}
        >
          <div style={{ width: `${agreePct}%`, background: "#22c55e" }} />
          <div style={{ width: `${disagreePct}%`, background: "#ef4444" }} />
        </div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
          👍 {agree} ({agreePct}%) · 👎 {disagree} ({disagreePct}%)
        </div>
      </div>
    );
  }

  return (
    <main style={{ padding: 40, background: "#0f0f11", minHeight: "100vh", color: "#fff" }}>
      <h1>Let’s Talk and Vote</h1>
      <p style={{ opacity: 0.7 }}>
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
        {posts.map((p) => {
          const voted = userVotes[p.id];

          return (
            <div
              key={p.id}
              style={{
                background: "#1a1a1e",
                padding: 20,
                borderRadius: 14,
              }}
            >
              <small style={{ opacity: 0.6 }}>
                {p.category} · ID #{p.id}
              </small>

              <h3 style={{ marginTop: 10 }}>{p.statement}</h3>
              <p style={{ opacity: 0.8 }}>{p.context}</p>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={() => handleVote(p.id, "agree")}
                  disabled={!!voted}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    background: voted === "agree" ? "#22c55e" : "#26262b",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  👍 Agree
                </button>

                <button
                  onClick={() => handleVote(p.id, "disagree")}
                  disabled={!!voted}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    background: voted === "disagree" ? "#ef4444" : "#26262b",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  👎 Disagree
                </button>
              </div>

              <VoteBar postId={p.id} />

              {voted && (
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                  You voted: {voted}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
