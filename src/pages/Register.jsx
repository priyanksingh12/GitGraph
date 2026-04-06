
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerUser, getCurrentUser } from "../api";
import photo from "../assets/login.jpg"
import { useState, useEffect, useRef } from "react";


function GraphCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const NODE_COUNT   = 68;
    const CONNECT_DIST = 130;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 2.2 + 1,
      highlight: Math.random() < 0.14,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const t = performance.now() / 1000;

      /* move */
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      /* edges */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const fade      = 1 - dist / CONNECT_DIST;
            const isSpecial = nodes[i].highlight || nodes[j].highlight;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            if (isSpecial) {
              ctx.strokeStyle = `rgba(34,211,238,${fade * 0.55})`;
              ctx.lineWidth   = 0.9;
            } else {
              ctx.strokeStyle = `rgba(96,165,250,${fade * 0.22})`;
              ctx.lineWidth   = 0.5;
            }
            ctx.stroke();
          }
        }
      }

      /* nodes */
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.8 + n.pulse);

        if (n.highlight) {
          /* outer glow ring */
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          glow.addColorStop(0,   `rgba(34,211,238,${0.18 * pulse})`);
          glow.addColorStop(1,   `rgba(34,211,238,0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          /* core dot */
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + pulse * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,211,238,${0.75 + pulse * 0.25})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${0.3 + pulse * 0.12})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", borderRadius: "28px" }}
    />
  );
}

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

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
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[85vh] w-full max-w-7xl overflow-hidden rounded-[32px] border border-cyan-500/10 bg-[#06152d]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:grid-cols-2">

        {/* ── Left: live graph canvas ── */}
        <div className="hidden md:block border-r border-cyan-500/10 bg-[#030e1f] relative overflow-hidden">
          {/* subtle radial overlay to blend edges */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 40%, #030e1f 100%)",
            }}
          />
          {/* branding text over canvas */}
          <div className="absolute bottom-8 left-0 right-0 z-20 text-center pointer-events-none">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400/60 uppercase">
              GraphGuardians
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Repository analysis, visualised
            </p>
          </div>
          <GraphCanvas />
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-xl">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Join GraphGuardians
              <br />
              <span className="text-cyan-400">Create your account</span>
            </h1>

            <p className="mb-8 mt-4 text-slate-400">
              Start analyzing repositories and visualizing dependency risk.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-2xl border border-cyan-500/15 bg-[#081a36] px-5 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                required
              />

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

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-cyan-500/15 bg-[#081a36] px-5 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  required
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <FaEye size={18} />
                  ) : (
                    <FaEyeSlash size={18} />
                  )}
                </span>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-cyan-400">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;