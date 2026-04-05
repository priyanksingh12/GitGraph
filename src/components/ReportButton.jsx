import jsPDF from "jspdf";
import API from "../api";

const ReportButton = ({ repoId }) => {
  const generatePDF = async () => {
    try {
      const res = await API.get(`/api/report/${repoId}`);
      const data = res.data;

      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      /* ================= HELPERS ================= */
      const checkPage = (neededY) => {
        if (neededY > pageH - 15) {
          doc.addPage();
          drawPageBg();
          return 20;
        }
        return neededY;
      };

      const drawPageBg = () => {
        doc.setFillColor(8, 12, 24);
        doc.rect(0, 0, pageW, pageH, "F");
      };

      const severityColor = (sev) => {
        if (sev === "HIGH")   return [239, 68, 68];
        if (sev === "MEDIUM") return [250, 204, 21];
        return [34, 197, 94];
      };

      const severityBg = (sev) => {
        if (sev === "HIGH")   return [60, 10, 10];
        if (sev === "MEDIUM") return [60, 50, 5];
        return [10, 50, 20];
      };

      /* ================= PAGE 1 BACKGROUND ================= */
      drawPageBg();

      let y = 0;

      /* ================= HEADER BANNER ================= */
      doc.setFillColor(0, 205, 212);
      doc.rect(0, 0, pageW, 38, "F");

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 34, pageW, 4, "F");

      doc.setFillColor(8, 12, 24);
      doc.roundedRect(10, 7, 22, 22, 4, 4, "F");
      doc.setTextColor(0, 205, 212);
      doc.setFontSize(14);
      doc.text("⚡", 14, 22);

      doc.setTextColor(8, 12, 24);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SENTINEL", 36, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Security Intelligence Report", 36, 27);

      doc.setFontSize(8);
      doc.setTextColor(8, 12, 24);
      doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pageW - 10, 22, { align: "right" });

      y = 50;

      /* ================= REPO INFO CARD ================= */
      doc.setFillColor(13, 18, 37);
      doc.roundedRect(10, y, pageW - 20, 38, 4, 4, "F");
      doc.setDrawColor(26, 34, 64);
      doc.setLineWidth(0.5);
      doc.roundedRect(10, y, pageW - 20, 38, 4, 4, "S");

      doc.setFillColor(0, 205, 212);
      doc.roundedRect(10, y, 4, 38, 2, 2, "F");

      doc.setTextColor(0, 205, 212);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("REPOSITORY", 18, y + 10);

      doc.setTextColor(240, 244, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(data.repo.name || "Unknown", 18, y + 20);

      doc.setTextColor(107, 127, 163);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.repo.url}`, 18, y + 29);
      doc.text(`Scanned: ${new Date(data.repo.scannedAt).toLocaleString()}`, pageW - 14, y + 29, { align: "right" });

      y += 48;

      /* ================= SUMMARY STATS ROW ================= */
      const stats = [
        { label: "Risk Score",      value: data.summary.riskScore,            color: [180, 0, 212]  },
        { label: "Vulnerabilities", value: data.summary.totalVulnerabilities, color: [239, 68, 68]  },
        { label: "Dependencies",    value: data.summary.totalDependencies,    color: [255, 159, 67] },
      ];

      const cardW = (pageW - 20 - 8) / 3;

      stats.forEach((s, i) => {
        const cx = 10 + i * (cardW + 4);

        doc.setFillColor(13, 18, 37);
        doc.roundedRect(cx, y, cardW, 36, 4, 4, "F");
        doc.setDrawColor(...s.color);
        doc.setLineWidth(0.4);
        doc.roundedRect(cx, y, cardW, 36, 4, 4, "S");

        doc.setFillColor(...s.color);
        doc.roundedRect(cx, y + 32, cardW, 4, 2, 2, "F");

        doc.setTextColor(...s.color);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(String(s.value), cx + cardW / 2, y + 20, { align: "center" });

        doc.setTextColor(107, 127, 163);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(s.label, cx + cardW / 2, y + 29, { align: "center" });
      });

      y += 46;

      /* ================= SECTION HEADER ================= */
      const drawSectionHeader = (title, yPos) => {
        doc.setFillColor(13, 18, 37);
        doc.roundedRect(10, yPos, pageW - 20, 14, 3, 3, "F");

        doc.setFillColor(0, 205, 212);
        doc.roundedRect(10, yPos, 4, 14, 2, 2, "F");

        doc.setTextColor(240, 244, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(title, 18, yPos + 9.5);

        return yPos + 20;
      };

      y = drawSectionHeader("Vulnerabilities", y);

      /* ================= VULN CARDS ================= */
      doc.setFont("helvetica", "normal");

      data.vulnerabilities.forEach((v, i) => {
        const cardH = 28;
        y = checkPage(y + cardH);

        const [fr, fg, fb] = severityBg(v.severity);
        const [tr, tg, tb] = severityColor(v.severity);

        // card bg
        doc.setFillColor(13, 18, 37);
        doc.roundedRect(10, y, pageW - 20, cardH, 3, 3, "F");
        doc.setDrawColor(26, 34, 64);
        doc.setLineWidth(0.3);
        doc.roundedRect(10, y, pageW - 20, cardH, 3, 3, "S");

        // severity badge bg
        doc.setFillColor(fr, fg, fb);
        doc.roundedRect(pageW - 42, y + 4, 32, 10, 2, 2, "F");

        // severity badge text
        doc.setTextColor(tr, tg, tb);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.text(v.severity, pageW - 26, y + 10.5, { align: "center" });

        // index number
        doc.setFillColor(26, 34, 64);
        doc.roundedRect(14, y + 5, 12, 10, 2, 2, "F");
        doc.setTextColor(107, 127, 163);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(String(i + 1).padStart(2, "0"), 20, y + 11.5, { align: "center" });

        // package name
        doc.setTextColor(0, 205, 212);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(v.package || "unknown", 30, y + 11);

        // description
        doc.setTextColor(107, 127, 163);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(`Issue: ${v.description}`, pageW - 60);
        doc.text(descLines[0], 30, y + 18);

        // fix
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(7.5);
        const fixLines = doc.splitTextToSize(`Fix: ${v.fix}`, pageW - 60);
        doc.text(fixLines[0], 30, y + 24);

        y += cardH + 2;
      });

      /* ================= FOOTER ================= */
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);

        doc.setFillColor(13, 18, 37);
        doc.rect(0, pageH - 12, pageW, 12, "F");

        doc.setTextColor(107, 127, 163);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("SENTINEL INTELLIGENCE NODE • US-EAST-ALPHA", 10, pageH - 4);
        doc.text(`Page ${p} of ${totalPages}`, pageW - 10, pageH - 4, { align: "right" });
      }

      /* ================= SAVE ================= */
      doc.save("Sentinel_Security_Report.pdf");

    } catch (err) {
      console.log("Report error:", err);
      alert("Failed to generate report ❌");
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="
        w-full py-3 rounded-xl 
        bg-gradient-to-r from-cyan-500/10 to-blue-500/10 
        text-cyan-300 
        border border-cyan-500/30 
        hover:from-cyan-500/20 hover:to-blue-500/20 
        hover:scale-105 
        transition-all duration-300 
        flex items-center justify-center gap-2
      "
    >
      Download Full Report
    </button>
  );
};

export default ReportButton;