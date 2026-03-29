import jsPDF from "jspdf";
import API from "../api";

const ReportButton = ({ repoId }) => {
  const generatePDF = async () => {
    try {
      const res = await API.get(`/api/report/${repoId}`);
      const data = res.data;

      const doc = new jsPDF();

      let y = 10;

      // 🧾 TITLE
      doc.setFontSize(18);
      doc.text("Security Report", 10, y);
      y += 10;

      // 📦 REPO INFO
      doc.setFontSize(12);
      doc.text(`Repo: ${data.repo.name}`, 10, y);
      y += 7;

      doc.text(`URL: ${data.repo.url}`, 10, y);
      y += 7;

      doc.text(`Scanned At: ${data.repo.scannedAt}`, 10, y);
      y += 10;

      // 📊 SUMMARY
      doc.setFontSize(14);
      doc.text("Summary", 10, y);
      y += 7;

      doc.setFontSize(11);
      doc.text(`Risk Score: ${data.summary.riskScore}`, 10, y);
      y += 6;

      doc.text(`Dependencies: ${data.summary.totalDependencies}`, 10, y);
      y += 6;

      doc.text(
        `Vulnerabilities: ${data.summary.totalVulnerabilities}`,
        10,
        y
      );
      y += 10;

      // 🚨 VULNERABILITIES LIST
      doc.setFontSize(14);
      doc.text("Vulnerabilities", 10, y);
      y += 8;

      doc.setFontSize(10);

      data.vulnerabilities.forEach((v, i) => {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }

        doc.text(`${i + 1}. ${v.package} (${v.severity})`, 10, y);
        y += 5;

        doc.text(`Issue: ${v.description}`, 12, y);
        y += 5;

        doc.text(`Fix: ${v.fix}`, 12, y);
        y += 7;
      });

      // 💾 SAVE
      doc.save("Security_Report.pdf");

    } catch (err) {
      console.log("Report error:", err);
      alert("Failed to generate report ❌");
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-lg text-white"
    >
      📄 Download Full Report
    </button>
  );
};

export default ReportButton;