import { useEffect, useState } from "react";
import API from "../api";

const Comparison = ({ repoId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, [repoId]);

  const fetchComparison = async () => {
    try {
      const res = await API.get(`/api/repos/${repoId}/diff`);
      setData(res.data);
    } catch (err) {
      console.log("Comparison error:", err.message);
    }
  };

  if (!data)
    return (
      <div className="bg-[#07162f] p-6 rounded-xl mt-6">
        No comparison data
      </div>
    );

  return (
    <div className="bg-[#07162f] p-6 rounded-xl mt-6">
      <h2 className="text-xl mb-4">📈 Version Comparison</h2>

      <div className="flex gap-6">
        <div className="text-red-400">
          ❌ New: {data.newVulnerabilities}
        </div>

        <div className="text-green-400">
          ✅ Fixed: {data.fixedVulnerabilities}
        </div>

        <div>
          Trend: {data.trend === "up" ? "📈" : "📉"}
        </div>
      </div>
    </div>
  );
};

export default Comparison;