import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import API from "../api";
import Background from "../components/BackgroundCanvas";

const SEV = {
  CRITICAL: { color: "#ef4444", glow: "rgba(239,68,68,0.35)", label: "CRITICAL", order: 0 },
  HIGH:     { color: "#f97316", glow: "rgba(249,115,22,0.28)", label: "HIGH",     order: 1 },
  MEDIUM:   { color: "#eab308", glow: "rgba(234,179,8,0.28)",  label: "MEDIUM",   order: 2 },
  LOW:      { color: "#22c55e", glow: "rgba(34,197,94,0.22)",  label: "LOW",      order: 3 },
};

function buildChains(rawNodes, rawEdges) {
  const nodeMap = {};
  rawNodes.forEach(n => (nodeMap[n.id] = n));
  const rev = {};
  rawEdges.forEach(e => {
    if (!rev[e.to]) rev[e.to] = [];
    rev[e.to].push(e.from);
  });
  const vulnNodes = rawNodes.filter(n => n.type === "vulnerability");
  const chains = [];
  vulnNodes.forEach(vuln => {
    const trace = (id, path) => {
      const parents = rev[id] || [];
      if (parents.length === 0) { chains.push([...path].reverse()); return; }
      parents.forEach(p => trace(p, [...path, p]));
    };
    trace(vuln.id, [vuln.id]);
  });
  const seen = new Set();
  return chains.filter(c => {
    const key = c.join("→");
    if (seen.has(key) || c.length < 2) return false;
    seen.add(key); return true;
  }).sort((a, b) => {
    const sa = nodeMap[a[a.length - 1]]?.severity || "LOW";
    const sb = nodeMap[b[b.length - 1]]?.severity || "LOW";
    return (SEV[sa]?.order ?? 9) - (SEV[sb]?.order ?? 9);
  });
}

function chainToGraph(chain, nodeMap) {
  const nodes = chain.map((id, i) => {
    const raw = nodeMap[id] || {};
    const isVuln = raw.type === "vulnerability";
    const sev = raw.severity;
    return {
      id, label: raw.label || id, isVuln,
      severity: sev || null,
      color: isVuln ? (SEV[sev]?.color || "#22c55e") : "#6366f1",
      glow:  isVuln ? (SEV[sev]?.glow  || "rgba(34,197,94,0.2)") : "rgba(99,102,241,0.2)",
      depth: i,
    };
  });
  const links = [];
  for (let i = 0; i < chain.length - 1; i++)
    links.push({ source: chain[i], target: chain[i + 1] });
  return { nodes, links };
}

const SevBadge = ({ sev }) => {
  const c = SEV[sev] || SEV.LOW;
  return (
    <span style={{
      background: c.color + "18", color: c.color,
      border: `1px solid ${c.color}44`,
      borderRadius: 6, fontSize: 11, fontWeight: 700,
      padding: "2px 8px", letterSpacing: 1,
    }}>
      {c.label}
    </span>
  );
};

/* ── constants ── */
const SIDEBAR_MIN  = 240;
const SIDEBAR_MAX  = 520;
const SIDEBAR_DEFAULT = 320;

const ChainGraph = () => {
  const { repoId } = useParams();
  const navigate   = useNavigate();
  const fgRef      = useRef();

  const [loading,     setLoading]     = useState(true);
  const [repoName,    setRepoName]    = useState("Repository");
  const [chains,      setChains]      = useState([]);
  const [nodeMap,     setNodeMap]     = useState({});
  const [activeIdx,   setActiveIdx]   = useState(0);
  const [graphData,   setGraphData]   = useState({ nodes: [], links: [] });
  const [hoverNode,   setHoverNode]   = useState(null);
  const [filter,      setFilter]      = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarW,    setSidebarW]    = useState(SIDEBAR_DEFAULT);

  /* ── drag-resize state ── */
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const dragStartW  = useRef(SIDEBAR_DEFAULT);

  const onDragStart = useCallback((e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartW.current = sidebarW;
    document.body.style.cursor  = "col-resize";
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
      isDragging.current = false;
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
        const rn   = data?.nodes?.find(n => n.type === "repo") ||
                     data?.nodes?.find(n => n.label?.includes("/"));
        setRepoName(rn?.label || "Repository");
        const nm = {};
        data.nodes?.forEach(n => (nm[n.id] = n));
        setNodeMap(nm);
        const built = buildChains(data.nodes || [], data.edges || []);
        setChains(built);
        if (built.length > 0) setGraphData(chainToGraph(built[0], nm));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [repoId]);

  const selectChain = useCallback((idx) => {
    setActiveIdx(idx);
    setGraphData(chainToGraph(chains[idx], nodeMap));
    setTimeout(() => fgRef.current?.zoomToFit(600, 80), 300);
  }, [chains, nodeMap]);

  const filteredChains = chains.filter(c => {
    if (filter === "ALL") return true;
    return nodeMap[c[c.length - 1]]?.severity === filter;
  });

  const counts = { ALL: chains.length };
  chains.forEach(c => {
    const sev = nodeMap[c[c.length - 1]]?.severity || "LOW";
    counts[sev] = (counts[sev] || 0) + 1;
  });

  const drawNode = useCallback((node, ctx) => {
    const r = node.isVuln ? 13 : 9;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 10, 0, 2 * Math.PI);
    ctx.fillStyle = node.glow;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();
    if (node.isVuln) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.45;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (hoverNode?.id === node.id) {
      const text = node.label.length > 30 ? node.label.slice(0, 30) + "…" : node.label;
      ctx.font = "bold 11px monospace";
      const tw = ctx.measureText(text).width;
      const px = 10, py = 6;
      ctx.fillStyle = "rgba(2,8,23,0.92)";
      ctx.beginPath();
      ctx.roundRect(node.x + r + 8, node.y - py - 4, tw + px * 2, py * 2 + 8, 6);
      ctx.fill();
      ctx.strokeStyle = node.color + "66";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#f1f5f9";
      ctx.fillText(text, node.x + r + 8 + px, node.y + py - 2);
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `bold ${node.isVuln ? 9 : 8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.depth + 1, node.x, node.y);
  }, [hoverNode]);

  const drawLink = useCallback((link, ctx) => {
    const s = link.source, t = link.target;
    if (!s?.x || !t?.x) return;
    const isHot = t.severity === "CRITICAL" || t.severity === "HIGH";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = isHot ? (SEV[t.severity]?.color + "99") : "rgba(99,102,241,0.35)";
    ctx.lineWidth   = isHot ? 2 : 1;
    ctx.stroke();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020817] text-white relative overflow-hidden">
      <Background />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <p className="text-cyan-300 font-mono text-sm tracking-widest">Building chains…</p>
      </div>
    </div>
  );

  const activeChain = filteredChains[activeIdx] || filteredChains[0];
  const activeVuln  = activeChain ? nodeMap[activeChain[activeChain.length - 1]] : null;
  const activeSev   = activeVuln?.severity || "LOW";

  return (
    <div
      className="h-screen text-white flex overflow-hidden relative select-none"
      style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", background: "#020817" }}
    >
      <Background />

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className="relative z-10 flex flex-col"
        style={{
          width:    sidebarOpen ? sidebarW : 0,
          minWidth: sidebarOpen ? sidebarW : 0,
          maxWidth: SIDEBAR_MAX,
          overflow: "hidden",
          transition: isDragging.current ? "none" : "width 0.25s, min-width 0.25s",
          background: "rgba(6,10,20,0.88)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(99,102,241,0.15)",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-indigo-500/10 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Back
          </button>
          <p className="text-[10px] text-indigo-500 tracking-[3px] uppercase mb-1">Chain Graph</p>
          <p className="text-sm text-slate-200 font-semibold truncate">{repoName}</p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-indigo-500/10 flex-shrink-0">
          {["CRITICAL","HIGH","MEDIUM","LOW"].map(s => (
            <div key={s} className="rounded-lg px-3 py-2"
              style={{ background: SEV[s].color + "10", border: `1px solid ${SEV[s].color}25` }}>
              <p className="text-[10px] tracking-widest" style={{ color: SEV[s].color }}>{s}</p>
              <p className="text-lg font-bold" style={{ color: SEV[s].color }}>{counts[s] || 0}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-4 py-3 border-b border-indigo-500/10 flex-wrap flex-shrink-0">
          {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setActiveIdx(0); }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-md transition-all"
              style={{
                background: filter === f
                  ? (f === "ALL" ? "rgba(99,102,241,0.25)" : SEV[f].color + "28")
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f
                  ? (f === "ALL" ? "rgba(99,102,241,0.5)" : SEV[f].color + "70")
                  : "rgba(255,255,255,0.08)"}`,
                color: filter === f
                  ? (f === "ALL" ? "#a5b4fc" : SEV[f].color)
                  : "#64748b",
              }}
            >
              {f}{counts[f] !== undefined ? ` ${counts[f]}` : ""}
            </button>
          ))}
        </div>

        {/* Chain list */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.2) transparent" }}
        >
          {filteredChains.length === 0 ? (
            <p className="text-center text-slate-600 text-xs mt-10">No chains for this filter.</p>
          ) : filteredChains.map((chain, i) => {
            const vuln = nodeMap[chain[chain.length - 1]];
            const root = nodeMap[chain[0]];
            const sev  = vuln?.severity || "LOW";
            const isActive = i === activeIdx;
            return (
              <div key={i} onClick={() => selectChain(i)}
                className="rounded-xl px-3 py-3 cursor-pointer transition-all duration-150"
                style={{
                  background: isActive ? SEV[sev].color + "14" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? SEV[sev].color + "55" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <SevBadge sev={sev} />
                  <span className="text-[11px] text-slate-600">{chain.length} hops</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  <span style={{ color: "#818cf8" }}>{(root?.label || chain[0]).slice(0, 22)}</span>
                  <span className="text-slate-700 mx-1">→ … →</span>
                  <span style={{ color: SEV[sev].color }}>{(vuln?.label || chain[chain.length-1]).slice(0, 22)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-indigo-500/10 space-y-2 flex-shrink-0">
          <p className="text-[10px] text-slate-600 tracking-widest uppercase">Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0"
              style={{ boxShadow: "0 0 6px #6366f1" }} />
            <span className="text-[11px] text-slate-500">Dependency</span>
          </div>
          {["CRITICAL","HIGH","MEDIUM","LOW"].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: SEV[s].color, boxShadow: `0 0 6px ${SEV[s].color}` }} />
              <span className="text-[11px]" style={{ color: SEV[s].color }}>{s}</span>
              <span className="text-[11px] text-slate-600">vulnerability</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══════════ DRAG HANDLE ══════════ */}
      {sidebarOpen && (
        <div
          onMouseDown={onDragStart}
          className="relative z-20 flex-shrink-0 flex items-center justify-center group"
          style={{
            width: 6,
            cursor: "col-resize",
            background: "transparent",
            transition: "background 0.15s",
          }}
        >
          {/* visible bar — brightens on hover/drag */}
          <div
            className="h-full w-[2px] transition-all duration-150 group-hover:w-[3px]"
            style={{
              background: "rgba(99,102,241,0.2)",
              transition: "background 0.15s, width 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.55)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
          />

          {/* drag grip dots — centred vertically */}
          <div
            className="absolute flex flex-col gap-[4px] items-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            {[0,1,2,3,4].map(i => (
              <div key={i} className="w-[3px] h-[3px] rounded-full"
                style={{ background: "rgba(99,102,241,0.7)" }} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ MAIN GRAPH AREA ══════════ */}
      <div className="relative flex-1 overflow-hidden">

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          style={{
            background: "rgba(6,10,20,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#818cf8",
          }}
        >
          {sidebarOpen ? "←" : "→"}
        </button>

        {/* Active chain breadcrumb */}
        {activeChain && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-xl max-w-[60%]"
            style={{
              background: "rgba(6,10,20,0.82)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${SEV[activeSev].color}35`,
            }}
          >
            <SevBadge sev={activeSev} />
            <div className="flex items-center gap-1 overflow-hidden text-[11px] flex-wrap">
              {activeChain.map((id, i) => (
                <span key={id} className="flex items-center gap-1">
                  <span style={{ color: i === activeChain.length - 1 ? SEV[activeSev].color : "#818cf8" }}>
                    {(nodeMap[id]?.label || id).slice(0, 14)}
                  </span>
                  {i < activeChain.length - 1 && <span className="text-slate-700">→</span>}
                </span>
              ))}
            </div>
          </div>
        )}


        {/* Hover node detail */}
        {hoverNode && (
          <div
            className="absolute bottom-5 left-5 z-20 px-4 py-3 rounded-xl max-w-xs"
            style={{
              background: "rgba(6,10,20,0.9)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${hoverNode.isVuln ? SEV[hoverNode.severity]?.color + "50" : "rgba(99,102,241,0.25)"}`,
            }}
          >
            <p className="text-[10px] text-slate-600 mb-1 tracking-widest uppercase">
              {hoverNode.isVuln ? "Vulnerability" : "Dependency"} · hop {hoverNode.depth + 1}
            </p>
            <p className="text-sm font-bold break-all" style={{ color: hoverNode.color }}>
              {hoverNode.label}
            </p>
            {hoverNode.isVuln && <div className="mt-2"><SevBadge sev={hoverNode.severity} /></div>}
          </div>
        )}

        {/* Empty state */}
        {chains.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
            <div className="text-5xl">✅</div>
            <p className="text-slate-300 text-lg font-semibold">No vulnerability chains found</p>
            <p className="text-slate-600 text-sm">This repo has no dependency → vulnerability paths.</p>
          </div>
        )}

        {/* Force graph */}
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            backgroundColor="transparent"
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.35}
            cooldownTicks={120}
            dagMode="lr"
            dagLevelDistance={160}
            nodeCanvasObject={drawNode}
            nodeCanvasObjectMode={() => "replace"}
            linkCanvasObject={drawLink}
            linkCanvasObjectMode={() => "replace"}
            linkDirectionalArrowLength={7}
            linkDirectionalArrowRelPos={0.95}
            onNodeHover={setHoverNode}
            enableZoomInteraction
            enablePanInteraction
            onEngineStop={() => fgRef.current?.zoomToFit(600, 80)}
          />
        )}
      </div>
    </div>
  );
};

export default ChainGraph;