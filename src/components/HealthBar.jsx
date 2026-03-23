const HealthBar = ({ score }) => {
  return (
    <div className="bg-[#07162f] p-4 rounded-xl mt-6">
      <p>Health</p>

      <div className="w-full bg-gray-700 h-3 rounded mt-2">
        <div
          className="bg-green-400 h-3 rounded"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-2">{score}%</p>
    </div>
  );
};

export default HealthBar;