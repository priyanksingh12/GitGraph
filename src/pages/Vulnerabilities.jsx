import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const getSeverityColor = (severity) => {
  if (severity === "HIGH") return "text-red-500";
  if (severity === "MEDIUM") return "text-yellow-400";
  return "text-green-400";
};

const Vulnerabilities = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();

  const [vulns, setVulns] = useState([]);

  useEffect(() => {
    fetchVulns();
  }, [repoId]);

  const fetchVulns = async () => {
    try {
      const res = await API.get(`/api/vulnerabilities/${repoId}`);

      // ✅ FIX IMPORTANT
      setVulns(res.data.vulnerabilities || res.data || []);
    } catch (err) {
      console.log("Vuln error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-10">

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
      >
        ⬅ Back
      </button>

      <h1 className="text-3xl font-bold mb-8">
        ⚠️ Vulnerabilities Report
      </h1>

      {/* ✅ TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 rounded-lg overflow-hidden">

          <thead className="bg-[#07162f] text-gray-300 text-left">
            <tr>
              <th className="p-4">📦 Package</th>
              <th className="p-4">⚠ Severity</th>
              <th className="p-4">📝 Description</th>
              <th className="p-4">🛠 Fix</th>
            </tr>
          </thead>

          <tbody>
            {vulns.map((v, i) => (
              <tr
                key={i}
                className="border-t border-gray-700 hover:bg-[#07162f] transition"
              >
                {/* PACKAGE */}
                <td className="p-4 font-semibold">
                  {v.package}
                  <div className="text-xs text-gray-400">
                    v{v.version}
                  </div>
                </td>

                {/* SEVERITY */}
                <td className={`p-4 font-bold ${getSeverityColor(v.severity)}`}>
                  {v.severity}
                </td>

                {/* DESCRIPTION 🔥 */}
                <td className="p-4 text-sm text-gray-300 max-w-md">
                  {v.description}
                </td>

                {/* FIX */}
                <td className="p-4 text-blue-400">
                  {v.fix}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* EMPTY STATE */}
      {vulns.length === 0 && (
        <div className="text-gray-400 mt-6">
          No vulnerabilities found 🚀
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;