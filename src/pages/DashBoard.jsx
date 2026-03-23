import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCurrentUser,
  getGithubRepos,
  addRepo,
  getDashboard,
} from "../api";

// ✅ Components
import StatsCard from "../components/StatsCard";
import HealthBar from "../components/HealthBar";
import SeverityChart from "../components/SeverityChart";
import AIChat from "../components/AIChat";
import ReportButton from "../components/ReportButton";
import Comparison from "../components/Comparison";

/* ================= SOCKET (FIXED) ================= */
let socket;

const Dashboard = () => {
  const navigate = useNavigate();
  const { repoId: urlRepoId } = useParams();

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedRepoId, setSelectedRepoId] = useState(urlRepoId || null);

  const [loading, setLoading] = useState(true);
  const [reposLoaded, setReposLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const intervalRef = useRef(null);
  const currentVersionRef = useRef(null);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_BASE_URL, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("✅ socket connected:", socket.id);
      });
    }

    fetchUser();

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  /* ================= URL LOAD ================= */
  useEffect(() => {
    if (urlRepoId && urlRepoId !== selectedRepoId) {
      setSelectedRepoId(urlRepoId);
      listenForScan(urlRepoId);
    }
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

  /* ================= SCAN ================= */
  const listenForScan = (repoId) => {
    if (!socket) return;

    socket.emit("joinRepoRoom", repoId);
    socket.off(`scan-${repoId}`);

    socket.on(`scan-${repoId}`, (data) => {
      console.log("🔥 SOCKET UPDATE");

      updateDashboard(data);
      currentVersionRef.current = data.repo?.scanCount;

      setIsAnalyzing(false);
      clearInterval(intervalRef.current);
    });

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
        }

        if (data.repo.status === "scanned") {
          updateDashboard(data);
          setIsAnalyzing(false);
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
      <div className="text-white p-10">
        <button
          onClick={() => {
            window.location.href =
              `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
          }}
          className="bg-cyan-400 text-black px-4 py-2 rounded"
        >
          Connect GitHub
        </button>
      </div>
    );

  // INSTALL APP
  if (!user?.installationId)
    return (
      <div className="text-white p-10 flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold">
          Install GitHub App to Continue
        </h1>

        <a
          href="https://github.com/apps/GraphGuardians/installations/new"
          className="bg-yellow-400 text-black px-4 py-2 rounded"
        >
          Install GitHub App
        </a>
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
      <div className="text-white flex flex-col justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
        <h1 className="text-xl">Analyzing Repository...</h1>
      </div>
    );

  if (!dashboardData)
    return <div className="text-white p-10">Loading dashboard...</div>;

  /* ================= FINAL UI ================= */

  return (
    <div className="min-h-screen bg-[#020817] text-white p-8">

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {dashboardData.repo?.name}
          </h1>
          <p className="text-gray-400">
            v{dashboardData.repo?.scanCount} • {dashboardData.repo?.status}
          </p>
        </div>

        <button onClick={handleBack} className="text-sm underline">
          ← Back
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatsCard title="Risk Score" value={dashboardData.riskScore} />
        <StatsCard title="Dependencies" value={dashboardData.dependencies} />
        <StatsCard title="Vulnerabilities" value={dashboardData.vulnerabilities} />
        <StatsCard title="Health" value={`${health}%`} />
      </div>

      {/* HEALTH */}
      <div className="mt-6">
        <HealthBar value={health} />
      </div>

      {/* CHART + ALERT */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <SeverityChart repoId={selectedRepoId} />

        <div className="bg-[#07162f] p-6 rounded-xl">
          <h2 className="text-lg mb-2">🚨 Alerts</h2>
          <p className="text-red-400 font-semibold">
            {dashboardData.vulnerabilities} vulnerabilities detected
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={() => navigate(`/graph/${selectedRepoId}`)}
          className="bg-cyan-400 text-black px-4 py-2 rounded"
        >
          🌳 Graph
        </button>

        <button
          onClick={() => navigate(`/chain/${selectedRepoId}`)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          💀 Chain Graph
        </button>

        <button
          onClick={() => navigate(`/vulnerabilities/${selectedRepoId}`)}
          className="bg-yellow-400 text-black px-4 py-2 rounded"
        >
          ⚠️ Vulnerabilities
        </button>

        <button
          onClick={handleRescan}
          className="bg-green-500 text-black px-4 py-2 rounded"
        >
          🔁 Scan Again
        </button>

        <ReportButton repoId={selectedRepoId} />
      </div>

      {/* COMPARISON */}
     <Comparison repoId={selectedRepoId} />

      {/* AI */}
      <div className="mt-6 bg-[#07162f] p-6 rounded-xl">
        <h2 className="mb-3">🤖 AI Insights</h2>

        {dashboardData.aiInsights?.length > 0 ? (
          dashboardData.aiInsights.map((i, idx) => (
            <div key={idx} className="mb-3 border-b border-gray-700 pb-2">
              <p>📦 {i.package}</p>
              <p className="text-gray-400 text-sm">{i.explanation}</p>
            </div>
          ))
        ) : (
          <p>No insights</p>
        )}
      </div>

      <div className="mt-6">
        <AIChat repoData={dashboardData} />
      </div>

    </div>
  );
};

export default Dashboard;