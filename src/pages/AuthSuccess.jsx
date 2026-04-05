import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("🚀 AuthSuccess started");

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        console.log("🔑 Token from URL:", token);

        // ❌ No token → login
        if (!token) {
          console.error("❌ No token received");
          navigate("/login", { replace: true });
          return;
        }

        // 🧹 Clean old data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ✅ Save token
        localStorage.setItem("token", token);
        console.log("✅ TOKEN SAVED");

        /* =========================
           🔥 VERIFY USER (IMPORTANT FIX)
        ========================= */
        const res = await getCurrentUser();
        const user = res?.data?.user;

        console.log("👤 User fetched:", user);

        if (!user) {
          throw new Error("User fetch failed");
        }

        // ✅ Save user
        localStorage.setItem("user", JSON.stringify(user));

        console.log("✅ USER SAVED");

        /* =========================
           🚀 REDIRECT
        ========================= */
        navigate("/dashboard", { replace: true });

      } catch (err) {
        console.error("❌ Auth success error:", err?.response?.data || err.message);

        // 🧹 Cleanup
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white relative overflow-hidden">

      {/* Animated canvas background */}
      <canvas
        ref={(canvas) => {
          if (!canvas || canvas._initialized) return;
          canvas._initialized = true;
          const ctx = canvas.getContext("2d");
          let animId;
          const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
          resize();
          window.addEventListener("resize", resize);
          const NODE_COUNT = 50, CONNECT_DIST = 130;
          const nodes = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 2 + 1, highlight: Math.random() < 0.13, phase: Math.random() * Math.PI * 2,
          }));
          const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const t = performance.now() / 1000;
            nodes.forEach(n => {
              n.x += n.vx; n.y += n.vy;
              if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
              if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });
            for (let i = 0; i < nodes.length; i++)
              for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < CONNECT_DIST) {
                  const fade = 1 - dist / CONNECT_DIST;
                  const sp = nodes[i].highlight || nodes[j].highlight;
                  ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
                  ctx.strokeStyle = sp ? `rgba(34,211,238,${fade*0.5})` : `rgba(96,165,250,${fade*0.18})`;
                  ctx.lineWidth = sp ? 0.85 : 0.5; ctx.stroke();
                }
              }
            nodes.forEach(n => {
              const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + n.phase);
              if (n.highlight) {
                const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7);
                g.addColorStop(0, `rgba(34,211,238,${0.2*pulse})`); g.addColorStop(1, "rgba(34,211,238,0)");
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r*7, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill();
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r + pulse*0.7, 0, Math.PI*2);
                ctx.fillStyle = `rgba(34,211,238,${0.7+pulse*0.3})`; ctx.fill();
              } else {
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
                ctx.fillStyle = `rgba(96,165,250,${0.28+pulse*0.1})`; ctx.fill();
              }
            });
            animId = requestAnimationFrame(draw);
          };
          draw();
          new MutationObserver(() => {
            if (!document.contains(canvas)) { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); }
          }).observe(document.body, { childList: true, subtree: true });
        }}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.55 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 65% 65% at 50% 50%, transparent 20%, #020817 100%)" }} />

      {/* Glow blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" }} />

      {/* Spinner + text */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Spinning arc */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "rgba(34,211,238,0.9)",
              borderRightColor: "rgba(34,211,238,0.3)",
              animation: "spin 1s linear infinite",
            }}
          />
          {/* inner pulse dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full bg-cyan-400"
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-semibold text-white tracking-wide">Loading...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching your workspace</p>
        </div>

        {/* animated bar */}
        <div className="w-48 h-[2px] rounded-full overflow-hidden bg-slate-800">
          <div
            className="h-full rounded-full"
            style={{
              width: "40%",
              background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.8), transparent)",
              animation: "slide 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
        @keyframes slide { 0%{transform:translateX(-200%)} 100%{transform:translateX(600%)} }
      `}</style>
    </div>
  );
};

export default AuthSuccess;