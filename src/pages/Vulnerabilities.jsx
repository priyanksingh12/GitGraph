import { useEffect, useState } from "react";
import API from "../api";

const Vulnerabilities = ({ repoId }) => {
  const [vulns, setVulns] = useState([]);

  useEffect(() => {
    fetchVulns();
  }, []);

  const fetchVulns = async () => {
    const res = await API.get(`/api/vulnerabilities/${repoId}`);
    setVulns(res.data);
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl mb-6">Vulnerabilities</h1>

      <table className="w-full">
        <thead>
          <tr>
            <th>Package</th>
            <th>Severity</th>
            <th>Fix</th>
          </tr>
        </thead>

        <tbody>
          {vulns.map((v, i) => (
            <tr key={i}>
              <td>{v.package}</td>
              <td className="text-red-400">{v.severity}</td>
              <td>{v.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vulnerabilities;