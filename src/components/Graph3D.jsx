import ForceGraph2D from "react-force-graph-2d";

const Graph3D = ({ graph }) => {
  if (!graph) return null;

  return (
    <div className="h-[600px] bg-[#07162f] rounded-xl">
      <ForceGraph2D
        graphData={{
          nodes: graph.nodes,
          links: graph.edges,
        }}
        nodeLabel="label"
        nodeAutoColorBy="type"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
      />
    </div>
  );
};

export default Graph3D;