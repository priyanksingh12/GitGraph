import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, getCurrentUser } from "../api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const res = await loginUser(formData);
      const token = res?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      const userRes = await getCurrentUser();
      const latestUser = userRes?.data?.user;

      if (latestUser) {
        localStorage.setItem("user", JSON.stringify(latestUser));
      }

      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-[#020817] px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[85vh] w-full max-w-7xl overflow-hidden rounded-[32px] border border-cyan-500/10 bg-[#06152d]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:grid-cols-2">
        <div className="hidden items-center justify-center border-r border-cyan-500/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)] p-8 md:flex">
          <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-[28px] border border-dashed border-cyan-500/20 bg-[#081a36]/70">
            <p className="text-lg font-medium text-slate-400">
              Image placeholder
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-xl">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Welcome back
              <br />
              <span className="text-cyan-400">Log in to GitGraph</span>
            </h1>

            <p className="mb-8 mt-4 text-slate-400">
              Access your repository analysis dashboard.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-2xl border border-cyan-500/15 bg-[#081a36] px-5 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-2xl border border-cyan-500/15 bg-[#081a36] px-5 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  required
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </span>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <button
              onClick={handleGithubLogin}
              className="mt-4 w-full rounded-2xl border border-cyan-500/20 bg-[#081a36] px-5 py-3 font-semibold text-white transition hover:border-cyan-400/40 hover:bg-[#0b2245]"
            >
              Continue with GitHub
            </button>

            <p className="mt-6 text-center text-slate-400">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-cyan-400">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;