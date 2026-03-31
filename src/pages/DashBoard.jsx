import { useEffect, useState, useRef } from "react";

import { useNavigate, useParams,useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";

import SeverityBarGraph from "../components/SeverityBarGraph";
import {
  getCurrentUser,
  getGithubRepos,
  addRepo,
  getDashboard,
} from "../api";

import API from "../api";
import socket from "../socket";
import ReportButton from "../components/ReportButton";


/* ================= SOCKET (FIXED) ================= */


const Dashboard = () => {
  const navigate = useNavigate();
  const { repoId: urlRepoId } = useParams();

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [topVulns, setTopVulns] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(urlRepoId || null);

  const [loading, setLoading] = useState(true);
  const [reposLoaded, setReposLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
const [allVulns, setAllVulns] = useState([]);
const [graphVersion, setGraphVersion] = useState(0);

  const intervalRef = useRef(null);
  const currentVersionRef = useRef(null);

const location = useLocation();

       const redirectUrl = `${window.location.origin}/dashboard`;

  /* ================= INIT ================= */
  useEffect(() => {
    

    fetchUser();

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  /* ================= URL LOAD ================= */
useEffect(() => {
  if (!urlRepoId) return;

  console.log("🔥 Loading repo from URL:", urlRepoId);

  setSelectedRepoId(urlRepoId);

}, [urlRepoId]);

  /* ================= AUTO FETCH REPOS ================= */
  useEffect(() => {
    if (
      user?.githubUsername &&
      user?.installationId &&
      !reposLoaded &&
      !selectedRepoId
    ) {
      console.log("🚀 Auto fetching repos...");
      fetchRepos();
    }
  }, [user]);


  useEffect(() => {
  if (!selectedRepoId) return;

  console.log("🎧 Listening for repo:", selectedRepoId);

  listenForScan(selectedRepoId);

}, [selectedRepoId]);


  useEffect(() => {
  // When user comes back from GitHub install
  if (location.search.includes("installation_id")) {
    console.log("🔥 Detected installation, refreshing user...");
    fetchUser(); // 🔥 re-fetch user so installationId updates
  }
}, [location]);

  /* ================= USER ================= */
  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      console.log("✅ USER:", res.data);
      setUser(res?.data?.user);
    } catch (err) {
      console.log("❌ User fetch failed", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REPOS ================= */
  const fetchRepos = async () => {
    try {
      if (!user?.installationId) {
        console.log("❌ Installation missing → cannot fetch repos");
        return;
      }

      console.log("🚀 Fetching repos for:", user.githubUsername);

      const res = await getGithubRepos();

      console.log("✅ Repo response:", res.data);

      setRepos(res?.data?.repositories || []);
      setReposLoaded(true);
    } catch (err) {
      console.log("❌ Repo fetch failed:", err.response?.data || err.message);
    }
  };

 const fetchTopVulnerabilities = async (repoId) => {
  try {
    const res = await API.get(`/api/vulnerabilities/${repoId}`);

    const vulns = res.data.vulnerabilities || res.data || [];

    setTopVulns(vulns.slice(0, 3)); // existing
    setAllVulns(vulns); // 🔥 ADD THIS
  } catch (err) {
    console.log("Top vuln error:", err);
  }
};

  /* ================= SCAN ================= */
  const listenForScan = (repoId) => {
    if (!socket) return;

     if (currentVersionRef.current === null) {
  currentVersionRef.current = 0;
}

    socket.emit("joinRepoRoom", repoId);

const eventName = `scan-${repoId}`;
console.log("🎧 Listening event:", eventName);

socket.off(eventName);

const handler = (data) => {
  console.log("🔥 SOCKET UPDATE RECEIVED", data);

  updateDashboard(data);

  setGraphVersion(prev => prev + 1);
  fetchTopVulnerabilities(repoId);

  currentVersionRef.current = data.repo?.scanCount;

  setIsAnalyzing(false);
  clearInterval(intervalRef.current);
};

socket.on(eventName, handler);

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await getDashboard(repoId);
        const data = res?.data;

        if (!data) return;

      if (
  currentVersionRef.current &&
  data.repo.scanCount > currentVersionRef.current
) {
  updateDashboard(data);
  currentVersionRef.current = data.repo.scanCount;

  // 🔥 ADD THESE
  setGraphVersion(prev => prev + 1);
  fetchTopVulnerabilities(repoId);
}

        if (data.repo.status === "scanned") {
          updateDashboard(data);
          setIsAnalyzing(false);
          setGraphVersion(prev => prev + 1);
fetchTopVulnerabilities(repoId);
        }
      } catch {
        console.log("Polling error");
      }
    }, 3000);
  };

  /* ================= UPDATE ================= */
  const updateDashboard = (data) => {
    setDashboardData({
      repo: data.repo,
      riskScore: data.stats?.riskScore ?? 0,
      dependencies: data.stats?.dependencies ?? 0,
      vulnerabilities: data.stats?.vulnerabilities ?? 0,
      aiInsights: data.aiInsights || [],
    });
  };

  /* ================= ADD REPO ================= */
  const handleAddRepo = async (repo) => {
    try {
      setIsAnalyzing(true);
      setDashboardData(null);

      const res = await addRepo({ url: repo.html_url });
      const repoId = res?.data?.repo?._id;

      setSelectedRepoId(repoId);
      navigate(`/dashboard/${repoId}`);

      setTimeout(() => listenForScan(repoId), 500);
    } catch (err) {
      console.log("❌ Add repo error:", err.response?.data || err.message);
      setIsAnalyzing(false);
    }
  };

  /* ================= RESCAN ================= */
  const handleRescan = () => {
    if (!selectedRepoId) return;
    setIsAnalyzing(true);
    listenForScan(selectedRepoId);
  };

  /* ================= BACK ================= */
  const handleBack = () => {
    clearInterval(intervalRef.current);
    setSelectedRepoId(null);
    setDashboardData(null);
    navigate("/dashboard");
  };

  /* ================= HEALTH ================= */
  const health = Math.max(0, 100 - (dashboardData?.riskScore || 0) * 10);

  /* ================= STATES ================= */

  if (loading)
    return <div className="text-white p-10">Loading...</div>;

  // CONNECT GITHUB

 if (!user?.githubUsername)
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-[#07162f] rounded-3xl p-10 text-center shadow-2xl border border-cyan-500/10"
      >
        {/* ICON */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex justify-center mb-4"
        >
          <FaGithub className="text-6xl text-cyan-400" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3">
          Connect your GitHub
        </h1>

        <p className="text-gray-400 mb-6">
          Securely link your GitHub account to start analyzing repositories,
          detect vulnerabilities, and generate AI insights.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            window.location.href =
              `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
          }}
          className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-3 rounded-xl transition w-full flex items-center justify-center gap-2"
        >
          <FaGithub />
          Connect GitHub
        </motion.button>

        <p className="text-xs text-gray-500 mt-4">
          OAuth powered • Secure connection
        </p>
      </motion.div>
    </div>
  );

  // INSTALL APP
  
  if (!user?.installationId)
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-[#07162f] rounded-3xl p-10 text-center shadow-2xl border border-yellow-500/10"
      >
        {/* ICON */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex justify-center mb-4"
        >
          <FaGithub className="text-6xl text-yellow-400" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3">
          Install GitHub App
        </h1>

        <p className="text-gray-400 mb-6">
          Install our GitHub App to allow secure access to your repositories
          for dependency analysis and vulnerability detection.
        </p>


<motion.a
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  href={`https://github.com/apps/GraphGuardians/installations/new?redirect_uri=${redirectUrl}`}
  className="block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-xl transition w-full"
>
  ⚡ Install App on GitHub
</motion.a>

        <p className="text-xs text-gray-500 mt-4">
          Choose repositories you want to analyze
        </p>
      </motion.div>
    </div>
  );

  // FETCH REPOS
  if (!reposLoaded && !selectedRepoId)
    return (
      <div className="text-white p-10">
        <button
          onClick={fetchRepos}
          className="bg-cyan-400 text-black px-4 py-2 rounded"
        >
          Fetch Repos
        </button>
      </div>
    );

  // SELECT REPO
  if (!selectedRepoId)
    return (
      <div className="p-10 text-white">
        <h1 className="text-3xl mb-6">Select Repo</h1>

        <div className="grid md:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-[#07162f] p-4 rounded-xl hover:scale-105 transition"
            >
              <h2 className="font-semibold">{repo.name}</h2>

              <button
                onClick={() => handleAddRepo(repo)}
                className="mt-3 bg-cyan-400 text-black px-3 py-1 rounded"
              >
                Analyze
              </button>
            </div>
          ))}
        </div>
      </div>
    );

  // ANALYZING
  if (isAnalyzing)
  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col items-center justify-center px-6">

      {/* 🔷 Animated Diamond */}
      <motion.div
        animate={{ rotate: [0, 45, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="relative mb-10"
      >
        <div className="w-40 h-40 border border-cyan-400/20 rotate-45 rounded-xl flex items-center justify-center">
          <div className="w-16 h-16 bg-[#07162f] rounded-lg flex items-center justify-center text-cyan-400">
            ⏳
          </div>
        </div>

        {/* glow */}
        <div className="absolute inset-0 bg-cyan-400/10 blur-2xl rounded-full"></div>
      </motion.div>

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-2 text-center">
        Analyzing Repository...
      </h1>

      <p className="text-gray-400 mb-6 text-center max-w-md">
        Extracting dependency graph and scanning for vulnerabilities...
      </p>

      {/* 🔥 DYNAMIC PROGRESS BAR */}
      <div className="w-full max-w-md bg-[#07162f] rounded-full h-3 overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: ["20%", "50%", "80%", "100%"] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* 🔍 LIVE LOGS */}
      <div className="bg-[#07162f] p-4 rounded-xl w-full max-w-md text-xs text-gray-300 font-mono space-y-2 border border-cyan-400/10">

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ delay: 0.2 }}
        >
          [0.82s] Fetching manifest files...
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ delay: 0.8 }}
        >
          [1.45s] Resolving transitive dependencies...
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ delay: 1.4 }}
          className="text-cyan-400"
        >
          [2.13s] Mapping nodes: 1,248 identified
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ delay: 2 }}
          className="text-yellow-400"
        >
          [RUNNING] Scanning vulnerabilities...
        </motion.p>
      </div>

      {/* FOOTER */}
      <div className="mt-8 text-xs text-gray-500">
        SENTINEL INTELLIGENCE NODE • US-EAST-ALPHA
      </div>
    </div>
  );

  if (!dashboardData)
    return <div className="text-white p-10">Loading dashboard...</div>;

  /* ================= FINAL UI ================= */
return (
  <div className="min-h-screen bg-[#080c18] text-[#f0f4ff] flex font-sans">

    {/* ================= SIDEBAR ================= */}
    <aside className="hidden md:flex flex-col w-[260px] bg-[#0d1225] border-r border-[#1a2240] p-6 justify-between">

      <div>
        <h1 className="text-2xl font-semibold mb-10 tracking-wide">⚡ Sentinel</h1>

        <nav className="space-y-3 text-[15px]">

          <div className="p-3 rounded-lg bg-[#121938] border-l-4 border-[#00cdd4] cursor-pointer">
            Dashboard
          </div>

          <div onClick={() => navigate(`/vulnerabilities/${selectedRepoId}`)} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Vulnerabilities
          </div>

          <div className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Reports
          </div>

          <div onClick={() => navigate(`/chain/${selectedRepoId}`)} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Chain Graph
          </div>

          <div onClick={() => navigate(`/comparison/${selectedRepoId}`)} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Comparison
          </div>

          <div onClick={handleRescan} className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Rescan
          </div>

          <div className="p-3 hover:bg-[#121938] rounded-lg cursor-pointer">
            Download Report
          </div>

        </nav>
      </div>

      <div className="border-t border-[#1a2240] pt-4">
        <p className="text-base">{user?.githubUsername}</p>
        <p className="text-sm text-[#6b7fa3]">Developer</p>
      </div>
    </aside>

    {/* ================= MAIN ================= */}
    <div className="flex-1 flex flex-col overflow-x-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-12 py-8 border-b border-[#1a2240]">
        <h1 className="text-4xl font-semibold tracking-wide">
          Security Overview
        </h1>

        <button
          onClick={handleBack}
         className="px-6 py-2.5 rounded-xl 
bg-gradient-to-r from-[#00cdd4]/10 to-[#3b82f6]/10 
text-[#00cdd4] 
border border-[#00cdd4]/30 
hover:from-[#00cdd4]/20 hover:to-[#3b82f6]/20 
hover:scale-105 transition-all duration-300 
shadow-sm hover:shadow-[#00cdd4]/20"
        >
          ← Back
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-12 space-y-14">

        {/* HERO STATS */}
        <div className="grid md:grid-cols-4 gap-10">

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#b400d4]">
            <p className="text-5xl font-bold">{dashboardData.riskScore}</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Risk Score</p>
          </div>

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#ff4560]">
            <p className="text-5xl font-bold">{dashboardData.vulnerabilities}</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Vulnerabilities</p>
          </div>

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#ff9f43]">
            <p className="text-5xl font-bold">{dashboardData.dependencies}</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Dependencies</p>
          </div>

          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] border-l-4 border-[#3b82f6]">
            <p className="text-5xl font-bold">{health}%</p>
            <p className="text-[#6b7fa3] mt-3 text-base">Health</p>
          </div>

        </div>

        {/* NETWORK MAP */}
        <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
          <h2 className="text-2xl mb-8 font-semibold">Network Map</h2>

          <div className="w-full h-[480px]">

           <SeverityBarGraph
  key={graphVersion}
  vulnerabilities={allVulns}
/>


          </div>
        </div>

        {/* VULNS + ALERTS */}
        <div className="grid md:grid-cols-4 gap-8">

          <div className="md:col-span-3 bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
            <h2 className="text-3xl mb-8 font-semibold">Recent Vulnerabilities</h2>

            <div className="space-y-6">
              {topVulns.map((v, i) => (
                <div key={i} className="flex justify-between items-center h-[64px] border-b border-[#1a2240]">

                  <span className="text-lg font-medium">
                    CVE-{i + 1234}
                  </span>

                  <span className="text-[#6b7fa3] text-base w-[280px] truncate">
                    {v.fix}
                  </span>

                  <span className={`text-lg font-semibold ${
                    v.severity === "HIGH"
                      ? "text-red-400"
                      : v.severity === "MEDIUM"
                      ? "text-orange-400"
                      : "text-yellow-400"
                  }`}>
                    {v.severity}
                  </span>

                </div>
              ))}
            </div>
          </div>

          {/* ALERTS */}
          <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240] flex flex-col justify-center items-center">
            <p className="text-6xl font-bold text-red-400">{dashboardData.vulnerabilities}</p>
            <p className="text-[#6b7fa3] mt-3 text-lg">Alerts</p>
          </div>

        </div>

        {/* TOP EXPOSURES (FIXED LOGIC) */}
        <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
          <h2 className="text-2xl mb-8 font-semibold">Top Exposures</h2>

          <div className="space-y-6">
            {topVulns.map((v, i) => {

              const width =
                v.severity === "HIGH"
                  ? 90
                  : v.severity === "MEDIUM"
                  ? 60
                  : 30;

              return (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-base">
                    <span>{v.package}</span>
                    <span>{v.severity}</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#1a2240] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        background:
                          "linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444)"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI */}
        <div className="bg-[#0d1225] p-12 rounded-2xl border border-[#1a2240]">
          <h2 className="text-2xl mb-6 font-semibold">🤖 AI Insights</h2>
        </div>

        {/* 🔥 PREMIUM BUTTONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <button className="py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 hover:scale-105 transition">
            Chain Graph
          </button>

          <button className="py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 hover:scale-105 transition">
            Comparison
          </button>

          <button className="py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 hover:scale-105 transition">
            Rescan
          </button>


  <ReportButton repoId={selectedRepoId} />


        </div>

      </div>
    </div>
  </div>
);
};

export default Dashboard;