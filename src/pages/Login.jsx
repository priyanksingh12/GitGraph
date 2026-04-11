import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, getCurrentUser } from "../api";

/* ── Full Screen Background: Secure Pipeline Data Routing ── */
function DataStreamBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const SPACING = 40;
    const PACKET_COUNT = Math.min(Math.floor(window.innerWidth / 15), 100);

    const createPacket = () => {
       const isHorizontal = Math.random() > 0.5;
       const cols = Math.floor(canvas.width / SPACING);
       const rows = Math.floor(canvas.height / SPACING);
       const startCol = Math.floor(Math.random() * cols);
       const startRow = Math.floor(Math.random() * rows);
       
       // Speed must evenly divide SPACING for perfect 90-degree intersection turns
       const speeds = [1, 2, 4];
       const speed = speeds[Math.floor(Math.random() * speeds.length)];
       const dir = Math.random() > 0.5 ? 1 : -1;
       
       return {
          x: startCol * SPACING,
          y: startRow * SPACING,
          vx: isHorizontal ? speed * dir : 0,
          vy: isHorizontal ? 0 : speed * dir,
          history: [],
          maxHistory: Math.floor(Math.random() * 20 + 10), // tail length
          isCyan: Math.random() > 0.3 // 70% Cyan, 30% Blue
       };
    };

    const packets = Array.from({ length: PACKET_COUNT }, createPacket);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw static subtle routing network dots
      const cols = Math.floor(canvas.width / SPACING) + 1;
      const rows = Math.floor(canvas.height / SPACING) + 1;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for(let i = 0; i < cols; i++) {
         for(let j = 0; j < rows; j++) {
            ctx.fillRect(i * SPACING - 1, j * SPACING - 1, 2, 2);
         }
      }

      packets.forEach(p => {
         p.history.push({x: p.x, y: p.y});
         if(p.history.length > p.maxHistory) p.history.shift();

         p.x += p.vx;
         p.y += p.vy;

         // Turn logic: Trigger only exactly on an intersection point
         if (p.x % SPACING === 0 && p.y % SPACING === 0) {
             // 15% chance to route differently
             if (Math.random() < 0.15) {
                 if (p.vx !== 0) {
                     p.vy = (Math.random() > 0.5 ? 1 : -1) * Math.abs(p.vx);
                     p.vx = 0;
                 } else {
                     p.vx = (Math.random() > 0.5 ? 1 : -1) * Math.abs(p.vy);
                     p.vy = 0;
                 }
             }
         }

         // Reset if packet falls far out of view
         if (p.x < -SPACING*2 || p.x > canvas.width + SPACING*2 || p.y < -SPACING*2 || p.y > canvas.height + SPACING*2) {
             Object.assign(p, createPacket());
             p.history = []; // reset tail to prevent strange tearing lines
         }

         // Draw fading light tail
         if(p.history.length > 1) {
             for(let i = 0; i < p.history.length - 1; i++) {
                 ctx.beginPath();
                 ctx.moveTo(p.history[i].x, p.history[i].y);
                 ctx.lineTo(p.history[i+1].x, p.history[i+1].y);
                 const opacity = i / p.history.length;
                 // Add subtle fade out behind the packet
                 ctx.strokeStyle = p.isCyan 
                    ? `rgba(34, 211, 238, ${opacity * 0.45})` 
                    : `rgba(96, 165, 250, ${opacity * 0.45})`;
                 ctx.lineWidth = 1.5;
                 ctx.stroke();
             }
         }

         // Draw glowing laser head
         ctx.beginPath();
         const lastPt = p.history.length > 0 ? p.history[p.history.length-1] : { x: p.x, y: p.y };
         ctx.moveTo(lastPt.x, lastPt.y);
         ctx.lineTo(p.x, p.y);
         ctx.strokeStyle = p.isCyan ? `rgba(34, 211, 238, 1)` : `rgba(96, 165, 250, 1)`;
         ctx.lineWidth = 2;
         ctx.shadowBlur = 12;
         ctx.shadowColor = p.isCyan ? "#22d3ee" : "#60a5fa";
         ctx.stroke();
         ctx.shadowBlur = 0; // Reset
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.65 }}
    />
  );
}

/* ── Panel-Specific Foreground Canvas (Original logic perfectly preserved) ── */
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
    window.addEventListener("resize", resize);

    const NODE_COUNT   = 45;
    const CONNECT_DIST = 140;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r:  Math.random() * 2.5 + 1,
      highlight: Math.random() < 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const t = performance.now() / 1000;

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

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
              ctx.strokeStyle = `rgba(34,211,238,${fade * 0.6})`;
              ctx.lineWidth   = 1;
            } else {
              ctx.strokeStyle = `rgba(96,165,250,${fade * 0.25})`;
              ctx.lineWidth   = 0.5;
            }
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.8 + n.pulse);

        if (n.highlight) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          glow.addColorStop(0,   `rgba(34,211,238,${0.25 * pulse})`);
          glow.addColorStop(1,   `rgba(34,211,238,0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,211,238,${0.8 + pulse * 0.2})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${0.35 + pulse * 0.15})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

/* ── Login page ───────────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData]         = useState({ email: "", password: "" });
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Mounted state for entrance animations
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res    = await loginUser(formData);
      const token  = res?.data?.token;
      if (token) localStorage.setItem("token", token);

      const userRes    = await getCurrentUser();
      const latestUser = userRes?.data?.user;
      if (latestUser) localStorage.setItem("user", JSON.stringify(latestUser));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* ── Your Data Stream Pipeline Rendering Across The Whole Backdrop ── */}
      <DataStreamBackground />

      {/* Dynamic Immersive Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none z-0" />
      
      {/* Main Glassmorphism Container */}
      <div 
        className={`relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl grid md:grid-cols-2 transition-all duration-1000 ease-out z-10 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        {/* Subtle inner gradient lighting */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none md:col-span-2 z-0" />

        {/* ── Left: Technical Canvas Panel (Kept exactly as it was) ── */}
        <div className="hidden md:flex flex-col relative overflow-hidden bg-[#020617]/50 border-r border-white/10 min-h-[600px] z-10">
          
          {/* Subtle Cyber Grid Texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom_right,black,transparent)] pointer-events-none z-10" />

          {/* System Status Blinker */}
          <div className="absolute top-8 left-8 z-20 pointer-events-none flex items-center gap-3">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </div>
            <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400/80 uppercase">System Online</span>
          </div>

          <div className="absolute inset-0 z-0 opacity-80">
            {/* The sharp foreground canvas layer */}
            <GraphCanvas />
          </div>

          {/* Bold Branding */}
          <div className="absolute bottom-10 left-10 z-20 pointer-events-none">
            <h2 className="text-3xl font-light tracking-tight text-white mb-2">
              Graph<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Guardians</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-xs font-light leading-relaxed">
              Advanced repository analysis and visualization pipeline. Secure, monitor, and optimize your codebase.
            </p>
          </div>
          
          {/* Edge fade boundary */}
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none z-10" />
        </div>

        {/* ── Right: Form Panel ── */}
        <div className="flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-20 relative z-10 bg-black/10">
          <div className="w-full max-w-sm mx-auto">
            
            <div className={`transition-all duration-1000 delay-300 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
                Welcome back
              </h1>
              <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-medium pb-1 mb-8">
                Log in to continue
              </p>
            </div>

            <form className={`space-y-5 transition-all duration-1000 delay-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} onSubmit={handleSubmit}>
              
              {/* Animated Glowing Input wrapper */}
              <div className="group relative">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 blur-sm transition-all duration-300 "></div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#020617]/60 px-5 py-4 text-sm text-white placeholder-slate-500 backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    required
                  />
                </div>
              </div>

              {/* Animated Glowing Password Input */}
              <div className="group relative">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 blur-sm transition-all duration-300 "></div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#020617]/60 px-5 py-4 pr-12 text-sm text-white placeholder-slate-500 backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    required
                  />
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                  </div>
                </div>
              </div>

           
              {/* Error handling with a soft colored block */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              {/* Premium Button with hover sweep effect */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? "Authenticating..." : "Sign In"}
                </span>

                {/* Glass sweep animation on hover */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-[1000ms] ease-out group-hover:translate-x-full pointer-events-none" />
              </button>
            </form>

            <p className={`mt-8 text-center text-sm text-slate-400 transition-all duration-1000 delay-700 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
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
