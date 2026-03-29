import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import { useEffect, useState } from "react";
import API from "../api";

const ComparisonChart = ({ repoId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (repoId) fetchHistory();
  }, [repoId]);

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/api/repos/${repoId}/history`);

      const historyArray = res.data.history || res.data || [];

      const formatted = historyArray.map((h) => ({
        version: `v${h.version}`,
        vulnerabilities: h.vulnerabilityCount,
        risk: h.riskScore
      }));

      setData(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data.length) {
    return <p className="text-gray-400">No history yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="version" />
        <YAxis />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="risk"
          stroke="#22d3ee"
          strokeWidth={3}
        />

        <Line
          type="monotone"
          dataKey="vulnerabilities"
          stroke="#f87171"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;