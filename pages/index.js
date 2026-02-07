import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import posts from "../data/posts.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function getVoterId() {
  if (typeof window === "undefined") return "server";
  const key = "ltav_voter_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = (crypto?.randomUUID?.() || `v_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    localStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const [voteData, setVoteData] = useState({}); // {postId: {agree, disagree}}
  const [userVotes, setUserVotes] = useState({}); // {postId: "agree"|"disagree"}

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ltav_votes") || "{}");
    setUserVotes(saved);
    loadVotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadVotes() {
    const { data, error } = await supabase.from("votes").select("post_id, choice");
    if (error) {
      console.error("loadVotes error:", error.message);
      return;
    }

    const grouped = {};
    for (const v of (data || [])) {
      if (!grouped[v.post_id]) grouped[v.post_id] = { agree: 0, disagree: 0 };
      if (v.choice === "agree") grouped[v.post_id].agree += 1;
      if (v.choice === "disagree") grouped[v.post_id].disagree += 1;
    }
    setVoteData(grouped);
  }

  async function handleVote(postId, choice) {
    // optional: nicht erneut voten
    if (userVotes[postId]) return;

    const voterId = getVoterId();

    const { error } = await supabase.from("votes").upsert(
      { post_id: postId, voter_id: voterId, choice },
      { onConflict: "post_id,voter_id" }
    );

    if (error) {
      console.error("vote error:", error.message);
      alert("Vote failed. Please try again.");
      return;
    }

    const updated = { ...userVotes, [postId]: choice };
    localStorage.setItem("ltav_votes", JSON.stringify(updated));
    setUserVotes(updated);

    await loadVotes();
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
            position: "relative",
            height: 18,
            borderRadius: 999,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)"
          }}
        >
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: `${agreePct}%`, background: "#22c55e" }} />
            <div style={{ width: `${disagreePct}%`, background: "#ef4444" }} />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              fontSize: 12,
              fontWeight: 800,
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)"
            }}
          >
            <span>👍 {agree} ({agreePct}%)</span>
            <span>👎 {disagree} ({disagreePct}%)</span>
          </div>
        </div>

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
          Total votes: {total}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#0b0b0c", minHeight: "100vh", color: "#fff" }}>
      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px 10px" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Let’s Talk and Vote</h1>
        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Anonymous opinions. Quick votes. Real arguments.
        </p>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 18px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {posts.map((p) => {
            const voted = userVotes[p.id]; // "agree"|"disagree"|undefined

            return (
              <article
                key={p.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
                }}
              >
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
                      {p.category || "General"}
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.6 }}>ID #{p.id}</span>
                  </div>

                  <h2 style={{ margin: "0 0 10px 0", fontSize: 18, lineHeight: 1.25 }}>
                    {p.statement}
                  </h2>

                  {p.context ? (
                    <p style={{ margin: "0 0 8px 0", opacity: 0.78, fontSize: 14, lineHeight: 1.45 }}>
                      {p.context}
                    </p>
                  ) : null}

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button
                      onClick={() => handleVote(p.id, "agree")}
                      disabled={!!voted}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: voted === "agree" ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.06)",
                        color: "#fff",
                        cursor: voted ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        opacity: voted && voted !== "agree" ? 0.65 : 1
                      }}
                    >
                      👍 Agree
                    </button>

                    <button
                      onClick={() => handleVote(p.id, "disagree")}
                      disabled={!!voted}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: voted === "disagree" ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)",
                        color: "#fff",
                        cursor: voted ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        opacity: voted && voted !== "disagree" ? 0.65 : 1
                      }}
                    >
                      👎 Disagree
                    </button>
                  </div>

                  <VoteBar postId={p.id} />

                  {voted ? (
                    <div
                      style={{
                        marginTop: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: voted === "agree" ? "#16a34a" : "#dc2626",
                        fontSize: 12,
                        fontWeight: 900
                      }}
                    >
                      You voted: {voted === "agree" ? "Agree" : "Disagree"}
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
                      Vote to see your badge.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
