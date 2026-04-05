import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";

const getValue = (severity) => {
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
};

const getColor = (severity) => {
  if (severity === "HIGH") return "#ef4444";
  if (severity === "MEDIUM") return "#facc15";
  return "#22c55e";
};

const LEGEND = [
  { label: "High", color: "#ef4444" },
  { label: "Medium", color: "#facc15" },
  { label: "Low", color: "#22c55e" },
];

const SeverityBarGraph = ({ vulnerabilities }) => {

  const safeData = Array.isArray(vulnerabilities)
    ? vulnerabilities
    : vulnerabilities?.data ||
      vulnerabilities?.vulnerabilities ||
      [];

  const data = safeData.map((v) => ({
    name: v.package || v.name || "unknown",
    value: getValue(v.severity),
    severity: v.severity
  }));

  if (!data.length) {
    return <p className="text-gray-400 text-xl">No vulnerabilities</p>;
  }

  return (
    <div>

     <div className="flex items-center justify-between mb-8">
  <h2 className="text-3xl font-semibold tracking-wide">
    📊 Severity Analytics
  </h2>

  {/* LEGEND */}
  <div className="flex items-center gap-5">
    <span className="text-base text-[#6b7fa3] font-medium">Severity :</span>
    {LEGEND.map(({ label, color }) => (
      <div key={label} className="flex items-center gap-2">
        <span
          className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-base text-[#f0f4ff] font-medium">
          {label}
        </span>
      </div>
    ))}
  </div>
</div>

      <div className="overflow-x-auto">
        <div style={{ width: `${data.length * 100}px` }}>

          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >

              {/* 🔥 Subtle Grid */}
              <CartesianGrid
                stroke="#1a2240"
                strokeDasharray="3 3"
                vertical={false}
              />

              {/* 🔥 X Axis (clean + bigger) */}
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7fa3", fontSize: 15 }}
                axisLine={{ stroke: "#1a2240" }}
                tickLine={false}
              />

              {/* 🔥 Y Axis */}
              <YAxis
                domain={[0, 3]}
                ticks={[1, 2, 3]}
                tick={{ fill: "#6b7fa3", fontSize: 15 }}
                axisLine={{ stroke: "#1a2240" }}
                tickLine={false}
                tickFormatter={(v) =>
                  v === 1 ? "Low" : v === 2 ? "Medium" : "High"
                }
              />

              {/* 🔥 Premium Bars */}
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                barSize={32}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getColor(entry.severity)}
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  );
};

export default SeverityBarGraph;