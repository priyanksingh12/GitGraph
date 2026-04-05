import { useEffect, useState, useRef } from "react";

import { useNavigate, useParams,useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import AnalyzingScreen from "./AnalyzingScreen"

import SeverityBarGraph from "../components/SeverityBarGraph";
import {
  getCurrentUser,
  getGithubRepos,
  addRepo,
  getDashboard,
} from "../api";

import API from "../api";
import socket from "../socket";
import ReportButton from "../components/ReportButton";
import FetchReposScreen from "../components/Fetchreposcreen";
import SelectRepoScreen from "../components/Selectreposcreen";


/* ================= SOCKET (FIXED) ================= */


const Dashboard = () => {
  const navigate = useNavigate();
  const { repoId: urlRepoId } = useParams();

  const [user, setUser] = useState(null);
 
  const [repos, setRepos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [topVulns, setTopVulns] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(urlRepoId || null);

  const [loading, setLoading] = useState(true);
  const [reposLoaded, setReposLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
const [allVulns, setAllVulns] = useState([]);
const [graphVersion, setGraphVersion] = useState(0);
const [vulnsLoaded, setVulnsLoaded] = useState(false); // ✅ NEW

  const intervalRef = useRef(null);
  const currentVersionRef = useRef(null);

const location = useLocation();

       const redirectUrl = `${window.location.origin}/dashboard`;

  /* ================= INIT ================= */
  useEffect(() => {
    

    fetchUser();

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  /* ================= URL LOAD ================= */
useEffect(() => {
  if (!urlRepoId) return;

  console.log("🔥 Loading repo from URL:", urlRepoId);

  setSelectedRepoId(urlRepoId);

}, [urlRepoId]);

  /* ================= AUTO FETCH REPOS ================= */
  useEffect(() => {
    if (
      user?.githubUsername &&
      user?.installationId &&
      !reposLoaded &&
      !selectedRepoId
    ) {
      console.log("🚀 Auto fetching repos...");
      fetchRepos();
    }
  }, [user]);

useEffect(() => {
  if (!selectedRepoId) return;

  setVulnsLoaded(false);   // ✅
  setDashboardData(null);  // ✅
  setIsAnalyzing(true);    // ✅

  const loadInitial = async () => {
    try {
      const res = await getDashboard(selectedRepoId);
      const data = res?.data;

      if (data?.repo?.status === "scanned") {
        updateDashboard(data);
        fetchTopVulnerabilities(selectedRepoId);
      }
    } catch (err) {
      console.log("Initial load error");
    }
  };

  loadInitial();
  listenForScan(selectedRepoId);

}, [selectedRepoId]);


 useEffect(() => {
  if (location.search.includes("installation_id")) {
    console.log("🔥 Detected installation, refreshing user...");

    const handleInstall = async () => {
      await fetchUser();

      // ✅ REDIRECT TO DASHBOARD
      navigate("/dashboard");
    };

    handleInstall();
  }
}, [location]);


// Only stop analyzing when BOTH dashboardData AND vulns are ready
useEffect(() => {
  if (dashboardData?.repo && vulnsLoaded) {
    setIsAnalyzing(false);
  }
}, [dashboardData, vulnsLoaded]);

  /* ================= USER ================= */
  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      console.log("✅ USER:", res.data);
      setUser(res?.data?.user);
    } catch (err) {
      console.log("❌ User fetch failed", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REPOS ================= */
  const fetchRepos = async () => {
    try {
      if (!user?.installationId) {
        console.log("❌ Installation missing → cannot fetch repos");
        return;
      }

      console.log("🚀 Fetching repos for:", user.githubUsername);

      const res = await getGithubRepos();

      console.log("✅ Repo response:", res.data);

      setRepos(res?.data?.repositories || []);
      setReposLoaded(true);
    } catch (err) {
      console.log("❌ Repo fetch failed:", err.response?.data || err.message);
    }
  };

 const fetchTopVulnerabilities = async (repoId) => {
  try {
    const res = await API.get(`/api/vulnerabilities/${repoId}`);

    const vulns = res.data.vulnerabilities || res.data || [];

    setTopVulns(vulns.slice(0, 3)); // existing
    setAllVulns(vulns); // 🔥 ADD THIS
  } catch (err) {
    console.log("Top vuln error:", err);
  } finally {
    setVulnsLoaded(true); // ✅ Mark vulns as loaded regardless of success/error
  }
};

  /* ================= SCAN ================= */
  const listenForScan = (repoId) => {
    if (!socket) return;

     if (currentVersionRef.current === null) {
  currentVersionRef.current = 0;
}

    socket.emit("joinRepoRoom", repoId);

const eventName = `scan-${repoId}`;
console.log("🎧 Listening event:", eventName);

socket.off(eventName);

const handler = (data) => {
  console.log("🔥 SOCKET UPDATE RECEIVED", data);

  if (data.repo?.status === "scanned") {
    console.log("✅ FINAL SOCKET DATA RECEIVED");

    updateDashboard(data);

    setGraphVersion(prev => prev + 1);
    fetchTopVulnerabilities(repoId);

    currentVersionRef.current = data.repo?.scanCount;

    // ✅ REMOVED setIsAnalyzing(false) — now handled by useEffect

    clearInterval(intervalRef.current);
  }
};

socket.on(eventName, handler);

    clearInterval(intervalRef.current);

   intervalRef.current = setInterval(async () => {
  try {
    const res = await getDashboard(repoId);
    const data = res?.data;

    if (!data) return;

    if (data.repo.status === "scanned") {
      console.log("✅ FINAL POLLING DATA RECEIVED");

      updateDashboard(data);

      currentVersionRef.current = data.repo.scanCount;

      setGraphVersion(prev => prev + 1);
      fetchTopVulnerabilities(repoId);

      // ✅ REMOVED setIsAnalyzing(false) — now handled by useEffect

      clearInterval(intervalRef.current);
    }

  } catch {
    console.log("Polling error");
  }
}, 3000);
  };

  /* ================= UPDATE ================= */
  const updateDashboard = (data) => {
    setDashboardData({
      repo: data.repo,
      riskScore: data.stats?.riskScore ?? 0,
      dependencies: data.stats?.dependencies ?? 0,
      vulnerabilities: data.stats?.vulnerabilities ?? 0,
      aiInsights: data.aiInsights || [],
    });
  };

  /* ================= ADD REPO ================= */
  const handleAddRepo = async (repo) => {
    try {
      setIsAnalyzing(true);
      setDashboardData(null);
      

      const res = await addRepo({ url: repo.html_url });
      const repoId = res?.data?.repo?._id;

      setSelectedRepoId(repoId);
      navigate(`/dashboard/${repoId}`);

      setTimeout(() => listenForScan(repoId), 500);
    } catch (err) {
      console.log("❌ Add repo error:", err.response?.data || err.message);
      setIsAnalyzing(false);
    }
  };

  /* ================= RESCAN ================= */
  const handleRescan = () => {
    if (!selectedRepoId) return;
    setIsAnalyzing(true);
    listenForScan(selectedRepoId);
  };

  /* ================= BACK ================= */
  const handleBack = () => {
    clearInterval(intervalRef.current);
    setSelectedRepoId(null);
    setDashboardData(null);
    navigate("/dashboard");
  };

  

  /* ================= STATES ================= */

 if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white relative overflow-hidden">

      {/* Animated canvas */}
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

      {/* Content card */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 text-center px-10 py-12 max-w-sm w-full"
        style={{
          background: "rgba(7,22,47,0.72)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(34,211,238,0.12)",
          borderRadius: "24px",
          boxShadow: "0 0 0 1px rgba(34,211,238,0.05), 0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Cyan top accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: "100px", height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.7), transparent)",
          }}
        />

        {/* Spinner */}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full bg-cyan-400"
              style={{ animation: "gpulse 1.5s ease-in-out infinite" }}
            />
          </div>
        </div>

        {/* Text */}
        <div>
          <h1 className="text-xl font-semibold text-white tracking-wide">
            Loading...
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Fetching your workspace
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-full h-[2px] rounded-full overflow-hidden bg-slate-800">
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
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes gpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
        @keyframes slide  { 0%{transform:translateX(-200%)} 100%{transform:translateX(600%)} }
      `}</style>
    </div>
  );
  
// CONNECT GITHUB

if (!user?.githubUsername) {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white px-6 relative overflow-hidden">

      {/* ── Animated background canvas ── */}
      <canvas
        ref={(canvas) => {
          if (!canvas || canvas._initialized) return;
          canvas._initialized = true;

          const ctx = canvas.getContext("2d");
          let animId;

          const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
          };
          resize();
          window.addEventListener("resize", resize);

          const NODE_COUNT   = 55;
          const CONNECT_DIST = 140;

          const nodes = Array.from({ length: NODE_COUNT }, () => ({
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.38,
            vy: (Math.random() - 0.5) * 0.38,
            r:  Math.random() * 2 + 1,
            highlight: Math.random() < 0.14,
            phase: Math.random() * Math.PI * 2,
          }));

          const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const t = performance.now() / 1000;

            nodes.forEach(n => {
              n.x += n.vx;
              n.y += n.vy;
              if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
              if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });

            for (let i = 0; i < nodes.length; i++) {
              for (let j = i + 1; j < nodes.length; j++) {
                const dx   = nodes[i].x - nodes[j].x;
                const dy   = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                  const fade      = 1 - dist / CONNECT_DIST;
                  const isSpecial = nodes[i].highlight || nodes[j].highlight;
                  ctx.beginPath();
                  ctx.moveTo(nodes[i].x, nodes[i].y);
                  ctx.lineTo(nodes[j].x, nodes[j].y);
                  ctx.strokeStyle = isSpecial
                    ? `rgba(34,211,238,${fade * 0.5})`
                    : `rgba(96,165,250,${fade * 0.18})`;
                  ctx.lineWidth = isSpecial ? 0.85 : 0.5;
                  ctx.stroke();
                }
              }
            }

            nodes.forEach(n => {
              const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + n.phase);
              if (n.highlight) {
                /* glow halo */
                const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7);
                g.addColorStop(0, `rgba(34,211,238,${0.2 * pulse})`);
                g.addColorStop(1, "rgba(34,211,238,0)");
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 7, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();
                /* core */
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + pulse * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(34,211,238,${0.7 + pulse * 0.3})`;
                ctx.fill();
              } else {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96,165,250,${0.28 + pulse * 0.1})`;
                ctx.fill();
              }
            });

            animId = requestAnimationFrame(draw);
          };

          draw();

          /* cleanup when element is removed */
          new MutationObserver(() => {
            if (!document.contains(canvas)) {
              cancelAnimationFrame(animId);
              window.removeEventListener("resize", resize);
            }
          }).observe(document.body, { childList: true, subtree: true });
        }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* ── Radial vignette — darkens edges, focuses centre ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, #020817 100%)",
        }}
      />

      {/* ── Top-left decorative glow blob ── */}
      <div
        className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full pointer-events-none z-[1]"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)" }}
      />
      {/* ── Bottom-right glow blob ── */}
      <div
        className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none z-[1]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
      />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-xl w-full text-center"
        style={{
          background: "rgba(7,22,47,0.75)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(34,211,238,0.12)",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 0 0 1px rgba(34,211,238,0.05), 0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* thin cyan top accent bar */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: "120px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.7), transparent)",
          }}
        />

        {/* ICON */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex justify-center mb-5"
        >
          <div
            className="flex items-center justify-center w-20 h-20 rounded-2xl"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.2)",
              boxShadow: "0 0 32px rgba(34,211,238,0.12)",
            }}
          >
            <FaGithub className="text-5xl text-cyan-400" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold mb-3">
          Connect your GitHub
        </h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Securely link your GitHub account to start analyzing repositories,
          detect vulnerabilities, and generate AI insights.
        </p>

        {/* feature pills */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {["Repo analysis", "Vulnerability scan", "AI insights"].map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "rgba(34,211,238,0.08)",
                border: "1px solid rgba(34,211,238,0.15)",
                color: "rgba(34,211,238,0.8)",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            window.location.href =
              `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
          }}
          className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-3 rounded-xl transition w-full flex items-center justify-center gap-2 text-base"
          style={{ boxShadow: "0 0 24px rgba(34,211,238,0.25)" }}
        >
          <FaGithub />
          Connect GitHub
        </motion.button>

        <p className="text-xs text-gray-500 mt-4">
          OAuth powered • Secure connection
        </p>
      </motion.div>
    </div>
  );
}
  // INSTALL APP
  
  if (!user?.installationId)
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-[#07162f] rounded-3xl p-10 text-center shadow-2xl border border-yellow-500/10"
      >
        {/* ICON */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex justify-center mb-4"
        >
          <FaGithub className="text-6xl text-yellow-400" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3">
          Install GitHub App
        </h1>

        <p className="text-gray-400 mb-6">
          Install our GitHub App to allow secure access to your repositories
          for dependency analysis and vulnerability detection.
        </p>


<motion.a
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  href={`https://github.com/apps/GraphGuardians/installations/new?redirect_uri=${redirectUrl}`}
  className="block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-xl transition w-full"
>
  ⚡ Install App on GitHub
</motion.a>

        <p className="text-xs text-gray-500 mt-4">
          Choose repositories you want to analyze
        </p>
      </motion.div>
    </div>
  );

  // FETCH REPOS
if (!reposLoaded && !selectedRepoId)
  return <FetchReposScreen onFetch={fetchRepos} />;

  // SELECT REPO
if (!selectedRepoId)
  return <SelectRepoScreen repos={repos} onSelect={handleAddRepo} />;

// ANALYZING
if (isAnalyzing || !dashboardData?.repo)
  return (
    <AnalyzingScreen
      repoId={selectedRepoId}
      onComplete={() => {}}  // ✅ do nothing — Dashboard's own useEffect handles it
    />
  );
  

  /* ================= FINAL UI ================= */
return (
  <div className="min-h-screen bg-[#080c18] text-[#f0f4ff] flex font-sans">

    {/* ================= SIDEBAR ================= */}
    <aside className="hidden md:flex flex-col w-[260px] bg-[#0d1225] border-r border-[#1a2240] p-6 justify-between">

      <div>
        <h1 className="text-2xl font-semibold mb-10 tracking-wide">⚡ Sentinel</h1>

        <nav className="space-y-3 text-[15px]">

          <div className="p-3 rounded-lg bg-[#121938] border-l-4 border-[#00cdd4] cursor-pointer">
            Dashboard
          </div>

          <div onClick={() => navigate(`/vulnerabilities/${selectedRepoId}`)} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Vulnerabilities
          </div>

          <div onClick={() => navigate(`/chain/${selectedRepoId}`)} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Chain Graph
          </div>

          <div onClick={() => navigate(`/comparison/${selectedRepoId}`)} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Comparison
          </div>

          <div onClick={handleRescan} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Rescan
          </div>

        
        </nav>
      </div>

      <div className="border-t border-[#1a2240] pt-4">
        <p className="text-base">{user?.githubUsername}</p>
        <p className="text-sm text-[#6b7fa3]">Developer</p>
      </div>
    </aside>

    {/* ================= MAIN ================= */}
    <div className="flex-1 flex flex-col overflow-x-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-12 py-8 border-b border-[#1a2240]">
        <h1 className="text-4xl font-semibold tracking-wide">
          Security Overview
        </h1>

        <button
          onClick={handleBack}
         className="px-6 py-2.5 rounded-xl 
bg-gradient-to-r from-[#00cdd4]/10 to-[#3b82f6]/10 
text-[#00cdd4] 
border border-[#00cdd4]/30 
hover:from-[#00cdd4]/20 hover:to-[#3b82f6]/20 
hover:scale-105 transition-all duration-300 
shadow-sm hover:shadow-[#00cdd4]/20"
        >
          ← Back
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-12 space-y-14">

        {/* HERO STATS */}
        <div className="grid md:grid-cols-3 gap-10">

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#b400d4]">
            <p className="text-5xl font-bold">{dashboardData.riskScore}</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Risk Score</p>
          </div>

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#ff4560]">
            <p className="text-5xl font-bold">{dashboardData.vulnerabilities}</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Vulnerabilities</p>
          </div>

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#ff9f43]">
            <p className="text-5xl font-bold">{dashboardData.dependencies}</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Dependencies</p>
          </div>

        

        </div>

        {/* NETWORK MAP */}
        <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
          <h2 className="text-2xl mb-8 font-semibold">Network Map</h2>

          <div className="w-full h-[480px]">

           <SeverityBarGraph
  key={graphVersion}
  vulnerabilities={allVulns}
/>


          </div>
        </div>

        {/* VULNS + ALERTS */}
        <div className="grid md:grid-cols-4 gap-8">

          <div className="md:col-span-3 bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
            <h2 className="text-3xl mb-8 font-semibold">Recent Vulnerabilities</h2>

            <div className="space-y-6">
              {topVulns.map((v, i) => (
                <div key={i} className="flex justify-between items-center h-[64px] border-b border-[#1a2240]">

                  <span className="text-lg font-medium">
                    CVE-{i + 1234}
                  </span>

                  <span className="text-[#6b7fa3] text-base w-[280px] truncate">
                    {v.fix}
                  </span>

                  <span className={`text-lg font-semibold ${
                    v.severity === "HIGH"
                      ? "text-red-400"
                      : v.severity === "MEDIUM"
                      ? "text-orange-400"
                      : "text-yellow-400"
                  }`}>
                    {v.severity}
                  </span>

                </div>
              ))}
            </div>
          </div>

          {/* ALERTS */}
          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] flex flex-col justify-center items-center">
            <p className="text-6xl font-bold text-red-400">{dashboardData.vulnerabilities}</p>
            <p className="text-[#6b7fa3] mt-3 text-lg">Alerts</p>
          </div>

        </div>

        {/* TOP EXPOSURES (FIXED LOGIC) */}
        <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
          <h2 className="text-2xl mb-8 font-semibold">Top Exposures</h2>

          <div className="space-y-6">
            {topVulns.map((v, i) => {

              const width =
                v.severity === "HIGH"
                  ? 90
                  : v.severity === "MEDIUM"
                  ? 60
                  : 30;

              return (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-base">
                    <span>{v.package}</span>
                    <span>{v.severity}</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#1a2240] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        background:
                          "linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444)"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
{/* AI */}
        <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
          <h2 className="text-2xl mb-6 font-semibold"> AI Insights</h2>

          {(() => {
            const raw = dashboardData?.aiInsights?.[0];
            if (!raw) return <p className="text-[#6b7fa3] text-sm">No AI insights available.</p>;

            let insights = raw;
            if (typeof raw === "string") {
              try { insights = JSON.parse(raw); } catch { 
                return <p className="text-[#6b7fa3] text-sm">{raw}</p>; 
              }
            }

            return (
              <div>
                <p className="text-gray-300 text-sm mb-3">{insights.summary}</p>

                {insights.topAction && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-300 text-sm mb-3">
                    ⚡ <strong>Top Action:</strong> {insights.topAction}
                  </div>
                )}

                {insights.issues?.slice(0, 3).map((issue, i) => (
                  <div key={i} className="border border-white/10 rounded-lg p-3 mb-2">
                    <div className="flex justify-between">
                      <span className="text-cyan-400 font-mono text-sm">{issue.package}</span>
                      <span className="text-xs text-gray-400">{issue.risk}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{issue.explanation}</p>
                    <code className="text-green-400 text-xs">{issue.fix}</code>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* 🔥 PREMIUM BUTTONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <button onClick={() => navigate(`/chain/${selectedRepoId}`)} className="py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 hover:scale-105 transition">
            Chain Graph
          </button>

          <button onClick={() => navigate(`/comparison/${selectedRepoId}`)} className="py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 hover:scale-105 transition">
            Comparison
          </button>

          <button onClick={handleRescan}  className="py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 hover:scale-105 transition">
            Rescan
          </button>


  <ReportButton repoId={selectedRepoId} />


        </div>

      </div>
    </div>
  </div>
);
};

export default Dashboard;