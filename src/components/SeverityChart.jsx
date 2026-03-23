import { PieChart, Pie, Tooltip } from "recharts";

const SeverityChart = ({ data }) => {
  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
      />
      <Tooltip />
    </PieChart>
  );
};

export default SeverityChart;