import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import API from "../api";

const getColor = (severity) => {
  if (severity === "HIGH" || severity === "CRITICAL") return "#ff3b3b";
  if (severity === "MEDIUM") return "#facc15";
  return "#22c55e";
};

const ChainGraph = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const fgRef = useRef();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [repoName, setRepoName] = useState("");

  useEffect(() => {
    fetchGraph();
  }, [repoId]);

  const fetchGraph = async () => {
    try {
      const res = await API.get(`/api/graph/${repoId}?type=chain`);
      const data = res.data;

      if (!data?.nodes || !data?.edges) return;

      // ✅ repo name
      const repoNode = data.nodes.find((n) => n.type === "repo");
      setRepoName(repoNode?.label || "Repository");

      // ❌ remove repo node
      const filteredNodes = data.nodes.filter((n) => n.type !== "repo");

      // 🔥 GROUP BY DEPENDENCY
      const dependencyGroups = {};
      data.edges.forEach((e) => {
        if (!dependencyGroups[e.from]) {
          dependencyGroups[e.from] = [];
        }
        dependencyGroups[e.from].push(e.to);
      });

      const nodes = [];
      const links = [];

      // 🔥 BIG GAP BETWEEN CLUSTERS
     const clusterSpacingX = 1200;
      const centerY = 0;

      let clusterIndex = 0;

      Object.keys(dependencyGroups).forEach((dep) => {

        const baseX = clusterIndex * clusterSpacingX - 1500;

        // 🔥 DEPENDENCY NODE
        nodes.push({
          id: dep,
          name: dep,
          color: "#8b5cf6",
          size: 30,
          fx: baseX,
          fy: centerY,
        });

        const vulns = dependencyGroups[dep];

        // 🔥 VULNERABILITIES AROUND DEPENDENCY
        vulns.forEach((vulnId, i) => {
          const vulnNode = filteredNodes.find((n) => n.id === vulnId);
          if (!vulnNode) return;

          const angle = (i / vulns.length) * 2 * Math.PI;

         const radius = 340;

          const x = baseX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          nodes.push({
            id: vulnNode.id,
            name: vulnNode.label,
            severity: vulnNode.severity,
            color: getColor(vulnNode.severity),
            size: 24,
            fx: x,
            fy: y,
          });

          links.push({
            source: dep,
            target: vulnNode.id,
          });
        });

        clusterIndex++;
      });

      setGraphData({ nodes, links });

    } catch (err) {
      console.log("Graph error:", err);
    }
  };

  useEffect(() => {
  if (fgRef.current && graphData.nodes.length > 0) {
    setTimeout(() => {
     fgRef.current.zoomToFit(400);
      fgRef.current.centerAt(-800, 0, 1000); // shift view LEFT
    }, 300);
  }
}, [graphData]);

  return (
    <div className="h-screen bg-[#020817] text-white relative">

      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
          >
            ⬅ Back
          </button>

          <h1 className="text-xl font-bold text-cyan-400">
            {repoName}
          </h1>
        </div>

        <div className="flex gap-4 text-sm">
          <span className="text-green-400">● Low</span>
          <span className="text-yellow-400">● Medium</span>
          <span className="text-red-400">● High</span>
        </div>
      </div>

      {/* GRAPH */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#020817"

        // 🔒 FULLY FIXED GRAPH
        enableNodeDrag={false}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        d3AlphaDecay={1}
        d3VelocityDecay={1}
        cooldownTicks={0}

        nodeCanvasObject={(node, ctx) => {
          // glow
          ctx.shadowBlur = 35;
          ctx.shadowColor = node.color;

          // main circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();

          // highlight
          ctx.beginPath();
          ctx.arc(node.x - 4, node.y - 4, node.size / 3, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fill();

          ctx.shadowBlur = 0;
        }}

        linkColor={() => "rgba(200,200,200,0.4)"}
        linkWidth={2.5}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}

        onNodeHover={(node) => setHoverNode(node)}
      />

      {/* HOVER CARD */}
      {hoverNode && (
        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-cyan-400/30 px-6 py-4 rounded-2xl shadow-2xl text-sm min-w-[220px]">
          <div className="text-cyan-300 font-semibold text-lg">
            📦 {hoverNode.name}
          </div>

          {hoverNode.severity && (
            <div className="mt-2 text-gray-300">
              Severity:
              <span
                className={`ml-2 font-bold ${
                  hoverNode.severity === "HIGH"
                    ? "text-red-400"
                    : hoverNode.severity === "MEDIUM"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {hoverNode.severity}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChainGraph;