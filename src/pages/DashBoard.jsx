import { useEffect, useState } from "react";
import {
  FaGithub,
  FaShieldAlt,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

import API, {
  getCurrentUser,
  getDashboard,
  getGithubRepos,   // ✅ ADD
  addRepo,          // ✅ ADD
} from "../api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reposLoaded, setReposLoaded] = useState(false);

  // 🔥 NEW STATES
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Fetching dependencies 📦",
    "Analyzing dependency graph 🔗",
    "Calculating vulnerabilities 🛡️",
    "Generating AI insights 🤖",
  ];

  useEffect(() => {
    fetchUser();
  }, []);

  // 🔁 Animate steps
  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // 🔁 Fake progress animation
  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 10;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      const u = res?.data?.user;
      console.log("USER:", u);
      setUser(u);
    } catch (err) {
      console.log(err);
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 STEP 2: CONNECT GITHUB
  const handleConnectGitHub = () => {
    window.location.href =
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
  };

  // 🟢 STEP 3: INSTALL APP
  const handleInstallGitHub = async () => {
  try {
    const res = await API.get("/api/github/install-url");

    if (res?.data?.url) {
      window.location.href = res.data.url;
    }
  } catch (err) {
    console.log(err);
  }
};

  // 🟢 STEP 4: FETCH REPOS
 const fetchRepos = async () => {
  try {
    const res = await getGithubRepos();
    const data = res?.data;

    setRepos(data?.repositories || data || []);
    setReposLoaded(true);
  } catch (err) {
    console.log(err);
    setError("Failed to fetch repos");
  }
};

  // Step5

const handleAddRepo = async (repo) => {
  try {
    setIsAnalyzing(true);
    setProgress(5);

    const res = await addRepo({
      url: repo.html_url,
    });

    const data = res?.data;

    const repoId = data?.repo?._id || data?._id;

    if (!repoId) {
      alert("Repo saved but ID missing ❌");
      setIsAnalyzing(false);
      return;
    }

    await waitForAnalysis(repoId);

  } catch (err) {
    console.error("Error:", err);

    if (err.response?.status !== 401) {
      alert("Failed to add repo ❌");
    }

    setIsAnalyzing(false);
  }
};
  // 🟢 POLLING FUNCTION
  const waitForAnalysis = async (repoId) => {
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        const res = await getDashboard(repoId);
        const data = res?.data;

        if (data?.stats || data?.riskScore) {
          clearInterval(interval);

          setProgress(100);

          setTimeout(() => {
            setDashboardData({
              repo: data.repo || {},
              riskScore: data.stats?.riskScore || 0,
              dependenciesCount: data.stats?.dependencies || 0,
              vulnerabilitiesCount: data.stats?.vulnerabilities || 0,
              aiInsights: "Analysis complete",
            });

            setIsAnalyzing(false);
          }, 800);
        }

        attempts++;
        if (attempts > 15) {
          clearInterval(interval);
          setIsAnalyzing(false);
        }

      } catch (err) {
        console.log(err);
      }
    }, 3000);
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        Loading...
      </div>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  // 🔥 ANALYZING SCREEN
  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] text-white px-4">

        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mb-6"></div>

        <h1 className="text-3xl font-bold mb-4">
          Analyzing Repository...
        </h1>

        <p className="text-lg text-gray-300 mb-6">
          {steps[stepIndex]}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-cyan-400 h-3 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-400">
          {Math.floor(progress)}% completed
        </p>
      </div>
    );
  }

  // 🧱 STEP 1: CONNECT
  if (!user?.githubUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        <div className="text-center">
          <FaGithub className="text-6xl mx-auto text-cyan-400 mb-4" />
          <h1 className="text-3xl font-bold">Step 1: Connect GitHub</h1>

          <button
            onClick={handleConnectGitHub}
            className="mt-6 px-6 py-3 bg-cyan-400 text-black rounded-xl"
          >
            Connect GitHub 🚀
          </button>
        </div>
      </div>
    );
  }

  // 🧱 STEP 2: INSTALL
  if (!user?.installationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        <div className="text-center">
          <FaShieldAlt className="text-6xl mx-auto text-cyan-400 mb-4" />
          <h1 className="text-3xl font-bold">Step 2: Install GitHub App</h1>

          <button
            onClick={handleInstallGitHub}
            className="mt-6 px-6 py-3 bg-cyan-400 text-black rounded-xl"
          >
            Install App 🚀
          </button>
        </div>
      </div>
    );
  }

  // 🧱 STEP 3: FETCH REPOS
  if (!reposLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Step 3: Load Repositories</h1>

          <button
            onClick={fetchRepos}
            className="mt-6 px-6 py-3 bg-cyan-400 text-black rounded-xl"
          >
            Fetch Repos 🚀
          </button>
        </div>
      </div>
    );
  }

  // 🧱 STEP 4: SELECT REPO
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#020817] text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Step 4: Select Repository</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-[#07162f] p-5 rounded-xl border border-cyan-500/10"
            >
              <h2 className="text-xl">{repo.name}</h2>
              <p className="text-sm text-gray-400">
                {repo.full_name}
              </p>

              <div className="mt-2">
                {repo.private ? <FaLock /> : <FaUnlock />}
              </div>

              <button
                onClick={() => handleAddRepo(repo)}
                className="mt-4 w-full bg-cyan-400 text-black py-2 rounded-lg"
              >
                Add Repo
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🧱 STEP 5: DASHBOARD
  return (
    <div className="min-h-screen bg-[#020817] text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Step 5: Dashboard</h1>

      <h2 className="text-gray-400 mb-4">
        {dashboardData?.repo?.name}
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 p-4 rounded-xl">
          <p>Risk Score</p>
          <h2>{dashboardData?.riskScore}</h2>
        </div>

        <div className="bg-cyan-500/10 p-4 rounded-xl">
          <p>Dependencies</p>
          <h2>{dashboardData?.dependenciesCount}</h2>
        </div>

        <div className="bg-yellow-500/10 p-4 rounded-xl">
          <p>Vulnerabilities</p>
          <h2>{dashboardData?.vulnerabilitiesCount}</h2>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl">AI Insights</h2>
        <p>{dashboardData?.aiInsights || "No alerts"}</p>
      </div>
    </div>
  );
};

export default Dashboard;