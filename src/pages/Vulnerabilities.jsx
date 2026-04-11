import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import API from "../api";

/* ── Full Screen Background: Secure Pipeline Data Routing (From your project) ── */
function DataStreamBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const SPACING = 40;
    const PACKET_COUNT = Math.min(Math.floor(window.innerWidth / 15), 100);

    const createPacket = () => {
       const isHorizontal = Math.random() > 0.5;
       const cols = Math.floor(canvas.width / SPACING);
       const rows = Math.floor(canvas.height / SPACING);
       const startCol = Math.floor(Math.random() * cols);
       const startRow = Math.floor(Math.random() * rows);
       
       const speeds = [1, 2, 4];
       const speed = speeds[Math.floor(Math.random() * speeds.length)];
       const dir = Math.random() > 0.5 ? 1 : -1;
       
       return {
          x: startCol * SPACING,
          y: startRow * SPACING,
          vx: isHorizontal ? speed * dir : 0,
          vy: isHorizontal ? 0 : speed * dir,
          history: [],
          maxHistory: Math.floor(Math.random() * 20 + 10),
          isCyan: Math.random() > 0.3
       };
    };

    const packets = Array.from({ length: PACKET_COUNT }, createPacket);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.floor(canvas.width / SPACING) + 1;
      const rows = Math.floor(canvas.height / SPACING) + 1;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for(let i = 0; i < cols; i++) {
         for(let j = 0; j < rows; j++) {
            ctx.fillRect(i * SPACING - 1, j * SPACING - 1, 2, 2);
         }
      }

      packets.forEach(p => {
         p.history.push({x: p.x, y: p.y});
         if(p.history.length > p.maxHistory) p.history.shift();

         p.x += p.vx;
         p.y += p.vy;

         if (p.x % SPACING === 0 && p.y % SPACING === 0) {
             if (Math.random() < 0.15) {
                 if (p.vx !== 0) {
                     p.vy = (Math.random() > 0.5 ? 1 : -1) * Math.abs(p.vx);
                     p.vx = 0;
                 } else {
                     p.vx = (Math.random() > 0.5 ? 1 : -1) * Math.abs(p.vy);
                     p.vy = 0;
                 }
             }
         }

         if (p.x < -SPACING*2 || p.x > canvas.width + SPACING*2 || p.y < -SPACING*2 || p.y > canvas.height + SPACING*2) {
             Object.assign(p, createPacket());
             p.history = [];
         }

         if(p.history.length > 1) {
             for(let i = 0; i < p.history.length - 1; i++) {
                 ctx.beginPath();
                 ctx.moveTo(p.history[i].x, p.history[i].y);
                 ctx.lineTo(p.history[i+1].x, p.history[i+1].y);
                 const opacity = i / p.history.length;
                 ctx.strokeStyle = p.isCyan 
                    ? `rgba(34, 211, 238, ${opacity * 0.45})` 
                    : `rgba(96, 165, 250, ${opacity * 0.45})`;
                 ctx.lineWidth = 1.5;
                 ctx.stroke();
             }
         }

         ctx.beginPath();
         const lastPt = p.history.length > 0 ? p.history[p.history.length-1] : { x: p.x, y: p.y };
         ctx.moveTo(lastPt.x, lastPt.y);
         ctx.lineTo(p.x, p.y);
         ctx.strokeStyle = p.isCyan ? `rgba(34, 211, 238, 1)` : `rgba(96, 165, 250, 1)`;
         ctx.lineWidth = 2;
         ctx.shadowBlur = 12;
         ctx.shadowColor = p.isCyan ? "#22d3ee" : "#60a5fa";
         ctx.stroke();
         ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.65 }}
    />
  );
}

/* ── Custom glowing badge function for severity ── */
const getSeverityBadge = (severity) => {
  const norm = (severity || "").toUpperCase();
  
  if (norm === "CRITICAL" || norm === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] sm:text-xs font-bold text-red-400 tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.15)]">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
        {norm}
      </span>
    );
  }
  if (norm === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[10px] sm:text-xs font-bold text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.15)]">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
        {norm}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] sm:text-xs font-bold text-cyan-400">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
      {norm || "LOW"}
    </span>
  );
};

const Vulnerabilities = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();

  const [vulns, setVulns] = useState([]);
  
  // Mounted state for smooth UI entry animations
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchVulns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId]);

  const fetchVulns = async () => {
    try {
      const res = await API.get(`/api/vulnerabilities/${repoId}`);
      // ✅ FIX IMPORTANT
      setVulns(res.data.vulnerabilities || res.data || []);
    } catch (err) {
      console.log("Vuln error:", err);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white p-4 sm:p-8 md:p-12 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* ── Background Data Stream Pipeline ── */}
      <DataStreamBackground />

      {/* Dynamic Immersive Background Orbs (Restored to Project Cyan/Blue Layout) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none z-0" />
      
      {/* ── Subtle Technical Grid Overlay ── */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* ── HEADER SECTION ── */}
        <div className={`mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end transition-all duration-1000 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <button
              onClick={() => navigate(-1)}
              className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
            >
              <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
              Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Report</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Identified vulnerabilities present in <span className="font-mono text-cyan-400 bg-cyan-400/10 ring-1 ring-cyan-400/20 px-2 py-0.5 rounded ml-1">{repoId}</span>
            </p>
          </div>

          {/* Quick Stat Block */}
          {vulns.length > 0 && (
            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
                <FaExclamationTriangle size={20} />
              </div>
              <div className="pr-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Found Risks</p>
                <p className="text-3xl font-black text-white leading-none">{vulns.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── SUCCESS / EMPTY STATE ── */}
        {vulns.length === 0 && (
          <div className={`transition-all duration-1000 delay-300 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-cyan-500/10 bg-cyan-500/[0.02] rounded-3xl backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.2)] mb-6">
                <FaCheckCircle size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">No Vulnerabilities Detected</h3>
              <p className="text-slate-400 max-w-md text-base leading-relaxed">
                This repository is currently secure. No known CVEs or critical risks were found in the dependency tree. Good job! 🚀
              </p>
            </div>
          </div>
        )}

        {/* ── DATA SECTION ── */}
        {vulns.length > 0 && (
          <div className={`transition-all duration-1000 delay-300 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* The Glassmorphism Table Container */}
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  
                  <thead>
                    <tr className="border-b border-white/5 bg-black/20 text-xs uppercase tracking-[0.15em] text-slate-500">
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Package Info</th>
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Severity</th>
                      <th className="px-6 py-5 font-bold w-[45%]">Description</th>
                      <th className="px-6 py-5 font-bold whitespace-nowrap">Recommended Fix</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {vulns.map((v, i) => (
                      <tr
                        key={i}
                        className="group transition-colors hover:bg-white/[0.03]"
                      >
                        {/* PACKAGE */}
                        <td className="px-6 py-5 align-top">
                          <div className="font-mono text-[15px] font-bold text-slate-200 transition-colors group-hover:text-cyan-400">
                            {v.package}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded bg-[#020617] px-2 py-1 text-[11px] font-mono font-medium text-slate-400 ring-1 ring-white/10">
                              v{v.version}
                            </span>
                          </div>
                        </td>

                        {/* SEVERITY */}
                        <td className="px-6 py-5 align-top">
                          {getSeverityBadge(v.severity)}
                        </td>

                        {/* DESCRIPTION */}
                        <td className="px-6 py-5 align-top">
                          <div className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-200 transition-colors">
                            {v.description}
                          </div>
                        </td>

                        {/* FIX */}
                        <td className="px-6 py-5 align-top">
                          <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-2 rounded-lg border border-cyan-400/20">
                            <span className="font-mono text-xs">{v.fix || "Update Package"}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Vulnerabilities;
