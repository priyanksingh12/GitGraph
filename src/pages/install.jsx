// src/pages/Install.jsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const Install = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const url   = params.get("url");
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Token save karo pehle
    localStorage.setItem("token", token);

    if (url) {
      // GitHub App install page pe redirect
      window.location.href = decodeURIComponent(url);
    } else {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] text-white">
      <div className="animate-spin h-12 w-12 border-b-2 border-cyan-400 mb-4 rounded-full" />
      <h1 className="text-xl font-semibold">Setting up GraphGuardians...</h1>
      <p className="text-gray-400 mt-2 text-sm">Redirecting to GitHub App installation ⚡</p>
    </div>
  );
};

export default Install;