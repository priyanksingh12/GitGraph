import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import API from "../api";
import Background from "../components/BackgroundCanvas";

/* ── severity config ── */
const SEV = {
  CRITICAL: { color: "#ef4444", glow: "rgba(239,68,68,0.35)", label: "CRITICAL", order: 0 },
  HIGH:     { color: "#f97316", glow: "rgba(249,115,22,0.28)", label: "HIGH",     order: 1 },
  MEDIUM:   { color: "#eab308", glow: "rgba(234,179,8,0.28)",  label: "MEDIUM",   order: 2 },
  LOW:      { color: "#22c55e", glow: "rgba(34,197,94,0.22)",  label: "LOW",      order: 3 },
};

/* ── build only chains that end in a vulnerability ── */
function buildChains(rawNodes, rawEdges) {
  const nodeMap = {};
  rawNodes.forEach(n => (nodeMap[n.id] = n));

  const fwd = {};
  rawEdges.forEach(e => {
    if (!fwd[e.from]) fwd[e.from] = [];
    fwd[e.from].push(e.to);
  });

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
      if (parents.length === 0) {
        chains.push([...path].reverse());
        return;
      }
      parents.forEach(p => trace(p, [...path, p]));
    };
    trace(vuln.id, [vuln.id]);
  });

  const seen = new Set();
  return chains.filter(c => {
    const key = c.join("→");
    if (seen.has(key) || c.length < 2) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => {
    const sa = nodeMap[a[a.length - 1]]?.severity || "LOW";
    const sb = nodeMap[b[b.length - 1]]?.severity || "LOW";
    return (SEV[sa]?.order ?? 9) - (SEV[sb]?.order ?? 9);
  });
}

/* ── build graph for a single chain ── */
function chainToGraph(chain, nodeMap) {
  const nodes = chain.map((id, i) => {
    const raw = nodeMap[id] || {};
    const isVuln = raw.type === "vulnerability";
    const sev = raw.severity;
    return {
      id,
      label: raw.label || id,
      isVuln,
      severity: sev || null,
      color: isVuln ? (SEV[sev]?.color || "#22c55e") : "#6366f1",
      glow: isVuln ? (SEV[sev]?.glow || "rgba(34,197,94,0.2)") : "rgba(99,102,241,0.2)",
      depth: i,
    };
  });

  const links = [];
  for (let i = 0; i < chain.length - 1; i++) {
    links.push({ source: chain[i], target: chain[i + 1] });
  }
  return { nodes, links };
}

/* ── severity badge ── */
const SevBadge = ({ sev }) => {
  const c = SEV[sev] || SEV.LOW;
  return (
    <span style={{
      background: c.color + "22",
      color: c.color,
      border: `1px solid ${c.color}55`,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 700,
      padding: "3px 9px",
      letterSpacing: 1,
    }}>
      {c.label}
    </span>
  );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const ChainGraph = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const fgRef = useRef();

  const [loading, setLoading] = useState(true);
  const [repoName, setRepoName] = useState("Repository");
  const [chains, setChains] = useState([]);
  const [nodeMap, setNodeMap] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [filter, setFilter] = useState("ALL");

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/api/graph/${repoId}?type=chain`);
        const data = res.data;

        const rn = data?.nodes?.find(n => n.type === "repo") ||
                   data?.nodes?.find(n => n.label?.includes("/"));
        setRepoName(rn?.label || "Repository");

        const nm = {};
        data.nodes?.forEach(n => (nm[n.id] = n));
        setNodeMap(nm);

        const built = buildChains(data.nodes || [], data.edges || []);
        setChains(built);
        if (built.length > 0) {
          setGraphData(chainToGraph(built[0], nm));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [repoId]);

  /* ── switch active chain ── */
  const selectChain = useCallback((idx) => {
    setActiveIdx(idx);
    setGraphData(chainToGraph(chains[idx], nodeMap));
    setTimeout(() => fgRef.current?.zoomToFit(600, 80), 300);
  }, [chains, nodeMap]);

  /* ── filtered chains ── */
  const filteredChains = chains.filter(c => {
    if (filter === "ALL") return true;
    const lastNode = nodeMap[c[c.length - 1]];
    return lastNode?.severity === filter;
  });

  /* ── counts ── */
  const counts = { ALL: chains.length };
  chains.forEach(c => {
    const sev = nodeMap[c[c.length - 1]]?.severity || "LOW";
    counts[sev] = (counts[sev] || 0) + 1;
  });

  /* ── draw node ── */
  const drawNode = useCallback((node, ctx) => {
    const r = node.isVuln ? 14 : 10;

    // glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 8, 0, 2 * Math.PI);
    ctx.fillStyle = node.glow;
    ctx.fill();

    // circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();

    // ring for vuln
    if (node.isVuln) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // hover label
    if (hoverNode?.id === node.id) {
      const text = node.label.length > 28 ? node.label.slice(0, 28) + "…" : node.label;
      const px = 10, py = 6;
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.beginPath();
      ctx.roundRect(node.x + r + 6, node.y - py - 2, tw + px * 2, py * 2 + 4 + 4, 4);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 11px monospace";
      ctx.fillText(text, node.x + r + 6 + px, node.y + py - 2);
    }

    // depth index
    ctx.fillStyle = "white";
    ctx.font = `bold ${node.isVuln ? 9 : 8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.depth + 1, node.x, node.y);
  }, [hoverNode]);

  /* ── draw link ── */
  const drawLink = useCallback((link, ctx) => {
    const s = link.source, t = link.target;
    if (!s?.x || !t?.x) return;

    const isHot = t.severity === "CRITICAL" || t.severity === "HIGH";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = isHot
      ? (SEV[t.severity]?.color + "aa")
      : "rgba(99,102,241,0.4)";
    ctx.lineWidth = isHot ? 2 : 1.2;
    ctx.stroke();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <Background />
        <div className="text-center z-10">
          <div className="text-4xl mb-4 animate-pulse">⛓️</div>
          <p className="text-lg text-cyan-300 font-mono">Building chain graph…</p>
        </div>
      </div>
    );
  }

  const activeChain = filteredChains[activeIdx] || filteredChains[0];
  const activeVuln = activeChain ? nodeMap[activeChain[activeChain.length - 1]] : null;

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <Background />

      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{
        width: 340,
        minWidth: 340,
        background: "rgba(8,10,18,0.88)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(99,102,241,0.2)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            ← Back
          </button>
          <div style={{ fontSize: 12, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>
            Chain Graph
          </div>
          <div style={{ fontSize: 16, color: "#e2e8f0", fontWeight: 700, wordBreak: "break-all" }}>
            {repoName}
          </div>
        </div>

        {/* ── COLOR LEGEND ── */}
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
          background: "rgba(99,102,241,0.04)",
        }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
            Legend
          </div>

          {/* Node types */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, letterSpacing: 1 }}>NODE TYPE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#6366f1",
                  boxShadow: "0 0 6px rgba(99,102,241,0.5)",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Dependency node</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative", width: 20, height: 20, flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                    position: "absolute",
                  }} />
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    border: "1.5px solid #ef4444",
                    opacity: 0.5,
                    position: "absolute",
                    top: -3, left: -3,
                  }} />
                </div>
                <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 4 }}>Vulnerability node (ringed)</span>
              </div>
            </div>
          </div>

          {/* Severity colors */}
          <div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, letterSpacing: 1 }}>SEVERITY COLOR</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: SEV[s].color,
                    boxShadow: `0 0 7px ${SEV[s].color}88`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: SEV[s].color, fontWeight: 600, minWidth: 64 }}>{s}</span>
                  <span style={{ fontSize: 11, color: "#475569" }}>vulnerability</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link types */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, letterSpacing: 1 }}>LINK TYPE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 2, background: "#6366f166", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Safe dependency path</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 2.5, background: "#ef4444aa", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Critical / High path</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, padding: "12px 14px", borderBottom: "1px solid rgba(99,102,241,0.1)", flexWrap: "wrap" }}>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setActiveIdx(0); }}
              style={{
                background: filter === f
                  ? (f === "ALL" ? "rgba(99,102,241,0.3)" : SEV[f]?.color + "33")
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${filter === f
                  ? (f === "ALL" ? "rgba(99,102,241,0.6)" : SEV[f]?.color + "88")
                  : "rgba(255,255,255,0.1)"}`,
                color: filter === f
                  ? (f === "ALL" ? "#a5b4fc" : SEV[f]?.color)
                  : "#94a3b8",
                borderRadius: 5,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {f} {counts[f] !== undefined ? `(${counts[f]})` : ""}
            </button>
          ))}
        </div>

        {/* Chain list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {filteredChains.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginTop: 40 }}>
              No chains found for this filter.
            </div>
          ) : (
            filteredChains.map((chain, i) => {
              const vuln = nodeMap[chain[chain.length - 1]];
              const root = nodeMap[chain[0]];
              const sev = vuln?.severity || "LOW";
              const isActive = i === activeIdx;
              return (
                <div
                  key={i}
                  onClick={() => selectChain(i)}
                  style={{
                    background: isActive
                      ? `${SEV[sev]?.color}18`
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? SEV[sev]?.color + "66" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    marginBottom: 7,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {/* Severity + length */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <SevBadge sev={sev} />
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {chain.length} hops
                    </span>
                  </div>

                  {/* Root → vuln summary */}
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                    <span style={{ color: "#6366f1" }}>
                      {(root?.label || chain[0]).slice(0, 22)}
                    </span>
                    <span style={{ color: "#475569", margin: "0 4px" }}>{"→ … →"}</span>
                    <span style={{ color: SEV[sev]?.color }}>
                      {(vuln?.label || chain[chain.length - 1]).slice(0, 22)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats footer */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(99,102,241,0.15)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}>
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(s => (
            <div key={s} style={{
              background: SEV[s].color + "11",
              border: `1px solid ${SEV[s].color}33`,
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              <div style={{ fontSize: 11, color: SEV[s].color, letterSpacing: 1 }}>{s}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: SEV[s].color }}>
                {counts[s] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: "relative" }}>

        {/* Top bar with active chain info */}
        {activeChain && (
          <div style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(8,10,18,0.85)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${SEV[activeVuln?.severity || "LOW"]?.color}55`,
            borderRadius: 10,
            padding: "10px 20px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
            maxWidth: "70%",
          }}>
            <SevBadge sev={activeVuln?.severity} />
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              {activeChain.map((id, i) => (
                <span key={id}>
                  <span style={{ color: i === activeChain.length - 1 ? SEV[activeVuln?.severity]?.color : "#6366f1" }}>
                    {(nodeMap[id]?.label || id).slice(0, 16)}
                  </span>
                  {i < activeChain.length - 1 && (
                    <span style={{ color: "#334155", margin: "0 4px" }}>→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ══ TOP RIGHT LEGEND ══ */}
        <div style={{
          position: "absolute",
          top: 16,
          right: 20,
          background: "rgba(8,10,18,0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 10,
          padding: "12px 16px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          {/* Dependency */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 13, height: 13, borderRadius: "50%",
              background: "#6366f1",
              boxShadow: "0 0 6px rgba(99,102,241,0.6)",
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Dependency</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "rgba(99,102,241,0.2)" }} />

          {/* Severity colors */}
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 13, height: 13, borderRadius: "50%",
                background: SEV[s].color,
                boxShadow: `0 0 7px ${SEV[s].color}99`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: SEV[s].color, fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Hover detail card */}
        {hoverNode && (
          <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            background: "rgba(8,10,18,0.9)",
            border: `1px solid ${hoverNode.isVuln ? SEV[hoverNode.severity]?.color + "66" : "rgba(99,102,241,0.3)"}`,
            borderRadius: 8,
            padding: "12px 16px",
            zIndex: 20,
            maxWidth: 300,
          }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>
              {hoverNode.isVuln ? "🔴 VULNERABILITY" : "📦 DEPENDENCY"} — hop {hoverNode.depth + 1}
            </div>
            <div style={{ fontSize: 14, color: hoverNode.color, wordBreak: "break-all", fontWeight: 700 }}>
              {hoverNode.label}
            </div>
            {hoverNode.isVuln && (
              <div style={{ marginTop: 7 }}>
                <SevBadge sev={hoverNode.severity} />
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {chains.length === 0 && !loading && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            zIndex: 5,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, color: "#94a3b8" }}>No vulnerability chains found!</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>This repo has no dep → vuln paths.</div>
          </div>
        )}

        {/* Force Graph */}
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            backgroundColor="transparent"
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.35}
            cooldownTicks={120}
            dagMode="lr"
            dagLevelDistance={140}
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