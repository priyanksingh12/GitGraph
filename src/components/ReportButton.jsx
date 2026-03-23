import jsPDF from "jspdf";

const ReportButton = ({ data }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Security Report", 10, 10);
    doc.text(`Risk: ${data.riskScore}`, 10, 20);
    doc.text(`Dependencies: ${data.dependenciesCount}`, 10, 30);
    doc.text(`Vulnerabilities: ${data.vulnerabilitiesCount}`, 10, 40);

    doc.save("report.pdf");
  };

  return (
    <button onClick={generatePDF}>
      📄 Download Report
    </button>
  );
};

export default ReportButton;