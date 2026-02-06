import posts from "../data/posts.json";

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>Let’s Talk and Vote</h1>

      {(!posts || posts.length === 0) ? (
        <p style={{ opacity: 0.8 }}>No posts yet. Add some drafts and publish.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {posts.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}
            >
              <h2 style={{ margin: "0 0 8px 0" }}>{p.title}</h2>
              {p.description && (
                <p style={{ whiteSpace: "pre-line", margin: "0 0 10px 0", opacity: 0.9 }}>
                  {p.description}
                </p>
              )}
              {p.cta && (
                <div style={{ marginTop: 10, fontWeight: 600 }}>
                  👉 {p.cta}
                </div>
              )}

              {/* Vote Buttons (Platzhalter – echte Votes kommen im nächsten Schritt) */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}>
                  👍 Agree
                </button>
                <button style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}>
                  👎 Disagree
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
