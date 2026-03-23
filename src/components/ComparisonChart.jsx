import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import { useEffect, useState } from "react";
import API from "../api";

const ComparisonChart = ({ repoId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await API.get(`/api/repos/${repoId}/history`);

    const formatted = res.data.map((h, i) => ({
      version: `v${h.version}`,
      vulnerabilities: h.vulnerabilityCount,
      risk: h.riskScore
    }));

    setData(formatted);
  };

  if (!data.length) return null;

  return (
    <div className="bg-[#07162f] p-5 rounded-xl mt-6">
      <h2 className="mb-4">📈 Risk Trend</h2>

      <LineChart width={500} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="version" />
        <YAxis />
        <Tooltip />

        <Line type="monotone" dataKey="risk" />
        <Line type="monotone" dataKey="vulnerabilities" />
      </LineChart>
    </div>
  );
};

export default ComparisonChart;