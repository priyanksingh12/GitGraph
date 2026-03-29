import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import API from "../api";
import Background from "../components/BackgroundCanvas";

/* =========================
🎨 COLOR MAPPER
========================= */
const getColor = (severity) => {
if (severity === "CRITICAL") return "#ff0000";
if (severity === "HIGH") return "#ff4d4d";
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
const [separators, setSeparators] = useState([]);

useEffect(() => {
  fetchGraph();
 
}, [repoId]);


const fetchGraph = async () => {
try {
const res = await API.get(`/api/graph/${repoId}?type=chain`);
const data = res.data;

const repoNode =
  data?.nodes?.find((n) => n.type === "repo") ||
  data?.nodes?.find((n) => n.label?.includes("/"));

setRepoName(repoNode?.label || "Repository");

if (!data?.nodes || !data?.edges) return;

const filteredNodes = data.nodes.filter((n) => n.type !== "repo");

const dependencyGroups = {};
const chainDeps = new Set();

data.edges.forEach((e) => {
if (e.type === "depends_on") {
chainDeps.add(e.to);
}

if (e.type !== "vuln" && e.type !== "has_vulnerability") return;

if (!dependencyGroups[e.from]) {
dependencyGroups[e.from] = [];
}

dependencyGroups[e.from].push(e.to);
});

filteredNodes
.filter((n) => n.type === "dependency")
.forEach((dep) => {
if (!dependencyGroups[dep.id]) {
dependencyGroups[dep.id] = [];
}
});



const nodes = [];
const links = [];
const nodeSet = new Set();

const addNode = (node) => {
if (!nodeSet.has(node.id)) {
nodes.push(node);
nodeSet.add(node.id);
}
};

const clusterSpacingX = 1600;
const centerY = 0;

let clusterIndex = 0;
const separatorPositions = [];

Object.keys(dependencyGroups).forEach((dep, index) => {
const baseX = index * clusterSpacingX - 1000;

if (index > 0) {
separatorPositions.push(baseX - clusterSpacingX / 2);
}

const depNodeData = filteredNodes.find((n) => n.id === dep);

addNode({
id: dep,
name: depNodeData?.label || dep,
color: chainDeps.has(dep) ? "#00eaff" : "#8b5cf6",
size: chainDeps.has(dep) ? 55 : 45,
isChain: chainDeps.has(dep),
fx: baseX,
fy: centerY,
});

const vulns = dependencyGroups[dep];

vulns.forEach((vulnId, i) => {
const vulnNode = filteredNodes.find((n) => n.id === vulnId);
if (!vulnNode) return;

const angle = (i / (vulns.length || 1)) * 2 * Math.PI;
const radius = 500;

const x = baseX + radius * Math.cos(angle);
const y = centerY + radius * Math.sin(angle);

addNode({
id: vulnNode.id,
name: vulnNode.label,
severity: vulnNode.severity,
color: getColor(vulnNode.severity),
size: 35,
fx: x,
fy: y,
});

links.push({
source: dep,
target: vulnNode.id,
label: depNodeData?.label || dep,
});

});

clusterIndex++;
});

setSeparators(separatorPositions);
setGraphData({ nodes, links });

} catch (err) {
console.log("Graph error:", err);
}
};




useEffect(() => {
if (fgRef.current && graphData.nodes.length > 0) {
setTimeout(() => {
fgRef.current.zoomToFit(800);
}, 300);
}
}, [graphData]);

return (

<div className="h-screen text-white relative">

{/* 🌌 BACKGROUND */} <Background />

{/* HEADER */}

<div className="absolute top-0 left-0 w-full z-[100] p-4 flex justify-between items-center bg-black/40 backdrop-blur-md pointer-events-auto">
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
    <span className="text-cyan-400">● Chain</span>
  </div>
</div>

{/* GRAPH */}

<div className="absolute inset-0 z-10">
  <ForceGraph2D
    ref={fgRef}
    graphData={graphData}
    backgroundColor="transparent" // ✅ FIX


enableNodeDrag={false}
enablePanInteraction={true}
enableZoomInteraction={true}
d3AlphaDecay={1}
d3VelocityDecay={1}
cooldownTicks={0}

nodeCanvasObjectMode={() => "after"}

nodeCanvasObject={(node, ctx) => {
  const isHover = hoverNode?.id === node.id;

  if (node.id === graphData.nodes[0]?.id) {
    ctx.save();
    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00eaff";

    separators.forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, -3000);
      ctx.lineTo(x, 3000);
      ctx.stroke();
    });

    ctx.restore();
  }

  ctx.shadowBlur = node.isChain ? 120 : isHover ? 90 : 60;
  ctx.shadowColor = node.color;

  ctx.beginPath();
  ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
  ctx.fillStyle = node.color;
  ctx.fill();

  ctx.shadowBlur = 0;
}}

linkCanvasObject={(link, ctx) => {
  const { source, target } = link;

  ctx.beginPath();
  ctx.moveTo(source.x, source.y);
  ctx.lineTo(target.x, target.y);
  ctx.strokeStyle = "rgba(200,200,200,0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();

  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  const label = link.label || "";
  if (!label) return;

  ctx.font = "bold 32px Sans-Serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textWidth = ctx.measureText(label).width;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(midX - textWidth / 2 - 10, midY - 16, textWidth + 20, 32);

  ctx.fillStyle = "#00eaff";
  ctx.fillText(label, midX, midY);
}}

onNodeHover={(node) => setHoverNode(node)}

onNodeClick={(node) => {
  fgRef.current.centerAt(node.x, node.y, 500);
  fgRef.current.zoom(2, 500);
}}


/>

</div>

{/* HOVER CARD */}
{hoverNode && (

  <div className="absolute bottom-6 left-6 z-[100] bg-black/70 backdrop-blur-xl border border-cyan-400/30 px-6 py-4 rounded-2xl shadow-2xl text-sm min-w-[220px]">
    <div className="text-cyan-300 font-semibold text-lg">
      📦 {hoverNode.name}
    </div>

```
{hoverNode.severity && (
  <div className="mt-2 text-gray-300">
    Severity:
    <span className="ml-2 font-bold text-red-400">
      {hoverNode.severity}
    </span>
  </div>
)}

{hoverNode.isChain && (
  <div className="mt-2 text-cyan-400 font-bold">
     Chain Dependency
  </div>
)}


  </div>
)}
</div>
);
};

export default ChainGraph;
