import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
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

const SeverityBarGraph = ({ vulnerabilities }) => {

  // 🔥 FIX: ensure it's always array
  const safeData = Array.isArray(vulnerabilities)
    ? vulnerabilities
    : vulnerabilities?.data ||   // case 1
      vulnerabilities?.vulnerabilities || // case 2
      [];

  const data = safeData.map((v) => ({
    name: v.package || v.name || "unknown",
    value: getValue(v.severity),
    severity: v.severity
  }));

  if (!data.length) {
    return <p className="text-gray-400">No vulnerabilities</p>;
  }

  return (
    <div>
      <h2 className="text-xl mb-4 font-semibold">
        📊 Severity Graph
      </h2>

      <div className="overflow-x-auto">
        <div style={{ width: `${data.length * 80}px` }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis
                domain={[0, 3]}
                ticks={[1, 2, 3]}
                tickFormatter={(v) =>
                  v === 1 ? "Low" : v === 2 ? "Medium" : "High"
                }
              />
              <Tooltip />

              <Bar dataKey="value">
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