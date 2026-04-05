import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";

const FetchReposScreen = ({ onFetch }) => (
  <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6 overflow-hidden relative">
    {/* Grid background */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />

    {/* Glow orbs */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 text-center max-w-lg w-full"
    >
      {/* Spinning icon ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        className="mx-auto mb-8 w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center relative"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 70%, #00e5ff55 100%)",
        }}
      >
        <div className="absolute inset-2 rounded-full bg-[#020817] flex items-center justify-center">
          <FaGithub className="text-4xl text-cyan-400" />
        </div>
      </motion.div>

      <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
        Load Repositories
      </h1>
      <p className="text-slate-400 text-base mb-10 leading-relaxed">
        Pull your GitHub repositories to begin dependency analysis
        and vulnerability detection.
      </p>

      {/* Trust pills */}
      <div className="flex justify-center gap-8 mb-10">
        {["Instant Sync", "All Repos", "Secure"].map((label, i) => (
          <div key={i} className="text-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 mx-auto mb-2" />
            <span className="text-xs text-slate-500 tracking-widest uppercase">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Shimmer button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onFetch}
        className="relative w-full group overflow-hidden rounded-2xl"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-100 group-hover:opacity-90 transition-opacity" />
        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
        <span className="relative flex items-center justify-center gap-3 text-black font-bold py-4 text-base tracking-wide">
          <FaGithub className="text-lg" />
          Fetch Repositories
        </span>
      </motion.button>

      <p className="text-xs text-slate-600 mt-5">
        Connected via GitHub App • Read-only access
      </p>
    </motion.div>
  </div>
);

export default FetchReposScreen;