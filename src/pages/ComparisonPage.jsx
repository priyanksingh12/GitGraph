import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import API from "../api";

import PieComparison from "../components/PieComparison";
import SeverityBarGraph from "../components/SeverityBarGraph";

const ComparisonPage = () => {
  const { repoId } = useParams();

  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    fetchVulnerabilities();
  }, [repoId]);

  const fetchVulnerabilities = async () => {
    try {
      const vulnRes = await API.get(`/api/vulnerabilities/${repoId}`);
      setVulnerabilities(vulnRes.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-10">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold">📊 Repository Comparison</h1>
      </motion.div>

      {/* 🔥 BLOCK 1 - Pie Charts (fetches its own data) */}
      <div className="bg-white/5 p-6 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-4">🥧 Commit Breakdown</h2>
        <PieComparison repoId={repoId} />
      </div>

      {/* 🔥 BLOCK 2 - Severity Bar Graph */}
      <div className="bg-white/5 p-6 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-4">📈 Vulnerability Severity</h2>
        <SeverityBarGraph vulnerabilities={vulnerabilities} />
      </div>

    </div>
  );
};

export default ComparisonPage;