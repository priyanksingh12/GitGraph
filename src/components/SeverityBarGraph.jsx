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

      {/* 🔥 Bigger Premium Title */}
      <h2 className="text-3xl mb-8 font-semibold tracking-wide">
        📊 Severity Analytics
      </h2>

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
                radius={[6, 6, 0, 0]}   // rounded top
                barSize={32}            // thicker bars
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