import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import { getGraphData } from "../api";

const RepoAnalysisChart = ({ repoId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (repoId) fetchData();
  }, [repoId]);

  const fetchData = async () => {
    try {
      const res = await getGraphData(repoId);

      const stats = res.data?.stats?.severity;

      const formatted = [
        { severity: "LOW", count: stats?.LOW || 0 },
        { severity: "MEDIUM", count: stats?.MEDIUM || 0 },
        { severity: "HIGH", count: stats?.HIGH || 0 },
        { severity: "CRITICAL", count: stats?.CRITICAL || 0 },
      ];

      setData(formatted);
    } catch (err) {
      console.log("Chart error:", err);
    }
  };

  return (
    <div className="bg-[#07162f] p-6 rounded-xl h-full">
      <h2 className="text-xl font-semibold mb-4">📊 Vulnerability Severity</h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

          <XAxis dataKey="severity" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />

          <Tooltip />

          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RepoAnalysisChart;