import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d"; // ✅ FIXED
import { useParams } from "react-router-dom";
import API from "../api";

const GraphPage = () => {
  const { repoId } = useParams(); // ✅ URL se repoId lo
  const [graph, setGraph] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    if (repoId) fetchGraph();
  }, [repoId]);

  const fetchGraph = async () => {
    try {
      const res = await API.get(`/api/graph/${repoId}`);

      // ✅ IMPORTANT: structure fix
      setGraph({
        nodes: res.data.nodes,
        links: res.data.edges.map(e => ({
          source: e.from,
          target: e.to
        }))
      });

    } catch (err) {
      console.log("Graph fetch error:", err);
    }
  };

  if (!graph)
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Loading Graph...
      </div>
    );

  return (
    <div className="h-screen bg-black relative">

      {/* 🔥 GRAPH */}
      <ForceGraph2D
        graphData={graph}
        nodeLabel={(node) => `${node.label || node.id}`}
        nodeAutoColorBy="type"
        linkColor={() => "#555"}
        linkWidth={1.2}
        onNodeHover={(node) => setHoverNode(node)}
      />

      {/* 🔥 SIDE PANEL */}
      {hoverNode && (
        <div className="absolute right-4 top-4 bg-[#07162f] p-4 rounded-xl w-64 text-white shadow-xl">
          <h2 className="text-lg font-bold">{hoverNode.label}</h2>
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

export default GraphPage;