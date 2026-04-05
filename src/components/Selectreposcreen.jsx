import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";

const SelectRepoScreen = ({ repos, onSelect }) => {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020817] text-white px-6 py-16 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
            <span className="text-xs tracking-[0.3em] text-cyan-500/70 uppercase font-mono">
              GraphGuardians
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-cyan-500/40 to-transparent" />
          </div>

          <h1 className="text-5xl font-black tracking-tight text-center mb-3">
            Choose a Repository
          </h1>
          <p className="text-center text-slate-500 text-sm">
            {repos.length} repositories available • Select one to begin analysis
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative max-w-md mx-auto mb-12"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07162f] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </motion.div>

        {/* Repo grid — gap-8 for more breathing room */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-slate-600"
            >
              No repositories match &quot;{search}&quot;
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((repo, i) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.4 }}
                  onHoverStart={() => setHoveredId(repo.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="group relative"
                >
                  {/* Card glow on hover */}
                  <AnimatePresence>
                    {hoveredId === repo.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 blur-sm pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative bg-[#07162f] border border-white/5 group-hover:border-cyan-500/20 rounded-2xl p-6 transition-colors duration-200 h-full flex flex-col">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="p-2.5 bg-white/5 rounded-lg">
                        <FaGithub className="text-slate-400 text-xl" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase bg-white/5 px-2.5 py-1 rounded-md">
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </div>

                    {/* Name */}
                    <h2 className="font-bold text-white text-lg mb-2 truncate group-hover:text-cyan-300 transition-colors">
                      {repo.name}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-500 text-xs mb-6 flex-1 line-clamp-2 leading-relaxed">
                      {repo.description || "No description available"}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-5">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400/60" />
                          {repo.language}
                        </span>
                      )}
                      {repo.stargazers_count !== undefined && (
                        <span>★ {repo.stargazers_count}</span>
                      )}
                    </div>

                    {/* CTA button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelect(repo)}
                      className="relative overflow-hidden w-full rounded-xl py-3 text-sm font-semibold text-black tracking-wide"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-300 opacity-90 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500" />
                      <span className="relative">Analyze →</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SelectRepoScreen;