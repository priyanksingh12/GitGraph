import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const LOGS = [
  { delay: 0.2,  text: "Fetching manifest files...",           status: "done",    time: "0.82s"   },
  { delay: 1.2,  text: "Resolving transitive dependencies...", status: "done",    time: "1.45s"   },
  { delay: 2.4,  text: "Mapping dependency nodes...",          status: "active",  time: "2.13s"   },
  { delay: 3.8,  text: "Scanning vulnerabilities...",          status: "active",  time: "running" },
  { delay: 5.5,  text: "Generating AI insights...",            status: "pending", time: "running" },
];

const STATUS_STYLE = {
  done:    { dot: "bg-emerald-400",              text: "text-slate-400",  badge: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" },
  active:  { dot: "bg-cyan-400 animate-pulse",   text: "text-cyan-300",   badge: "text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"         },
  pending: { dot: "bg-slate-700",                text: "text-slate-600",  badge: "text-slate-600 bg-white/[0.03] border border-white/5"            },
};

export default function AnalyzingScreen({ repoId, onComplete }) {
  const [progress, setProgress]     = useState(5);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [scanDone, setScanDone]     = useState(false);

  /* ── SOCKET ── */
  useEffect(() => {
    if (!repoId) return;
    const socket = io(BACKEND_URL, { transports: ["websocket"] });
    socket.emit("join", repoId);
    socket.on(`scan-${repoId}`, () => setScanDone(true));
    return () => socket.disconnect();
  }, [repoId]);

  /* ── PROGRESS ── */
  useEffect(() => {
    if (scanDone) {
      setProgress(100);
      const t = setTimeout(() => onComplete?.(), 800);
      return () => clearTimeout(t);
    }
    const iv = setInterval(() => {
      setProgress(p => (p >= 90 ? 90 : p + 1));
    }, 400);
    return () => clearInterval(iv);
  }, [scanDone]);

  /* ── LOGS ── */
  useEffect(() => {
    const timers = LOGS.map((log, i) =>
      setTimeout(() => setVisibleLogs(p => [...p, i]), log.delay * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const statCards = [
    { label: "Files Scanned",  value: progress > 20 ? "12"   : "—", icon: "📄" },
    { label: "Dependencies",   value: progress > 40 ? "284"  : "—", icon: "🔗" },
    { label: "Checks Run",     value: progress > 60 ? "1.2k" : "—", icon: "🔍" },
    { label: "Vulnerabilities",value: progress > 75 ? "3"    : "—", icon: "⚠️" },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col relative overflow-hidden">

      {/* ── Grid background ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-blue-700/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Navbar ── */}
      <div className="relative z-10 border-b border-white/5 px-5 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="4"  cy="11" r="2.5" fill="#22d3ee" />
            <circle cx="18" cy="5"  r="2.5" fill="#22d3ee" opacity="0.6" />
            <circle cx="18" cy="17" r="2.5" fill="#22d3ee" opacity="0.6" />
            <line x1="6.5" y1="10" x2="15.5" y2="6"  stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.4" />
            <line x1="6.5" y1="12" x2="15.5" y2="16" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.4" />
          </svg>
          <span className="font-black text-white tracking-tight text-base">GitGraph</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-[11px] font-mono text-slate-600 tracking-widest uppercase">Analysis in progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">Live</span>
        </div>
      </div>

      {/* ── Main — fills remaining height ── */}
      <div className="relative z-10 flex-1 flex flex-col px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12 max-w-7xl mx-auto w-full">

        {/* ── Top: headline + status chip ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-400 tracking-wider">Scanning repository</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              Analyzing<br />
              <span className="text-cyan-400">Dependencies</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs sm:text-right">
            Building your dependency graph and running vulnerability checks across all packages.
          </p>
        </motion.div>

        {/* ── Progress bar section ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-end justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Overall Progress</span>
            <motion.span
              key={progress}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-black text-white tabular-nums"
            >
              {progress}<span className="text-lg text-slate-500">%</span>
            </motion.span>
          </div>

          {/* Bar */}
          <div className="relative w-full bg-[#07162f] rounded-full h-3 sm:h-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-96px", "1200px"] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 0.8 }}
            />
          </div>

          {/* Stage labels */}
          <div className="flex justify-between text-[10px] sm:text-xs text-slate-700 font-mono mt-2">
            {["Init", "Mapping", "Scanning", "AI Insights", "Done"].map(s => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10"
        >
          {statCards.map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-[#07162f] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-2"
            >
              <span className="text-xl sm:text-2xl">{icon}</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={value}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl sm:text-3xl font-black text-white tabular-nums"
                >
                  {value}
                </motion.div>
              </AnimatePresence>
              <div className="text-[11px] text-slate-600 tracking-wide uppercase font-mono">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Terminal ── fills remaining flex space ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 flex flex-col rounded-2xl border border-white/8 overflow-hidden min-h-[240px]">
            {/* Terminal title bar */}
            <div className="bg-[#07162f] border-b border-white/5 px-5 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[11px] font-mono text-slate-600">
                gitgraph — scan {repoId ? `· ${repoId.slice(0, 8)}…` : ""}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-600">running</span>
              </div>
            </div>

            {/* Log body */}
            <div className="flex-1 bg-[#030f20] p-5 sm:p-7 font-mono text-sm overflow-auto">
              {/* Prompt */}
              <p className="text-slate-600 mb-5 text-xs sm:text-sm">
                <span className="text-cyan-600">❯</span> gitgraph scan --repo {repoId || "project"} --deep --ai
              </p>

              <div className="space-y-0 divide-y divide-white/[0.04]">
                {LOGS.map((log, i) => {
                  if (!visibleLogs.includes(i)) return null;
                  const resolved = scanDone && log.status !== "done" ? "done" : log.status;
                  const s = STATUS_STYLE[resolved];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.28 }}
                      className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                      <span className={`flex-1 text-xs sm:text-sm ${s.text}`}>{log.text}</span>
                      <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg flex-shrink-0 font-mono ${s.badge}`}>
                        {log.time}
                      </span>
                    </motion.div>
                  );
                })}

                <AnimatePresence>
                  {scanDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-emerald-400 font-semibold">
                        ✓ Scan complete — loading dashboard...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Blinking cursor */}
              {!scanDone && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-4 bg-cyan-400/70 ml-4 mt-3 align-middle"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-slate-700 font-mono mt-4 text-center tracking-widest uppercase">
            Sentinel Intelligence Node • US‑EAST‑ALPHA
          </p>
        </motion.div>

      </div>
    </div>
  );
}