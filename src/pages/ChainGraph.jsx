import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import API from "../api";

const ChainGraph = () => {
  const { repoId } = useParams();

  const [graphData, setGraphData] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    if (repoId) fetchGraph();
  }, [repoId]);

  const fetchGraph = async () => {
    try {
      const res = await API.get(`/api/graph/${repoId}`);

      const { nodes, chains } = res.data;

      // 🔥 Only include nodes that are part of chains
      const chainNodeIds = new Set();
      chains.forEach(e => {
        chainNodeIds.add(e.from);
        chainNodeIds.add(e.to);
      });

      const filteredNodes = nodes.filter(n =>
        chainNodeIds.has(n.id)
      );

      const links = chains.map(e => ({
        source: e.from,
        target: e.to,
      }));

      setGraphData({
        nodes: filteredNodes,
        links,
      });

    } catch (err) {
      console.log("Chain graph error:", err);
    }
  };

  if (!graphData)
    return (
      <div className="text-white p-10">
        Loading Chain Graph...
      </div>
    );

  return (
    <div className="h-screen bg-black relative">

      {/* TITLE */}
      <h1 className="text-white p-4 text-xl">
        💀 Vulnerable Dependency Chains
      </h1>

      {/* GRAPH */}
      <ForceGraph2D
        graphData={graphData}

        nodeLabel={(node) => `${node.label || node.id}`}

        nodeCanvasObject={(node, ctx, globalScale) => {
          const size = node.type === "vulnerability" ? 8 : 5;

          ctx.fillStyle =
            node.type === "vulnerability"
              ? "#ff0000"
              : "#00ffc3";

          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();

          // 🔥 label
          const fontSize = 10 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "white";
          ctx.fillText(node.id, node.x + 6, node.y + 2);
        }}

        linkColor={() => "#ff4d4f"} // 🔥 red chain
        linkWidth={2}

        onNodeHover={(node) => setHoverNode(node)}
      />

      {/* SIDE PANEL */}
      {hoverNode && (
        <div className="absolute right-4 top-4 bg-[#07162f] p-4 rounded-xl w-64 text-white shadow-xl">
          <h2 className="text-lg font-bold">
            {hoverNode.label || hoverNode.id}
          </h2>

          <p>Type: {hoverNode.type}</p>

          {hoverNode.severity && (
            <p className="text-red-400">
              Severity: {hoverNode.severity}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChainGraph;