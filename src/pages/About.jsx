import { useState, useEffect, useRef } from "react";

const NODE_COUNT = 28;

function GraphBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 1,
      severity: ["#ef4444", "#f97316", "#22c55e", "#3b82f6"][
        Math.floor(Math.random() * 4)
      ],
    }));

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - dist / 160)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.severity + "99";
        ctx.shadowColor = n.severity;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.55,
      }}
    />
  );
}

function SeverityBadge({ level, color, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        borderRadius: "8px",
        background: color + "15",
        border: `1px solid ${color}40`,
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 8px ${color}`,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span style={{ color, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {level}
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "32px 28px",
        transition: `opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        backdropFilter: "blur(12px)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#f1f5f9",
          marginBottom: "10px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.88rem",
          color: "#94a3b8",
          lineHeight: 1.65,
        }}
      >
        {desc}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: "🔗",
    title: "Dependency Chain Graph",
    desc: "Visualises the full chain of dependencies that introduce each vulnerability — powered by TigerGraph's native graph engine for deep traversal.",
  },
  {
    icon: "🎯",
    title: "Severity Breakdown",
    desc: "Every vulnerability is scored and plotted on an interactive severity graph. Critical, High, Medium, Low — all in one glance.",
  },
  {
    icon: "📋",
    title: "Clean Report Page",
    desc: "A structured, human-readable report listing each CVE, its affected package, and an actionable fix so your team knows exactly what to patch.",
  },
  {
    icon: "⚡",
    title: "Commit-level Live Updates",
    desc: "Every push to your repo triggers a fresh analysis. The dashboard re-renders automatically so you're never looking at stale data.",
  },
  {
    icon: "🐯",
    title: "TigerGraph Backend",
    desc: "Graph relationships between packages are stored and queried natively in TigerGraph, making multi-hop dependency resolution blazing fast.",
  },
  {
    icon: "🛡️",
    title: "Actionable Fixes",
    desc: "GitGraph doesn't just flag issues — it suggests version upgrades and patches so you can resolve vulnerabilities without guesswork.",
  },
];

export default function About() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <style>{`
       

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.7; }
          70%  { transform: scale(1.12); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#060c18",
          color: "#e2e8f0",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <GraphBackground />

        {/* Gradient overlays */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* NAV */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 48px",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(6,12,24,0.7)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.3rem" }}>⬡</span>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: "-0.04em",
                color: "#f8fafc",
              }}
            >
              GitGraph
            </span>
          </div>
          <button
            onClick={() => window.history.go(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "border-color 0.2s, color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.color = "#f1f5f9";
              e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            ← Back
          </button>
        </nav>

        {/* HERO */}
        <section
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "120px 24px 80px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "100px",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              color: "#93c5fd",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "40px",
              animation: loaded ? "fadeUp 0.6s ease both" : "none",
              animationDelay: "0ms",
              opacity: loaded ? undefined : 0,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#3b82f6",
                boxShadow: "0 0 6px #3b82f6",
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
            Powered by TigerGraph
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3rem, 7vw, 6rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: "#f8fafc",
              maxWidth: "860px",
              animation: loaded ? "fadeUp 0.7s ease both" : "none",
              animationDelay: "80ms",
              opacity: loaded ? undefined : 0,
            }}
          >
            Every vulnerability
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #ef4444 0%, #f97316 40%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              traced to the root.
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              color: "#64748b",
              maxWidth: "540px",
              lineHeight: 1.7,
              marginTop: "28px",
              animation: loaded ? "fadeUp 0.7s ease both" : "none",
              animationDelay: "160ms",
              opacity: loaded ? undefined : 0,
            }}
          >
            GitGraph scans your repository, maps the dependency graph that introduces each
            CVE, scores severity, and delivers a clean fix-ready report — automatically on
            every commit.
          </p>

          {/* Severity pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "44px",
              flexWrap: "wrap",
              justifyContent: "center",
              animation: loaded ? "fadeUp 0.7s ease both" : "none",
              animationDelay: "240ms",
              opacity: loaded ? undefined : 0,
            }}
          >
            <SeverityBadge level="Critical" color="#ef4444" />
            <SeverityBadge level="High" color="#f97316" />
            <SeverityBadge level="Medium" color="#eab308" />
            <SeverityBadge level="Low" color="#22c55e" />
          </div>

          {/* CTA buttons */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "48px",
              animation: loaded ? "fadeUp 0.7s ease both" : "none",
              animationDelay: "320ms",
              opacity: loaded ? undefined : 0,
            }}
          >
            <button
              style={{
                padding: "13px 32px",
                borderRadius: "10px",
                background: "#3b82f6",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "0.92rem",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 0 24px rgba(59,130,246,0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              View Dashboard →
            </button>
            <button
              style={{
                padding: "13px 32px",
                borderRadius: "10px",
                background: "transparent",
                color: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "0.92rem",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "border-color 0.2s, color 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Read the Docs
            </button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          style={{
            position: "relative",
            zIndex: 2,
            padding: "100px 24px",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.72rem",
                color: "#3b82f6",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              How it works
            </p>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "-0.03em",
                color: "#f1f5f9",
              }}
            >
              One repo. Total visibility.
            </h2>
          </div>

          {/* Steps */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              position: "relative",
            }}
          >
            {[
              {
                num: "01",
                title: "Connect your repository",
                desc: "Link any GitHub repository. GitGraph hooks into your commit history and starts parsing dependencies immediately.",
              },
              {
                num: "02",
                title: "Graph construction via TigerGraph",
                desc: "Dependencies are modelled as nodes and edges in TigerGraph. Multi-hop traversal identifies which packages ultimately introduce each CVE.",
              },
              {
                num: "03",
                title: "Severity scoring & visualisation",
                desc: "Each vulnerability is assigned a CVSS-based severity. The dashboard renders a live chain graph and severity breakdown chart.",
              },
              {
                num: "04",
                title: "Get your fix report",
                desc: "A clean, exportable report lists every vulnerability with its chain path, severity, and recommended version fix.",
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "32px",
                  padding: "36px 0",
                  borderBottom:
                    i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.72rem",
                    color: "#334155",
                    letterSpacing: "0.06em",
                    minWidth: "36px",
                    paddingTop: "4px",
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "#e2e8f0",
                      marginBottom: "8px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.9rem",
                      color: "#64748b",
                      lineHeight: 1.65,
                      maxWidth: "560px",
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES GRID */}
        <section
          style={{
            position: "relative",
            zIndex: 2,
            padding: "80px 24px 120px",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.72rem",
                color: "#3b82f6",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              Features
            </p>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "-0.03em",
                color: "#f1f5f9",
              }}
            >
              Everything you need to ship safely.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: "20px",
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 80} />
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            position: "relative",
            zIndex: 2,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1rem" }}>⬡</span>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.04em",
                color: "#475569",
              }}
            >
              GitGraph
            </span>
          </div>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              color: "#334155",
              letterSpacing: "0.06em",
            }}
          >
            Built with TigerGraph · Vulnerability analysis at graph speed
          </p>
        </footer>
      </div>
    </>
  );
}