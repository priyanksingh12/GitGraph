import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ForceGraph3D from "react-force-graph-3d";
import API from "../api";

const Graph3D = () => {
  const { repoId } = useParams();
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    try {
      const res = await API.get(`/api/graph/${repoId}`);

      const { nodes, edges } = res.data;

      const links = edges.map(e => ({
        source: e.from,
        target: e.to,
      }));

      setGraphData({ nodes, links });

    } catch (err) {
      console.log("❌ Graph fetch error");
    }
  };

  if (!graphData)
    return <div className="text-white p-10">Loading 3D Graph...</div>;

  return (
    <div className="h-screen bg-black">

      <div className="absolute z-10 p-4 text-white">
        <h1 className="text-xl font-bold">🌌 3D Dependency Graph</h1>
        <p className="text-sm text-gray-400">
          Drag • Zoom • Explore
        </p>
      </div>

      <ForceGraph3D
        graphData={graphData}

        nodeLabel="label"

        nodeAutoColorBy="type"

        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}

        nodeThreeObjectExtend={true}

        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.label);
          sprite.color =
            node.type === "vulnerability" ? "red" : "white";
          sprite.textHeight = 8;
          return sprite;
        }}
      />
    </div>
  );
};

export default Graph3D;