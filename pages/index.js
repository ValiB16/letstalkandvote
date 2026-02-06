import posts from "../data/posts.json";

export default function Home() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#0b0b0c", minHeight: "100vh", color: "#fff" }}>
      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px 10px" }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>Let’s Talk and Vote</h1>
        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Anonymous opinions. Quick votes. Real arguments.
        </p>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 18px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {posts.map((p) => (
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
              <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.06)" }}>
                {/* Bild optional */}
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.statement}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : null}
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      opacity: 0.9
                    }}
                  >
                    {p.category || "General"}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>ID #{p.id}</span>
                </div>

                <h2 style={{ margin: "0 0 10px 0", fontSize: 18, lineHeight: 1.25 }}>
                  {p.statement}
                </h2>

                {p.context ? (
                  <p style={{ margin: "0 0 14px 0", opacity: 0.78, fontSize: 14, lineHeight: 1.45 }}>
                    {p.context}
                  </p>
                ) : null}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                    onClick={() => alert("Vote saved (demo). Real votes next step.")}
                  >
                    👍 {p.agreeLabel || "Agree"}
                  </button>

                  <button
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                    onClick={() => alert("Vote saved (demo). Real votes next step.")}
                  >
                    👎 {p.disagreeLabel || "Disagree"}
                  </button>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
                  Comments coming next • Stay anonymous
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
