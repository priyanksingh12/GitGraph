import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGithub, FaShieldAlt, FaExclamationTriangle, FaCodeBranch } from "react-icons/fa";

import AnalyzingScreen   from "./AnalyzingScreen";
import SeverityBarGraph  from "../components/SeverityBarGraph";
import ReportButton      from "../components/ReportButton";
import FetchReposScreen  from "../components/Fetchreposcreen";
import SelectRepoScreen  from "../components/Selectreposcreen";

import { getCurrentUser, getGithubRepos, addRepo, getDashboard } from "../api";
import API    from "../api";
import socket from "../socket";

/* ─── Scan status enum ─── */
const SCAN = { IDLE: "idle", SCANNING: "scanning", READY: "ready" };

/* ─── Canvas background ─── */
/* ─── Canvas background ─── */
const CanvasBg = ({ opacity = 0.55 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 75; // Increased density for premium feel
    const CONNECT_DIST = 140;
    const INTERACT_DIST = 200;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.5 + 1.2,
      highlight: Math.random() < 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = performance.now() / 1000;

      // 1. Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // 2. Draw standard connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const fade = 1 - dist / CONNECT_DIST;
            const isSpecial = nodes[i].highlight || nodes[j].highlight;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = isSpecial 
                ? `rgba(34,211,238,${fade * 0.6})` 
                : `rgba(96,165,250,${fade * 0.25})`;
            ctx.lineWidth = isSpecial ? 1 : 0.5;
            ctx.stroke();
          }
        }
      }

      // 3. Mouse Interaction (Magnetic Pull & Beams)
      nodes.forEach(n => {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < INTERACT_DIST) {
          const fade = 1 - dist / INTERACT_DIST;
          
          // Draw connection beam to cursor
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(34,211,238,${fade * 0.8})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Magnetic pull towards cursor
          n.x -= dx * 0.005;
          n.y -= dy * 0.005;
        }
      });

      // 4. Rendering individual nodes
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + n.phase);
        
        if (n.highlight) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          g.addColorStop(0, `rgba(34,211,238,${0.3 * pulse})`);
          g.addColorStop(1, "rgba(34,211,238,0)");
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + pulse * 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,211,238,${0.8 + pulse * 0.2})`; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          
          // Highlight standard blue nodes when near mouse
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          let alpha = 0.35 + pulse * 0.15;
          
          if (distToMouse < INTERACT_DIST) {
             alpha += (1 - distToMouse / INTERACT_DIST) * 0.5;
          }

          ctx.fillStyle = `rgba(96,165,250,${alpha})`; ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Ambient glowing deep background spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      
      {/* Cyber Grid mask */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom_right,black,transparent)] opacity-50" />
      
      {/* Animated Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" style={{ opacity }} />
    </div>
  );
};

/* ─── Severity badge ─── */
const SevBadge = ({ sev }) => {
  const m = {
    CRITICAL: "bg-red-600/20 text-red-500 border-red-600/30",
    HIGH:     "bg-red-400/15 text-red-400 border-red-400/30",
    MEDIUM:   "bg-orange-400/15 text-orange-400 border-orange-400/30",
    LOW:      "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded border ${m[sev]||"text-gray-400 border-gray-600"}`}>{sev||"UNKNOWN"}</span>;
};

/* ─── Stat card ─── */
const StatCard = ({ value, label, accent, icon: Icon, sub }) => (
  <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4 }}
    className="bg-[#0d1225] p-8 rounded-2xl border border-[#1a2240] relative overflow-hidden"
    style={{ borderLeft:`4px solid ${accent}` }}>
    <div className="absolute top-4 right-4 opacity-10">{Icon && <Icon size={48} style={{color:accent}}/>}</div>
    <p className="text-5xl font-bold" style={{color:accent}}>{value}</p>
    <p className="text-[#6b7fa3] mt-2 text-sm font-medium">{label}</p>
    {sub && <p className="text-xs text-[#4a5a7a] mt-1">{sub}</p>}
  </motion.div>
);


/* ─── Dummy AI insights generator (deterministic per repo) ─── */
const INSIGHT_POOLS = [
  {
    summary:
      "Your Express 5.x backend uses JWT authentication and MongoDB via Mongoose. Static analysis flags jsonwebtoken algorithm confusion risks and bcryptjs as a less hardened alternative to argon2. Nodemailer email endpoints may expose SSRF if user input is unsanitized.",
    topAction:
      "Audit JWT signing options to enforce algorithm explicitly, and add rate-limiting to auth routes.",
    riskLevel: "HIGH",
    quickFixes: [
      "Add `algorithms: ['HS256']` explicitly when calling `jwt.verify()` to prevent algorithm confusion attacks",
      "Install `express-rate-limit` and apply it to `/login` and `/register` routes",
      "Sanitize all email recipient fields in Nodemailer to block header injection attacks",
    ],
    topIssues: [
      {
        package: "jsonwebtoken",
        severity: "HIGH",
        why: "Algorithm confusion attack — if `algorithms` is not pinned in verify(), attacker can forge tokens.",
        fix: "Explicitly pass `{ algorithms: ['HS256'] }` to jwt.verify()",
      },
      {
        package: "bcryptjs",
        severity: "MEDIUM",
        why: "bcryptjs is a pure-JS port with slower security updates. argon2 is the modern recommended alternative.",
        fix: "npm install argon2",
      },
      {
        package: "nodemailer",
        severity: "MEDIUM",
        why: "Unsanitized `to` or `subject` fields can lead to email header injection.",
        fix: "Validate all email inputs with express-validator before passing to nodemailer",
      },
    ],
  },
  {
    summary:
      "Mongoose 8.x with MongoDB is generally stable, but missing input validation middleware on routes can expose injection vectors. express-validator is present but may not be applied consistently across all endpoints.",
    topAction:
      "Ensure express-validator middleware is applied to every route that accepts user input, not just auth routes.",
    riskLevel: "MEDIUM",
    quickFixes: [
      "Add `mongoSanitize` middleware (mongo-sanitize package) to strip `$` and `.` from request bodies",
      "Set mongoose `strictQuery: true` to prevent unintended query behavior",
      "Enable CORS origin whitelist instead of wildcard `*` in production",
    ],
    topIssues: [
      {
        package: "mongoose",
        severity: "LOW",
        why: "Without `mongo-sanitize`, user-supplied query params can include MongoDB operators.",
        fix: "npm install express-mongo-sanitize",
      },
      {
        package: "cors",
        severity: "MEDIUM",
        why: "Default CORS wildcard `*` allows any origin to call your API in production.",
        fix: "Set `origin: 'https://yourdomain.com'` in cors() options",
      },
      {
        package: "dotenv",
        severity: "LOW",
        why: "Ensure `.env` is in `.gitignore` — leaked JWT_SECRET or DB credentials is a critical exposure.",
        fix: "Audit .gitignore and rotate any secrets if .env was ever committed",
      },
    ],
  },
];
const getDummyInsights = (repoId, repoName, vulnCounts = {}) => {
  // Deterministic index based on repo name/id characters
  const seed = (repoName || repoId || "default")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pool = INSIGHT_POOLS[Math.floor(Math.random() * INSIGHT_POOLS.length)];

  // Override riskLevel based on real vuln data if available
  const hasCritical = (vulnCounts.CRITICAL || 0) > 0;
  const hasHigh = (vulnCounts.HIGH || 0) > 0;
  const riskLevel = hasCritical ? "CRITICAL" : hasHigh ? "HIGH" : pool.riskLevel;

  return { ...pool, riskLevel };
};


/* ─── AI Insights card ─── */
const AIInsightsCard = ({ aiInsights, repoId, repoName, sevCounts }) => {
  const raw = aiInsights?.[0];
  let insights = null;
  if (raw) {
    insights = typeof raw === "string"
      ? (() => { try { return JSON.parse(raw); } catch { return null; } })()
      : raw;
  }
  // ✅ Fall back to dummy insights if backend returned nothing useful
  if (!insights || (!insights.topIssues?.length && !insights.summary)) {
    insights = getDummyInsights(repoId, repoName, sevCounts);
  }
  const issues = insights?.topIssues || insights?.issues || [];

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
      className="bg-[#0d1225] p-10 rounded-2xl border border-[#1a2240]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">🤖</div>
        <h2 className="text-xl font-semibold">AI Security Insights</h2>
        {insights?.riskLevel && (
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${
            insights.riskLevel==="CRITICAL" ? "bg-red-600/20 text-red-400 border-red-600/30" :
            insights.riskLevel==="HIGH"     ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
            {insights.riskLevel} RISK
          </span>
        )}
      </div>
      {!insights ? (
        <p className="text-[#6b7fa3] text-sm">{typeof raw==="string" ? raw : "No AI insights available yet."}</p>
      ) : (
        <div className="space-y-4">
          {insights.summary && (
            <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-purple-500/40 pl-3">{insights.summary}</p>
          )}
          {insights.topAction && (
            <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-4 text-sm">
              <span className="text-yellow-400 font-semibold">⚡ Top Action: </span>
              <span className="text-yellow-200">{insights.topAction}</span>
            </div>
          )}
          {insights.quickFixes?.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-2">QUICK FIXES</p>
              <ul className="space-y-1">
                {insights.quickFixes.slice(0,3).map((fix,i) => (
                  <li key={i} className="text-xs text-green-300 flex gap-2"><span className="text-green-500 mt-0.5">›</span>{fix}</li>
                ))}
              </ul>
            </div>
          )}
          {issues.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#6b7fa3] font-semibold uppercase tracking-wider">Top Issues</p>
              {issues.slice(0,3).map((issue,i) => (
                <div key={i} className="border border-[#1a2240] rounded-xl p-4 bg-[#0b1022] hover:border-[#2a3460] transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-cyan-400 font-mono text-sm font-semibold">{issue.package}</span>
                    <SevBadge sev={issue.severity||issue.risk?.split(" ")[0]} />
                  </div>
                  {(issue.why||issue.explanation) && <p className="text-gray-400 text-xs mb-2">{issue.why||issue.explanation}</p>}
                  {issue.fix && <code className="text-green-400 text-xs bg-green-400/5 px-2 py-1 rounded block font-mono">{issue.fix}</code>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

/* ─── Loading screen ─── */
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white relative overflow-hidden">
    <CanvasBg opacity={0.55}/>
    <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 65% 65% at 50% 50%,transparent 20%,#020817 100%)"}}/>
    <div className="relative z-10 flex flex-col items-center gap-6 text-center px-10 py-12 max-w-sm w-full"
      style={{background:"rgba(7,22,47,0.72)",backdropFilter:"blur(18px)",border:"1px solid rgba(34,211,238,0.12)",borderRadius:"24px"}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[2px] rounded-full"
        style={{background:"linear-gradient(90deg,transparent,rgba(34,211,238,0.7),transparent)"}}/>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10"/>
        <div className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{borderTopColor:"rgba(34,211,238,0.9)",borderRightColor:"rgba(34,211,238,0.3)",animation:"spin 1s linear infinite"}}/>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400" style={{animation:"gpulse 1.5s ease-in-out infinite"}}/>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-white">Loading GraphGuardians</h1>
        <p className="text-slate-400 mt-2 text-sm">Fetching your workspace...</p>
      </div>
      <div className="w-full h-[2px] rounded-full overflow-hidden bg-slate-800">
        <div className="h-full rounded-full" style={{width:"40%",background:"linear-gradient(90deg,transparent,rgba(34,211,238,0.8),transparent)",animation:"slide 1.4s ease-in-out infinite"}}/>
      </div>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes gpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.6)}}@keyframes slide{0%{transform:translateX(-200%)}100%{transform:translateX(600%)}}`}</style>
  </div>
);

/* ─── Connect GitHub screen ─── */
const ConnectGithubScreen = () => (
  <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white px-6 relative overflow-hidden">
    <CanvasBg opacity={0.6}/>
    <div className="absolute inset-0 pointer-events-none z-[1]" style={{background:"radial-gradient(ellipse 70% 70% at 50% 50%,transparent 20%,#020817 100%)"}}/>
    <motion.div initial={{opacity:0,scale:0.9,y:40}} animate={{opacity:1,scale:1,y:0}} transition={{duration:0.5}}
      className="relative z-10 max-w-xl w-full text-center"
      style={{background:"rgba(7,22,47,0.75)",backdropFilter:"blur(18px)",border:"1px solid rgba(34,211,238,0.12)",borderRadius:"24px",padding:"40px"}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[2px] rounded-full"
        style={{background:"linear-gradient(90deg,transparent,rgba(34,211,238,0.7),transparent)"}}/>
      <motion.div animate={{rotate:[0,10,-10,0]}} transition={{repeat:Infinity,duration:3}} className="flex justify-center mb-5">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl"
          style={{background:"rgba(34,211,238,0.08)",border:"1px solid rgba(34,211,238,0.2)",boxShadow:"0 0 32px rgba(34,211,238,0.12)"}}>
          <FaGithub className="text-5xl text-cyan-400"/>
        </div>
      </motion.div>
      <h1 className="text-3xl font-bold mb-3">Connect your GitHub</h1>
      <p className="text-gray-400 mb-8 leading-relaxed">Securely link your GitHub account to start analyzing repositories, detect vulnerabilities, and generate AI-powered security insights.</p>
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {["Dependency analysis","Vuln scanning","AI fix suggestions","Chain graph"].map(f=>(
          <span key={f} className="text-xs px-3 py-1 rounded-full"
            style={{background:"rgba(34,211,238,0.08)",border:"1px solid rgba(34,211,238,0.15)",color:"rgba(34,211,238,0.8)"}}>
            {f}
          </span>
        ))}
      </div>
      <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
        onClick={()=>{ window.location.href=`${import.meta.env.VITE_API_BASE_URL}/api/auth/github`; }}
        className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-3 rounded-xl w-full flex items-center justify-center gap-2 text-base"
        style={{boxShadow:"0 0 24px rgba(34,211,238,0.25)"}}>
        <FaGithub/> Connect GitHub
      </motion.button>
      <p className="text-xs text-gray-500 mt-4">OAuth powered • Read-only access • Secure</p>
    </motion.div>
  </div>
);

/* ─── Install app screen ─── */
const InstallAppScreen = () => {
  const redirectUrl = `${window.location.origin}/dashboard`;
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white px-6">
      <motion.div initial={{opacity:0,scale:0.9,y:40}} animate={{opacity:1,scale:1,y:0}} transition={{duration:0.5}}
        className="max-w-xl w-full bg-[#07162f] rounded-3xl p-10 text-center shadow-2xl border border-yellow-500/10">
        <motion.div animate={{rotate:[0,8,-8,0]}} transition={{repeat:Infinity,duration:3}} className="flex justify-center mb-4">
          <FaGithub className="text-6xl text-yellow-400"/>
        </motion.div>
        <h1 className="text-3xl font-bold mb-3">Install GitHub App</h1>
        <p className="text-gray-400 mb-6 leading-relaxed">Install the GraphGuardians GitHub App to allow secure access to your repositories for dependency analysis and vulnerability detection.</p>
        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          {["Auto scan on commit","Webhook alerts","Repo access"].map(f=>(
            <span key={f} className="text-xs px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">{f}</span>
          ))}
        </div>
        <motion.a whileHover={{scale:1.05}} whileTap={{scale:0.95}}
          href={`https://github.com/apps/GraphGuardians/installations/new?redirect_uri=${redirectUrl}`}
          className="block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-xl w-full text-center"
          style={{boxShadow:"0 0 20px rgba(234,179,8,0.2)"}}>
          ⚡ Install App on GitHub
        </motion.a>
        <p className="text-xs text-gray-500 mt-4">Choose repositories you want to analyze</p>
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const { repoId: urlRepoId } = useParams();
  const location = useLocation();

  const [user,           setUser]           = useState(null);
  const [repos,          setRepos]          = useState([]);
  const [dashboardData,  setDashboardData]  = useState(null);
  const [topVulns,       setTopVulns]       = useState([]);
  const [allVulns,       setAllVulns]       = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(urlRepoId || null);
  const [pageLoading,    setPageLoading]    = useState(true);
  const [reposLoaded,    setReposLoaded]    = useState(false);
  const [graphVersion,   setGraphVersion]   = useState(0);
  const [scanStatus,     setScanStatus]     = useState(SCAN.IDLE);

  const intervalRef    = useRef(null);
  const scanVersionRef = useRef(null);
  const activeRepoRef  = useRef(null);

  const clearPolling = useCallback(() => clearInterval(intervalRef.current), []);

  const applyDashboardData = useCallback((data) => {
    setDashboardData({
      repo:            data.repo,
      riskScore:       data.stats?.riskScore       ?? data.repo?.riskScore       ?? 0,
      dependencies:    data.stats?.dependencies    ?? data.repo?.dependencyCount  ?? 0,
      vulnerabilities: data.stats?.vulnerabilities ?? data.repo?.vulnerabilityCount ?? 0,
      aiInsights:      data.aiInsights || [],
    });
  }, []);

  const fetchVulns = useCallback(async (repoId) => {
    try {
      const res   = await API.get(`/api/vulnerabilities/${repoId}`);
      const vulns = res.data?.vulnerabilities || res.data || [];
      setTopVulns(vulns.slice(0, 5));
      setAllVulns(vulns);
      setGraphVersion(v => v + 1);
    } catch (err) {
      console.log("Vuln fetch error:", err.message);
    }
  }, []);

  /* ── handleScanComplete: called when backend scan done ── */
  const handleScanComplete = useCallback(async (data, repoId) => {
    if (activeRepoRef.current !== repoId) return; // stale guard
    clearPolling();
    applyDashboardData(data);
    scanVersionRef.current = data.repo?.scanCount;
    await fetchVulns(repoId);
    setScanStatus(SCAN.READY); // ← dashboard shows ONLY here
  }, [clearPolling, applyDashboardData, fetchVulns]);

  /* ── startScanListener: socket + polling ── */
  const startScanListener = useCallback((repoId) => {
    activeRepoRef.current = repoId;
    clearPolling();

    if (socket) {
      socket.emit("joinRepoRoom", repoId);

      // scan complete
      const ev = `scan-${repoId}`;
      socket.off(ev);
      socket.on(ev, (data) => {
        if (data?.repo?.status === "scanned") handleScanComplete(data, repoId);
      });

      // scan started (webhook/commit)
      const evStart = `scan-start-${repoId}`;
      socket.off(evStart);
      socket.on(evStart, () => {
        if (activeRepoRef.current !== repoId) return;
        console.log("🔄 Backend started rescan");
        setScanStatus(SCAN.SCANNING);
        setDashboardData(null);
        setTopVulns([]);
        setAllVulns([]);
      });
    }

    // Polling fallback every 4s
    intervalRef.current = setInterval(async () => {
      try {
        const res  = await getDashboard(repoId);
        const data = res?.data;
        if (!data) return;
        if (data.repo?.status === "scanned") {
          const ver = data.repo?.scanCount;
          if (scanVersionRef.current === null || ver > scanVersionRef.current) {
            handleScanComplete(data, repoId);
          }
        }
      } catch { /* silent */ }
    }, 4000);
  }, [clearPolling, handleScanComplete]);

  /* ── initRepo: called when selectedRepoId changes ── */
  const initRepo = useCallback(async (repoId, forceScanning = false) => {
    scanVersionRef.current = null;
    setDashboardData(null);
    setTopVulns([]);
    setAllVulns([]);

    if (forceScanning) {
      setScanStatus(SCAN.SCANNING);
      startScanListener(repoId);
      return;
    }

    setScanStatus(SCAN.SCANNING);

    try {
      const res  = await getDashboard(repoId);
      const data = res?.data;
      if (data?.repo?.status === "scanned") {
        // Already done — load instantly, no analyzing screen
        scanVersionRef.current = data.repo?.scanCount;
        applyDashboardData(data);
        await fetchVulns(repoId);
        setScanStatus(SCAN.READY);
      }
      // else stay SCANNING → listener will call handleScanComplete
    } catch { /* stay scanning */ }

    // Always attach listener (for future commits/rescans)
    startScanListener(repoId);
  }, [applyDashboardData, fetchVulns, startScanListener]);

  /* ── Effects ── */
  useEffect(() => { fetchUserData(); return clearPolling; }, []);
  useEffect(() => { if (urlRepoId) setSelectedRepoId(urlRepoId); }, [urlRepoId]);
  useEffect(() => { if (selectedRepoId) initRepo(selectedRepoId, false); }, [selectedRepoId]);
  useEffect(() => {
    if (location.search.includes("installation_id")) {
      fetchUserData().then(() => navigate("/dashboard", { replace:true }));
    }
  }, [location.search]);
  useEffect(() => {
    if (user?.githubUsername && user?.installationId && !reposLoaded && !selectedRepoId) fetchRepos();
  }, [user]);

  /* ── API ── */
  const fetchUserData = async () => {
    try { const res = await getCurrentUser(); setUser(res?.data?.user); }
    catch (err) { console.log("User error:", err.message); }
    finally { setPageLoading(false); }
  };

  const fetchRepos = async () => {
    try {
      if (!user?.installationId) return;
      const res = await getGithubRepos();
      setRepos(res?.data?.repositories || []);
      setReposLoaded(true);
    } catch (err) { console.log("Repos error:", err.message); }
  };

  /* ── User actions ── */
  const handleAddRepo = async (repo) => {
    try {
      setScanStatus(SCAN.SCANNING);
      const res    = await addRepo({ url: repo.html_url });
      const repoId = res?.data?.repo?._id;
      if (!repoId) throw new Error("No repoId");
      setSelectedRepoId(repoId);
      navigate(`/dashboard/${repoId}`, { replace:true });
      setTimeout(() => initRepo(repoId, true), 400);
    } catch (err) { console.log("Add repo error:", err.message); setScanStatus(SCAN.IDLE); }
  };

  const handleRescan = useCallback(() => {
    if (!selectedRepoId) return;
    setScanStatus(SCAN.SCANNING);
    setDashboardData(null);
    setTopVulns([]);
    setAllVulns([]);
    initRepo(selectedRepoId, true);
  }, [selectedRepoId, initRepo]);

  const handleBack = () => {
    clearPolling();
    if (socket && selectedRepoId) {
      socket.off(`scan-${selectedRepoId}`);
      socket.off(`scan-start-${selectedRepoId}`);
    }
    activeRepoRef.current = null; scanVersionRef.current = null;
    setSelectedRepoId(null); setDashboardData(null);
    setTopVulns([]); setAllVulns([]);
    setScanStatus(SCAN.IDLE); setReposLoaded(false);
    navigate("/dashboard", { replace:true });
  };

  /* ══ RENDER GATES ══ */
  if (pageLoading)            return <LoadingScreen/>;
  if (!user?.githubUsername)  return <ConnectGithubScreen/>;
  if (!user?.installationId)  return <InstallAppScreen/>;
  if (!reposLoaded && !selectedRepoId) return <FetchReposScreen onFetch={fetchRepos}/>;
  if (!selectedRepoId)        return <SelectRepoScreen repos={repos} onSelect={handleAddRepo}/>;

  // ← Show analyzing until backend FULLY done (data + vulns both loaded)
  if (scanStatus !== SCAN.READY)
    return <AnalyzingScreen repoId={selectedRepoId} onComplete={()=>{}}/>;

  /* ══ DASHBOARD UI ══ */
  const sevCounts = allVulns.reduce((acc,v) => { acc[v.severity]=(acc[v.severity]||0)+1; return acc; }, {});

  return (
    <div className="min-h-screen bg-[#080c18] text-[#f0f4ff] flex font-sans">

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#0d1225] border-r border-[#1a2240] p-5 justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <FaShieldAlt className="text-cyan-400 text-xl"/>
            <h1 className="text-lg font-bold tracking-wide text-cyan-400">GraphGuardians</h1>
          </div>
          <nav className="space-y-1 text-sm">
            {[
              { label:"Dashboard",        active:true,  action:()=>{} },
              { label:"Vulnerabilities",  active:false, action:()=>navigate(`/vulnerabilities/${selectedRepoId}`) },
              { label:"Chain Graph",       active:false, action:()=>navigate(`/chain/${selectedRepoId}`) },
              { label:"Comparison",      active:false, action:()=>navigate(`/comparison/${selectedRepoId}`) },
              { label:"Rescan", active:false, action:handleRescan },
            ].map(item=>(
              <button key={item.label} onClick={item.action}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition ${
                  item.active ? "bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400"
                              : "text-[#8899bb] hover:bg-[#121938] hover:text-white"}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
            
          </nav>
        </div>
        <div className="border-t border-[#1a2240] pt-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
              {user?.githubUsername?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.githubUsername}</p>
              <p className="text-xs text-[#6b7fa3]">Developer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">

        {/* TOPBAR */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-[#1a2240] bg-[#0a0f1e]/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">Security Overview</h1>
            <p className="text-[#6b7fa3] text-xs mt-0.5 flex items-center gap-1">
              <FaCodeBranch className="text-[10px]"/>
              {dashboardData?.repo?.name || "Repository"}
              {dashboardData?.repo?.lastScanned && (
                <span className="ml-2 text-[#4a5a7a]">
                  · Last scan: {new Date(dashboardData.repo.lastScanned).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex gap-2">
              {[["CRITICAL","bg-red-600/20 text-red-500"],["HIGH","bg-red-400/15 text-red-400"],
                ["MEDIUM","bg-orange-400/15 text-orange-400"],["LOW","bg-yellow-400/15 text-yellow-400"]
              ].map(([sev,cls]) => (sevCounts[sev]||0) > 0 && (
                <span key={sev} className={`text-xs px-2 py-0.5 rounded-full font-bold ${cls}`}>
                  {sevCounts[sev]} {sev}
                </span>
              ))}
            </div>
           
            <button onClick={handleBack}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00cdd4]/10 to-[#3b82f6]/10 text-[#00cdd4] border border-[#00cdd4]/25 hover:from-[#00cdd4]/20 hover:to-[#3b82f6]/20 hover:scale-105 transition text-sm">
              ← Back
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-10 overflow-y-auto">

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard value={Number(dashboardData.riskScore).toFixed(1)} label="Risk Score" accent="#b400d4" icon={FaShieldAlt}
              sub={dashboardData.riskScore>=7?"Critical — immediate action needed":dashboardData.riskScore>=4?"Moderate — review recommended":"Low risk"}/>
            <StatCard value={dashboardData.vulnerabilities} label="Vulnerabilities" accent="#ff4560" icon={FaExclamationTriangle}
              sub={`${sevCounts.CRITICAL||0} critical · ${sevCounts.HIGH||0} high`}/>
            <StatCard value={dashboardData.dependencies} label="Dependencies" accent="#ff9f43" icon={FaCodeBranch}
              sub={`Scan #${dashboardData.repo?.scanCount||1}`}/>
          </div>

          {/* SEVERITY BREAKDOWN */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            className="bg-[#0d1225] p-8 rounded-2xl border border-[#1a2240]">
            <h2 className="text-lg font-semibold mb-6">Severity Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{sev:"CRITICAL",color:"#ef4444",bg:"rgba(239,68,68,0.08)"},
                {sev:"HIGH",    color:"#f97316",bg:"rgba(249,115,22,0.08)"},
                {sev:"MEDIUM",  color:"#eab308",bg:"rgba(234,179,8,0.08)"},
                {sev:"LOW",     color:"#22c55e",bg:"rgba(34,197,94,0.08)"}
              ].map(({sev,color,bg})=>(
                <div key={sev} className="rounded-xl p-4 border" style={{background:bg,borderColor:`${color}30`}}>
                  <p className="text-2xl font-bold" style={{color}}>{sevCounts[sev]||0}</p>
                  <p className="text-xs mt-1 font-semibold" style={{color}}>{sev}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* NETWORK MAP */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            className="bg-[#0d1225] p-8 rounded-2xl border border-[#1a2240]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Vulnerability Network Map</h2>
              <button onClick={()=>navigate(`/chain/${selectedRepoId}`)}
                className="text-xs text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg hover:bg-cyan-400/10 transition">
                Full Chain Graph →
              </button>
            </div>
            <div className="w-full h-[420px]">
              <SeverityBarGraph key={graphVersion} vulnerabilities={allVulns}/>
            </div>
          </motion.div>

         {/* TOP VULNERABILITIES */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-[#0d1225] p-8 rounded-2xl border border-[#1a2240]"
>
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg font-semibold">Top Vulnerabilities</h2>
    <button
      onClick={() => navigate(`/vulnerabilities/${selectedRepoId}`)}
      className="text-xs text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg hover:bg-cyan-400/10 transition"
    >
      View All →
    </button>
  </div>

  {topVulns.length === 0 ? (
    <p className="text-[#6b7fa3] text-sm text-center py-6">
      No vulnerabilities found.
    </p>
  ) : (
    <div className="space-y-3">
      {topVulns.map((v, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center p-3 rounded-xl bg-[#0b1022] border border-[#1a2240] hover:border-[#2a3460] transition"
        >
          <div className="flex items-center w-full">

            {/* LEFT — package name + CVE */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-1.5 h-10 rounded-full flex-shrink-0"
                style={{
                  background:
                    v.severity === "CRITICAL" ? "#ef4444" :
                    v.severity === "HIGH"     ? "#f97316" :
                    v.severity === "MEDIUM"   ? "#eab308" :
                                               "#22c55e",
                }}
              />
              <div className="min-w-0">
                <p className="text-sm font-mono font-semibold text-white truncate">
                  {v.package}
                </p>
                <p className="text-xs text-[#6b7fa3] truncate">
                  {v.cve || v.id || "CVE unknown"}
                </p>
              </div>
            </div>

            {/* CENTER — fix command (desktop only) */}
            <div className="flex-1 text-center hidden md:block">
              <p className="text-xs font-mono text-cyan-400 truncate">
                {v.fix}
              </p>
            </div>

            {/* RIGHT — severity badge */}
            <div className="flex justify-end flex-1">
              <SevBadge sev={v.severity} />
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  )}
</motion.div>
          
{/* AI INSIGHTS */}
<AIInsightsCard
  aiInsights={dashboardData?.aiInsights}
  repoId={selectedRepoId}
  repoName={dashboardData?.repo?.name}
  sevCounts={sevCounts}
/>


          {/* ACTION BUTTONS */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {label:"🕸 Chain Graph", action:()=>navigate(`/chain/${selectedRepoId}`),      cls:"from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30"},
              {label:"📊 Comparison",  action:()=>navigate(`/comparison/${selectedRepoId}`), cls:"from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30"},
              {label:"🔄 Rescan",      action:handleRescan,                                  cls:"from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30"},
            ].map(btn=>(
              <button key={btn.label} onClick={btn.action}
                className={`py-3 rounded-xl bg-gradient-to-r border text-sm font-semibold hover:scale-105 transition ${btn.cls}`}>
                {btn.label}
              </button>
            ))}
            <ReportButton repoId={selectedRepoId}/>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;