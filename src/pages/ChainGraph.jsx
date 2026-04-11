import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import API from "../api";
import Background from "../components/BackgroundCanvas";

/* ═══════════════════════════════════════════════
   SEVERITY CONFIG
═══════════════════════════════════════════════ */
const SEV = {
  CRITICAL: { color: "#ff2d55", glow: "rgba(255,45,85,0.45)",   label: "CRITICAL", order: 0, pulse: true  },
  HIGH:     { color: "#ff9f0a", glow: "rgba(255,159,10,0.38)",  label: "HIGH",     order: 1, pulse: true  },
  MEDIUM:   { color: "#ffd60a", glow: "rgba(255,214,10,0.32)",  label: "MEDIUM",   order: 2, pulse: false },
  LOW:      { color: "#30d158", glow: "rgba(48,209,88,0.28)",   label: "LOW",      order: 3, pulse: false },
};

/* ═══════════════════════════════════════════════
   NORMALIZE — "pkg/node_modules/ms" → "ms"
═══════════════════════════════════════════════ */
const normalizeName = (raw) => {
  if (!raw) return "";
  const parts = raw.split("node_modules/");
  return parts[parts.length - 1].replace(/\/$/, "").toLowerCase().trim();
};

/* ═══════════════════════════════════════════════
   BUILD CHAINS — fixed traversal with normalized IDs
═══════════════════════════════════════════════ */
function buildChains(rawNodes, rawEdges) {
  const nodeMap = {};
  
  // BOTH original and normalized IDs store karo
  rawNodes.forEach(n => {
    nodeMap[n.id] = n;
    const norm = normalizeName(n.id);
    if (norm) nodeMap[norm] = { ...n, id: norm, label: n.label || norm };
  });

  const rev = {}; // to → [from]

  const addRev = (from, to) => {
    // BOTH original + normalized versions store karo
    const keys = [to, normalizeName(to)].filter(Boolean);
    const val  = normalizeName(from) || from;
    keys.forEach(k => {
      if (!rev[k]) rev[k] = new Set();
      rev[k].add(val);
    });
  };

  rawEdges.forEach(e => {
    const from = e.from_id || e.from;
    const to   = e.to_id   || e.to;
    if (!from || !to || from === to) return;
    addRev(from, to);
  });

  // Sets → Arrays
  Object.keys(rev).forEach(k => (rev[k] = [...rev[k]]));

  const vulnNodes = rawNodes.filter(n =>
    n.type === "vulnerability" ||
    rawEdges.some(e => (e.to_id || e.to) === n.id && e.to_type === "Vulnerability")
  );

  const chains = [];
  const MAX_DEPTH = 25;

  vulnNodes.forEach(vuln => {
    const vulnId   = vuln.id;
    const vulnNorm = normalizeName(vulnId) || vulnId;

    const trace = (id, path, depth) => {
      if (depth > MAX_DEPTH) return;
      
      // BOTH original + normalized check karo
      const norm    = normalizeName(id) || id;
      const parents = [
        ...(rev[id]   || []),
        ...(rev[norm] || []),
      ];
      const uniqueParents = [...new Set(parents)];

      if (uniqueParents.length === 0) {
        if (path.length >= 2) chains.push([...path].reverse());
        return;
      }

      uniqueParents.forEach(p => {
        const pNorm = normalizeName(p) || p;
        // Cycle check — both forms check karo
        if (!path.includes(p) && !path.includes(pNorm)) {
          trace(pNorm, [...path, pNorm], depth + 1);
        }
      });
    };

    trace(vulnNorm, [vulnNorm], 0);
  });

  // Dedup + sort (same as before)
  const seen   = new Set();
  const unique = chains.filter(c => {
    const key = c.join("→");
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  return unique.sort((a, b) => {
    const getOrder = c => {
      const id   = c[c.length - 1];
      const node = nodeMap[id] || nodeMap[normalizeName(id)];
      return SEV[node?.severity]?.order ?? 9;
    };
    const diff = getOrder(a) - getOrder(b);
    return diff !== 0 ? diff : b.length - a.length;
  });
}

/* ═══════════════════════════════════════════════
   CHAIN → GRAPH DATA
═══════════════════════════════════════════════ */
function chainToGraph(chain, nodeMap) {
  const nodes = chain.map((id, i) => {
    const norm = normalizeName(id);
    const raw  = nodeMap[id] || nodeMap[norm] || {};
    const isVuln = raw.type === "vulnerability";
    const sev    = raw.severity;
    const cfg    = SEV[sev];
    return {
      id, label: raw.label || norm || id,
      isVuln, severity: sev || null,
      color: isVuln ? (cfg?.color || "#30d158") : "#6366f1",
      glow:  isVuln ? (cfg?.glow  || "rgba(48,209,88,0.3)") : "rgba(99,102,241,0.25)",
      pulse: isVuln && (cfg?.pulse ?? false),
      depth: i,
    };
  });
  const links = [];
  for (let i = 0; i < chain.length - 1; i++)
    links.push({ source: chain[i], target: chain[i + 1], idx: i });
  return { nodes, links };
}

/* ═══════════════════════════════════════════════
   SEVERITY BADGE
═══════════════════════════════════════════════ */
const SevBadge = ({ sev, size = "sm" }) => {
  const c   = SEV[sev] || SEV.LOW;
  const fs  = size === "lg" ? 13 : 10;
  const pad = size === "lg" ? "3px 12px" : "2px 7px";
  return (
    <span style={{
      background:   c.color + "18",
      color:        c.color,
      border:       `1px solid ${c.color}55`,
      borderRadius: 5,
      fontSize:     fs,
      fontWeight:   800,
      padding:      pad,
      letterSpacing: 1.5,
      fontFamily:   "'JetBrains Mono', monospace",
    }}>
      {c.label}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED SCAN LINE (pure CSS via style tag)
═══════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    

    @keyframes pulseRing {
      0%   { transform: scale(1);   opacity: 0.8; }
      70%  { transform: scale(2.2); opacity: 0;   }
      100% { transform: scale(2.2); opacity: 0;   }
    }
    @keyframes scanline {
      0%   { top: -4px; }
      100% { top: 100%; }
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes fadeSlideLeft {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0);     }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0;  }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 12px currentColor; }
      50%       { box-shadow: 0 0 28px currentColor; }
    }
    @keyframes gridScroll {
      0%   { background-position: 0 0;    }
      100% { background-position: 40px 40px; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes dash {
      to { stroke-dashoffset: -20; }
    }

    .chain-card:hover { transform: translateX(3px); }
    .chain-card { transition: all 0.18s cubic-bezier(.4,0,.2,1); }

    .sidebar-scroll::-webkit-scrollbar        { width: 3px; }
    .sidebar-scroll::-webkit-scrollbar-track  { background: transparent; }
    .sidebar-scroll::-webkit-scrollbar-thumb  { background: rgba(99,102,241,0.25); border-radius: 10px; }

    .fade-in   { animation: fadeSlideIn   0.45s cubic-bezier(.4,0,.2,1) forwards; }
    .fade-left { animation: fadeSlideLeft 0.4s  cubic-bezier(.4,0,.2,1) forwards; }

    .metric-card { transition: all 0.2s; }
    .metric-card:hover { transform: scale(1.03); }

    /* Animated grid bg */
    .grid-bg {
      background-image:
        linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      animation: gridScroll 8s linear infinite;
    }

    /* Shimmer loading bar */
    .shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 400px 100%;
      animation: shimmer 1.5s infinite;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════
   SIDEBAR CONSTANTS
═══════════════════════════════════════════════ */
const SIDEBAR_MIN     = 260;
const SIDEBAR_MAX     = 540;
const SIDEBAR_DEFAULT = 340;

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const ChainGraph = () => {
  const { repoId } = useParams();
  const navigate   = useNavigate();
  const fgRef      = useRef();
  const tickRef    = useRef(0);   // for pulse animation frame

  /* state */
  const [loading,      setLoading]      = useState(true);
  const [repoName,     setRepoName]     = useState("Repository");
  const [chains,       setChains]       = useState([]);
  const [nodeMap,      setNodeMap]      = useState({});
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [graphData,    setGraphData]    = useState({ nodes: [], links: [] });
  const [hoverNode,    setHoverNode]    = useState(null);
  const [filter,       setFilter]       = useState("ALL");
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [sidebarW,     setSidebarW]     = useState(SIDEBAR_DEFAULT);
  const [statsAnim,    setStatsAnim]    = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  /* drag resize */
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const dragStartW  = useRef(SIDEBAR_DEFAULT);

  const onDragStart = useCallback((e) => {
    isDragging.current  = true;
    dragStartX.current  = e.clientX;
    dragStartW.current  = sidebarW;
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
  }, [sidebarW]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const next  = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, dragStartW.current + delta));
      setSidebarW(next);
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current            = false;
      document.body.style.cursor    = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await API.get(`/api/graph/${repoId}?type=chain`);
        const data = res.data;

        // Build nodeMap with normalized IDs too
        const nm = {};
        data.nodes?.forEach(n => {
          nm[n.id] = n;
          const norm = normalizeName(n.id);
          if (norm && norm !== n.id)
            nm[norm] = { ...n, id: norm, label: n.label || norm };
        });
        setNodeMap(nm);

        const rn = data?.nodes?.find(n => n.type === "repo")
                || data?.nodes?.find(n => n.label?.includes("/"));
        setRepoName(rn?.label || "Repository");

        const built = buildChains(data.nodes || [], data.edges || []);
        setChains(built);
        if (built.length > 0) {
          setGraphData(chainToGraph(built[0], nm));
          setTimeout(() => setStatsAnim(true), 200);
        }
      } catch (e) {
        console.error("ChainGraph fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [repoId]);

  /* ── select chain ── */
  const selectChain = useCallback((idx) => {
    setActiveIdx(idx);
    setSelectedNode(null);
    setGraphData(chainToGraph(filteredChains[idx], nodeMap)); // eslint-disable-line
    setTimeout(() => fgRef.current?.zoomToFit(700, 90), 320);
  }, [nodeMap]); // filteredChains computed below

  /* ── filter ── */
  const filteredChains = useMemo(() => {
    if (filter === "ALL") return chains;
    return chains.filter(c => nodeMap[c[c.length - 1]]?.severity === filter
      || nodeMap[normalizeName(c[c.length - 1])]?.severity === filter);
  }, [chains, filter, nodeMap]);

  /* ── counts ── */
  const counts = useMemo(() => {
    const c = { ALL: chains.length };
    chains.forEach(ch => {
      const id  = ch[ch.length - 1];
      const sev = nodeMap[id]?.severity || nodeMap[normalizeName(id)]?.severity || "LOW";
      c[sev] = (c[sev] || 0) + 1;
    });
    return c;
  }, [chains, nodeMap]);

  /* ── active chain info ── */
  const activeChain = filteredChains[activeIdx] ?? filteredChains[0];
  const activeVuln  = activeChain
    ? (nodeMap[activeChain[activeChain.length - 1]]
    || nodeMap[normalizeName(activeChain[activeChain.length - 1])])
    : null;
  const activeSev   = activeVuln?.severity || "LOW";
  const activeCfg   = SEV[activeSev];

  /* ════════════════════════════════════════════
     CANVAS: draw node
  ════════════════════════════════════════════ */
  const drawNode = useCallback((node, ctx, globalScale) => {
    // ✅ Guard — coordinates not ready yet (first render)
    if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) return;

    const t   = tickRef.current;
    const r   = node.isVuln ? 14 : 10;
    const x   = node.x, y = node.y;

    // Outer glow
    const grad = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.5);
    grad.addColorStop(0, node.glow);
    grad.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    // Pulse ring for CRITICAL/HIGH vuln nodes
    if (node.pulse && node.isVuln) {
      const phase = ((t * 0.04 + node.depth * 0.5) % 1);
      const rPulse = r + phase * r * 2.2;
      const alpha  = (1 - phase) * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, rPulse, 0, 2 * Math.PI);
      ctx.strokeStyle = node.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.lineWidth   = 1.8;
      ctx.stroke();
    }

    // Secondary ring for vuln
    if (node.isVuln) {
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = node.color + "55";
      ctx.lineWidth   = 1.2;
      ctx.stroke();
    }

    // Main circle with gradient fill
    const fill = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    if (node.isVuln) {
      fill.addColorStop(0, node.color + "ff");
      fill.addColorStop(1, node.color + "aa");
    } else {
      const isHovered = hoverNode?.id === node.id;
      fill.addColorStop(0, isHovered ? "#818cf8" : "#6366f1");
      fill.addColorStop(1, isHovered ? "#4f46e5" : "#3730a3");
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();

    // Inner highlight ring
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.strokeStyle = node.isVuln ? node.color + "99" : "rgba(255,255,255,0.18)";
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Depth number
    ctx.fillStyle    = node.isVuln ? "#0a0a0f" : "rgba(255,255,255,0.92)";
    ctx.font         = `bold ${node.isVuln ? 9 : 8}px 'JetBrains Mono', monospace`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.depth + 1, x, y);

    // Hover tooltip
    if (hoverNode?.id === node.id) {
      const text  = node.label.length > 34 ? node.label.slice(0, 34) + "…" : node.label;
      const fSize = Math.max(9, Math.min(12, 11 / globalScale * 1.4));
      ctx.font    = `600 ${fSize}px 'JetBrains Mono', monospace`;
      const tw    = ctx.measureText(text).width;
      const px = 10, py = 6, bw = tw + px * 2, bh = py * 2 + 8;
      const bx = x + r + 10, by = y - bh / 2;

      // Tooltip bg
      ctx.fillStyle   = "rgba(2,6,18,0.95)";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 5);
      ctx.fill();

      // Tooltip border
      ctx.strokeStyle = node.color + "88";
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Tooltip text
      ctx.fillStyle    = "#f1f5f9";
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, bx + px, by + bh / 2);
    }
  }, [hoverNode]);

  /* ════════════════════════════════════════════
     CANVAS: draw link
  ════════════════════════════════════════════ */
  const drawLink = useCallback((link, ctx) => {
    const s = link.source, t = link.target;
    // ✅ Guard — NaN coordinates crash createLinearGradient
    if (!s?.x || !t?.x || !isFinite(s.x) || !isFinite(s.y) || !isFinite(t.x) || !isFinite(t.y)) return;

    const isHot = t.severity === "CRITICAL" || t.severity === "HIGH";
    const col   = isHot ? SEV[t.severity].color : "#6366f1";

    // Gradient line
    const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
    grad.addColorStop(0, col + (isHot ? "44" : "33"));
    grad.addColorStop(1, col + (isHot ? "cc" : "77"));

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = isHot ? 2.5 : 1.5;
    if (!isHot) {
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -(tickRef.current * 0.3);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  /* tick for animations */
  useEffect(() => {
    let id;
    const tick = () => {
      tickRef.current += 1;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  /* ════════════════════════════════════════════
     LOADING STATE
  ════════════════════════════════════════════ */
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#02060f] text-white relative overflow-hidden">
      <GlobalStyles />
      <Background />
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Orbital loader */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400"
            style={{ animation: "spin 1s linear infinite" }} />
          <div className="absolute inset-2 rounded-full border-t-2 border-pink-500/60"
            style={{ animation: "spin 1.5s linear infinite reverse" }} />
          <div className="absolute inset-4 rounded-full border-t border-cyan-400/40"
            style={{ animation: "spin 2s linear infinite" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-400"
              style={{ boxShadow: "0 0 16px #818cf8" }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-slate-200 font-bold text-lg tracking-widest"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            BUILDING CHAINS
          </p>
          <p className="text-indigo-400/60 text-xs mt-1 tracking-[4px] font-mono">
            ANALYZING VULNERABILITY PATHS
          </p>
        </div>
        {/* Progress shimmer bars */}
        <div className="flex flex-col gap-2 w-48">
          {[100, 75, 55].map((w, i) => (
            <div key={i} className="h-[3px] rounded-full overflow-hidden bg-slate-800/60">
              <div className="h-full shimmer rounded-full" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     MAIN RENDER
  ════════════════════════════════════════════ */
  return (
    <div
      className="h-screen text-white flex overflow-hidden relative select-none"
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        background: "#02060f",
      }}
    >
      <GlobalStyles />
      <Background />

      {/* Scrolling grid overlay */}
      <div className="grid-bg absolute inset-0 pointer-events-none opacity-40" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,6,15,0.7) 100%)"
        }} />

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className="relative z-10 flex flex-col flex-shrink-0"
        style={{
          width:      sidebarOpen ? sidebarW : 0,
          minWidth:   sidebarOpen ? sidebarW : 0,
          overflow:   "hidden",
          transition: isDragging.current ? "none" : "width 0.28s cubic-bezier(.4,0,.2,1), min-width 0.28s cubic-bezier(.4,0,.2,1)",
          background: "rgba(4,8,20,0.92)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-[11px] text-indigo-400/70 hover:text-indigo-300 transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
            Back
          </button>

          {/* Repo pill */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-1.5 h-8 rounded-full"
              style={{ background: `linear-gradient(to bottom, ${activeCfg.color}, ${activeCfg.color}44)` }} />
            <div>
              <p className="text-[9px] text-indigo-400/50 tracking-[3px] uppercase mb-0.5">Chain Graph</p>
              <p className="text-[13px] text-slate-100 font-semibold truncate max-w-[220px]"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                {repoName}
              </p>
            </div>
          </div>

          {/* Total chains badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-slate-500">Total chains detected:</span>
            <span className="text-[12px] font-bold text-indigo-300">{chains.length}</span>
          </div>
        </div>

        {/* ── Severity Stats Grid ── */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-white/5 flex-shrink-0">
          {["CRITICAL","HIGH","MEDIUM","LOW"].map((s, i) => (
            <div
              key={s}
              className="metric-card rounded-xl px-3 py-2.5 cursor-pointer"
              style={{
                background: SEV[s].color + "0e",
                border:     `1px solid ${SEV[s].color}${filter === s ? "66" : "20"}`,
                opacity:    statsAnim ? 1 : 0,
                transform:  statsAnim ? "none" : "translateY(8px)",
                transition: `all 0.4s cubic-bezier(.4,0,.2,1) ${i * 0.07}s`,
                boxShadow:  filter === s ? `0 0 16px ${SEV[s].color}20` : "none",
              }}
              onClick={() => { setFilter(s === filter ? "ALL" : s); setActiveIdx(0); }}
            >
              <p className="text-[9px] tracking-[2px] font-bold mb-1"
                style={{ color: SEV[s].color + "bb" }}>{s}</p>
              <p className="text-2xl font-black leading-none"
                style={{ color: SEV[s].color, fontFamily: "'Syne', sans-serif" }}>
                {counts[s] || 0}
              </p>
              {/* Tiny bar */}
              <div className="mt-2 h-[2px] rounded-full overflow-hidden bg-white/5">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${Math.min(100, ((counts[s] || 0) / (counts.ALL || 1)) * 100)}%`,
                    background: SEV[s].color,
                  }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1.5 px-4 py-3 border-b border-white/5 flex-wrap flex-shrink-0">
          {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(f => {
            const active = filter === f;
            const col    = f === "ALL" ? "#818cf8" : SEV[f].color;
            return (
              <button key={f}
                onClick={() => { setFilter(f); setActiveIdx(0); }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-150"
                style={{
                  background: active ? col + "22" : "rgba(255,255,255,0.03)",
                  border:     `1px solid ${active ? col + "66" : "rgba(255,255,255,0.07)"}`,
                  color:      active ? col : "#475569",
                  boxShadow:  active ? `0 0 10px ${col}22` : "none",
                }}
              >
                {f} {counts[f] !== undefined ? counts[f] : ""}
              </button>
            );
          })}
        </div>

        {/* ── Chain List ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 sidebar-scroll">
          {filteredChains.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-16 gap-3 opacity-50">
              <div className="text-4xl">🔍</div>
              <p className="text-slate-500 text-xs text-center">No chains match this filter</p>
            </div>
          ) : filteredChains.map((chain, i) => {
            const lastId  = chain[chain.length - 1];
            const vuln    = nodeMap[lastId] || nodeMap[normalizeName(lastId)];
            const rootId  = chain[0];
            const root    = nodeMap[rootId] || nodeMap[normalizeName(rootId)];
            const sev     = vuln?.severity || "LOW";
            const cfg     = SEV[sev];
            const isActive = i === activeIdx;

            return (
              <div
                key={i}
                className="chain-card rounded-xl px-3 py-2.5 cursor-pointer"
                style={{
                  background: isActive ? cfg.color + "12" : "rgba(255,255,255,0.018)",
                  border:     `1px solid ${isActive ? cfg.color + "50" : "rgba(255,255,255,0.055)"}`,
                  boxShadow:  isActive ? `0 0 20px ${cfg.color}14, inset 0 1px 0 ${cfg.color}20` : "none",
                  animation:  `fadeSlideLeft 0.3s cubic-bezier(.4,0,.2,1) ${Math.min(i, 20) * 0.025}s both`,
                }}
                onClick={() => selectChain(i)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <SevBadge sev={sev} />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-600">{chain.length - 1} hops</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                    )}
                  </div>
                </div>

                {/* Chain path preview */}
                <div className="flex items-center gap-1 text-[10px] overflow-hidden">
                  <span className="text-indigo-400 truncate max-w-[90px]">
                    {(root?.label || normalizeName(rootId) || rootId).slice(0, 18)}
                  </span>
                  <span className="text-slate-700 flex-shrink-0 text-[8px]">→ ··· →</span>
                  <span className="truncate max-w-[90px] font-semibold"
                    style={{ color: cfg.color }}>
                    {(vuln?.label || normalizeName(lastId) || lastId).slice(0, 18)}
                  </span>
                </div>

                {/* Mini hop dots */}
                {isActive && (
                  <div className="flex items-center gap-1 mt-2 overflow-hidden">
                    {chain.slice(0, Math.min(chain.length, 10)).map((id, hi) => (
                      <div key={hi} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: hi === chain.length - 1 ? cfg.color : "#6366f1",
                            boxShadow:  hi === chain.length - 1 ? `0 0 5px ${cfg.color}` : "none",
                          }} />
                        {hi < Math.min(chain.length, 10) - 1 && (
                          <div className="w-3 h-px flex-shrink-0"
                            style={{ background: "rgba(99,102,241,0.3)" }} />
                        )}
                      </div>
                    ))}
                    {chain.length > 10 && (
                      <span className="text-[9px] text-slate-600">+{chain.length - 10}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Legend ── */}
        <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
          <p className="text-[9px] text-slate-600 tracking-[3px] uppercase mb-2.5">Legend</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-500"
                style={{ boxShadow: "0 0 6px #6366f1" }} />
              <span className="text-[10px] text-slate-500">Dependency</span>
            </div>
            {["CRITICAL","HIGH","MEDIUM","LOW"].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: SEV[s].color, boxShadow: `0 0 5px ${SEV[s].color}` }} />
                <span className="text-[10px]" style={{ color: SEV[s].color + "cc" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ══════════ DRAG HANDLE ══════════ */}
      {sidebarOpen && (
        <div
          onMouseDown={onDragStart}
          className="relative z-20 flex-shrink-0 group flex items-center justify-center"
          style={{ width: 6, cursor: "col-resize" }}
        >
          <div className="h-full w-px transition-all duration-200"
            style={{ background: "rgba(99,102,241,0.15)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.5)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
          />
          <div className="absolute flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ top: "50%", transform: "translateY(-50%)" }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-indigo-400/60" />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ MAIN GRAPH AREA ══════════ */}
      <div className="relative flex-1 overflow-hidden">

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute top-4 left-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style={{
            background:    "rgba(4,8,20,0.85)",
            backdropFilter: "blur(12px)",
            border:         "1px solid rgba(99,102,241,0.2)",
            color:          "#818cf8",
          }}
        >
          {sidebarOpen ? "←" : "→"}
        </button>

        {/* ── Active chain breadcrumb ── */}
        {activeChain && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{
              background:    "rgba(4,8,20,0.88)",
              backdropFilter: "blur(20px)",
              border:         `1px solid ${activeCfg.color}30`,
              boxShadow:      `0 0 30px ${activeCfg.color}14`,
              maxWidth:        "65%",
            }}
          >
            <SevBadge sev={activeSev} />
            {/* Scanline animation */}
            <div className="relative overflow-hidden flex items-center gap-1 flex-wrap"
              style={{ maxWidth: 480 }}>
              {activeChain.map((id, i) => {
                const norm  = normalizeName(id);
                const label = (nodeMap[id]?.label || nodeMap[norm]?.label || norm || id).slice(0, 16);
                const isLast = i === activeChain.length - 1;
                return (
                  <span key={id} className="flex items-center gap-1 text-[11px]">
                    <span style={{ color: isLast ? activeCfg.color : "#818cf8", fontWeight: isLast ? 700 : 400 }}>
                      {label}
                    </span>
                    {!isLast && <span className="text-slate-700 text-[9px]">→</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Selected / Hover node detail panel ── */}
        {(selectedNode || hoverNode) && (() => {
          const node = selectedNode || hoverNode;
          const cfg2 = node.isVuln ? SEV[node.severity] : null;
          return (
            <div
              className="absolute bottom-6 left-6 z-20 px-5 py-4 rounded-2xl fade-in"
              style={{
                background:    "rgba(4,8,20,0.93)",
                backdropFilter: "blur(20px)",
                border:         `1px solid ${node.isVuln ? cfg2.color + "50" : "rgba(99,102,241,0.25)"}`,
                boxShadow:      node.isVuln ? `0 0 30px ${cfg2.color}18` : "0 0 20px rgba(99,102,241,0.1)",
                minWidth:       200,
                maxWidth:       300,
              }}
            >
              <p className="text-[9px] text-slate-500 tracking-[3px] uppercase mb-2">
                {node.isVuln ? "Vulnerability" : "Dependency"} · hop {node.depth + 1}
              </p>
              <p className="text-sm font-bold break-all mb-2"
                style={{ color: node.isVuln ? cfg2?.color : "#818cf8" }}>
                {node.label}
              </p>
              {node.isVuln && (
                <div className="flex items-center gap-2 mt-1">
                  <SevBadge sev={node.severity} size="lg" />
                  {cfg2.pulse && (
                    <span className="text-[10px] text-slate-500">Active threat</span>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Stats bar top-right ── */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {["CRITICAL","HIGH"].map(s => counts[s] > 0 && (
            <div key={s}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: SEV[s].color + "14",
                border:     `1px solid ${SEV[s].color}40`,
              }}
            >
              <div className="w-2 h-2 rounded-full"
                style={{ background: SEV[s].color, boxShadow: `0 0 8px ${SEV[s].color}`, animation: "pulseRing 2s infinite" }} />
              <span className="text-[11px] font-bold" style={{ color: SEV[s].color }}>
                {counts[s]} {s}
              </span>
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(4,8,20,0.85)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <span className="text-[11px] text-indigo-300 font-bold">{chains.length} chains</span>
          </div>
        </div>

        {/* ── Empty state ── */}
        {!loading && chains.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 fade-in">
            <div className="text-6xl">✅</div>
            <p className="text-slate-200 text-xl font-bold"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              No Vulnerability Chains
            </p>
            <p className="text-slate-500 text-sm">This repository has no dependency → vulnerability paths.</p>
          </div>
        )}

        {/* ── Force Graph ── */}
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            backgroundColor="transparent"
            d3AlphaDecay={0.012}
            d3VelocityDecay={0.32}
            cooldownTicks={150}
            dagMode="lr"
            dagLevelDistance={180}
            nodeCanvasObject={drawNode}
            nodeCanvasObjectMode={() => "replace"}
            linkCanvasObject={drawLink}
            linkCanvasObjectMode={() => "replace"}
            linkDirectionalArrowLength={8}
            linkDirectionalArrowRelPos={0.92}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={link => {
              const t = link.target;
              return (t?.severity && SEV[t.severity]?.color) || "#6366f1";
            }}
            onNodeHover={setHoverNode}
            onNodeClick={node => setSelectedNode(prev => prev?.id === node.id ? null : node)}
            enableZoomInteraction
            enablePanInteraction
            onEngineStop={() => fgRef.current?.zoomToFit(700, 90)}
          />
        )}

        {/* ── Bottom hint ── */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-4 text-[10px] text-slate-600">
          <span>Click node for details</span>
          <span>·</span>
          <span>Scroll to zoom</span>
          <span>·</span>
          <span>Drag to pan</span>
        </div>
      </div>
    </div>
  );
};

export default ChainGraph;
