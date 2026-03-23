import { motion } from "framer-motion";

/* =========================
   🎯 COLOR MAP
========================= */
const colorMap = {
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
};

/* =========================
   🚀 COMPONENT
========================= */
const StatsCard = ({
  title,
  value,
  icon,
  color = "cyan",
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${colorMap[color]}`}
    >
      {/* 🔝 HEADER */}
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-80">{title}</p>
        <div className="text-xl">{icon}</div>
      </div>

      {/* 🔢 VALUE */}
      <h2 className="text-3xl font-bold mt-2">{value}</h2>

      {/* 📄 SUBTEXT */}
      {subtitle && (
        <p className="text-xs mt-2 opacity-70">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default StatsCard;