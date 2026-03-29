import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useEffect, useState } from "react";
import API from "../api";

const COLORS = ["#22d3ee", "#f87171", "#facc15"];

const PieComparison = ({ repoId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchLatest();
  }, [repoId]);

  const fetchLatest = async () => {
    try {
      const res = await API.get(`/api/dashboard/${repoId}`);

      const stats = res.data?.stats;

      const formatted = [
        { name: "Dependencies", value: stats?.dependencies || 0 },
        { name: "Vulnerabilities", value: stats?.vulnerabilities || 0 },
        { name: "Risk", value: stats?.riskScore || 0 }
      ];

      setData(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data.length) {
    return <p className="text-gray-400">No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={90}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieComparison;