import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import API from "../api";

/* ─── helpers ─── */
const sev = (s = "") => s.toUpperCase();

const SEV_COLOR = {
  CRITICAL: { text: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  HIGH:     { text: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.25)" },
  MEDIUM:   { text: "#eab308", bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.25)"  },
  LOW:      { text: "#22c55e", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.25)"  },
  UNKNOWN:  { text: "#6b7fa3", bg: "rgba(107,127,163,0.10)",border: "rgba(107,127,163,0.25)"},
};

const SevBadge = ({ s }) => {
  const c = SEV_COLOR[sev(s)] || SEV_COLOR.UNKNOWN;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: 6, border: `1px solid ${c.border}`,
      background: c.bg, color: c.text, whiteSpace: "nowrap"
    }}>{sev(s) || "UNKNOWN"}</span>
  );
};

const Arrow = ({ up }) => (
  <span style={{ fontSize: 14, color: up ? "#ef4444" : "#22c55e" }}>
    {up ? "▲" : "▼"}
  </span>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "var(--color-background-secondary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "1rem 1.25rem", flex: 1, minWidth: 120
  }}>
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</p>
    <p style={{ fontSize: 26, fontWeight: 500, color: accent || "var(--color-text-primary)", margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>{sub}</p>}
  </div>
);

/* ─── Mini bar ─── */
const SevBar = ({ counts, total }) => {
  const segs = [
    { k: "CRITICAL", color: "#ef4444" },
    { k: "HIGH",     color: "#f97316" },
    { k: "MEDIUM",   color: "#eab308" },
    { k: "LOW",      color: "#22c55e" },
  ];
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 6, overflow: "hidden", gap: 1 }}>
      {segs.map(({ k, color }) => {
        const pct = total ? ((counts[k] || 0) / total) * 100 : 0;
        return pct > 0 ? (
          <div key={k} style={{ width: `${pct}%`, background: color }} title={`${k}: ${counts[k]}`} />
        ) : null;
      })}
      {total === 0 && <div style={{ width: "100%", background: "var(--color-border-tertiary)" }} />}
    </div>
  );
};

/* ─── Scan card ─── */
const ScanCard = ({ scan, label, accent }) => {
  const counts = (scan?.vulns || []).reduce((a, v) => {
    const s = sev(v.severity);
    a[s] = (a[s] || 0) + 1;
    return a;
  }, {});
  const total = scan?.vulnCount || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--color-background-primary)",
        border: `2px solid ${accent}`,
        borderRadius: "var(--border-radius-lg)",
        padding: "1.5rem", flex: 1, minWidth: 0
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: "3px 10px",
          borderRadius: 20, background: accent + "22", color: accent
        }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
          Scan #{scan?.version || "—"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Risk score</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: accent, margin: 0 }}>
            {scan ? Number(scan.riskScore || 0).toFixed(1) : "—"}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Vulnerabilities</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{total}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Dependencies</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
            {scan?.depCount || "—"}
          </p>
        </div>
      </div>

      <SevBar counts={counts} total={total} />

      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(k => (
          (counts[k] || 0) > 0 && (
            <span key={k} style={{ fontSize: 11, color: SEV_COLOR[k].text }}>
              {counts[k]} {k}
            </span>
          )
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Diff row ─── */
const DiffRow = ({ vuln, type }) => {
  const icon  = type === "new" ? "+" : type === "fixed" ? "−" : "~";
  const color = type === "new" ? "#ef4444" : type === "fixed" ? "#22c55e" : "#eab308";
  return (
    <motion.div initial={{ opacity: 0, x: type === "new" ? 12 : -12 }} animate={{ opacity: 1, x: 0 }}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
        borderRadius: "var(--border-radius-md)",
        background: color + "0d",
        border: `0.5px solid ${color}33`,
        marginBottom: 6
      }}>
      <span style={{ fontSize: 16, fontWeight: 500, color, minWidth: 16, textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", margin: 0, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {vuln.package}
        </p>
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}>{vuln.cve || "—"}</p>
      </div>
      <SevBadge s={vuln.severity} />
    </motion.div>
  );
};

/* ─── Timeline ─── */
const Timeline = ({ history, selected, onSelect }) => (
  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
    {history.map((h, i) => (
      <button key={i} onClick={() => onSelect(i)}
        style={{
          flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12,
          border: `1px solid ${selected === i ? "#38bdf8" : "var(--color-border-tertiary)"}`,
          background: selected === i ? "rgba(56,189,248,0.12)" : "var(--color-background-secondary)",
          color: selected === i ? "#38bdf8" : "var(--color-text-secondary)",
          cursor: "pointer"
        }}>
        #{h.version} · {new Date(h.scannedAt || h.createdAt).toLocaleDateString()}
      </button>
    ))}
  </div>
);

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
const ComparisonPage = () => {
  const { repoId } = useParams();
  const navigate   = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [history,    setHistory]    = useState([]);   // scan history list
  const [allVulns,   setAllVulns]   = useState([]);   // all vulns with versionGroup
  const [selIdx,     setSelIdx]     = useState(1);    // which scan is "new" (default latest)
  const [tab,        setTab]        = useState("diff"); // diff | new | fixed

  useEffect(() => { fetchData(); }, [repoId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [histRes, vulnRes] = await Promise.all([
        API.get(`/api/scanhistory/${repoId}`),
        API.get(`/api/vulnerabilities/${repoId}/all`),
      ]);

      const hist = (histRes.data?.history || histRes.data || [])
        .sort((a, b) => a.version - b.version);

      setHistory(hist);
      setAllVulns(vulnRes.data?.vulnerabilities || vulnRes.data || []);
      setSelIdx(Math.max(hist.length - 1, 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── derive scan objects ── */
  const newScan = history[selIdx];
  const oldScan = history[selIdx - 1] || null;

  const vulnsForVersion = (v) =>
    allVulns.filter(vl => vl.versionGroup === v);

  const newVulns = newScan ? vulnsForVersion(newScan.version) : [];
  const oldVulns = oldScan ? vulnsForVersion(oldScan.version) : [];

  const newScanObj = newScan
    ? { ...newScan, vulns: newVulns, vulnCount: newVulns.length, depCount: newScan.dependencyCount }
    : null;
  const oldScanObj = oldScan
    ? { ...oldScan, vulns: oldVulns, vulnCount: oldVulns.length, depCount: oldScan.dependencyCount }
    : null;

  /* ── diff ── */
  const newPkgs  = new Set(newVulns.map(v => `${v.package}__${v.cve}`));
  const oldPkgs  = new Set(oldVulns.map(v => `${v.package}__${v.cve}`));

  const addedVulns   = newVulns.filter(v => !oldPkgs.has(`${v.package}__${v.cve}`));
  const fixedVulns   = oldVulns.filter(v => !newPkgs.has(`${v.package}__${v.cve}`));
  const persistVulns = newVulns.filter(v =>  oldPkgs.has(`${v.package}__${v.cve}`));

  /* ── risk delta ── */
  const riskDelta = newScanObj && oldScanObj
    ? (newScanObj.riskScore - oldScanObj.riskScore).toFixed(1)
    : null;

  const vulnDelta = newScanObj && oldScanObj
    ? newScanObj.vulnCount - oldScanObj.vulnCount
    : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080c18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6b7fa3", fontSize: 14 }}>Loading comparison...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#080c18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#ef4444", fontSize: 14 }}>Error: {error}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080c18", color: "#f0f4ff", fontFamily: "var(--font-sans)" }}>

      {/* TOP BAR */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2rem",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        background: "rgba(10,15,30,0.8)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Scan comparison</h1>
          <p style={{ fontSize: 12, color: "#6b7fa3", margin: "2px 0 0" }}>
            Compare security posture across scans
          </p>
        </div>
        <button onClick={() => navigate(`/dashboard/${repoId}`)} style={{
          padding: "6px 16px", borderRadius: 10, fontSize: 13,
          border: "0.5px solid rgba(0,205,212,0.25)",
          background: "rgba(0,205,212,0.08)", color: "#00cdd4", cursor: "pointer"
        }}>← Back</button>
      </div>

      <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>

        {/* TIMELINE SELECTOR */}
        {history.length > 1 && (
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: 12, color: "#6b7fa3", marginBottom: 8 }}>Select scan to compare against previous</p>
            <Timeline history={history} selected={selIdx} onSelect={setSelIdx} />
          </div>
        )}

        {history.length < 2 && (
          <div style={{
            background: "rgba(56,189,248,0.06)", border: "0.5px solid rgba(56,189,248,0.2)",
            borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "2rem",
            textAlign: "center", color: "#6b7fa3", fontSize: 14
          }}>
            Need at least 2 scans to compare. Push a commit or rescan to generate a second scan.
          </div>
        )}

        {/* DELTA SUMMARY CARDS */}
        {newScanObj && oldScanObj && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", gap: 12, marginBottom: "2rem", flexWrap: "wrap" }}>
            <StatCard
              label="Risk score change"
              value={<>{riskDelta > 0 ? "+" : ""}{riskDelta} <Arrow up={riskDelta > 0} /></>}
              accent={riskDelta > 0 ? "#ef4444" : "#22c55e"}
              sub={`${Number(oldScanObj.riskScore).toFixed(1)} → ${Number(newScanObj.riskScore).toFixed(1)}`}
            />
            <StatCard
              label="Vulnerabilities change"
              value={<>{vulnDelta > 0 ? "+" : ""}{vulnDelta} <Arrow up={vulnDelta > 0} /></>}
              accent={vulnDelta > 0 ? "#ef4444" : "#22c55e"}
              sub={`${oldScanObj.vulnCount} → ${newScanObj.vulnCount}`}
            />
            <StatCard
              label="New vulnerabilities"
              value={addedVulns.length}
              accent={addedVulns.length > 0 ? "#ef4444" : "#22c55e"}
            />
            <StatCard
              label="Fixed vulnerabilities"
              value={fixedVulns.length}
              accent={fixedVulns.length > 0 ? "#22c55e" : "#6b7fa3"}
            />
          </motion.div>
        )}

        {/* SIDE BY SIDE SCAN CARDS */}
        {newScanObj && (
          <div style={{ display: "flex", gap: 16, marginBottom: "2rem", flexWrap: "wrap" }}>
            {oldScanObj
              ? <ScanCard scan={oldScanObj} label="Previous scan" accent="#6b7fa3" />
              : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)",
                  color: "#6b7fa3", fontSize: 13, minHeight: 160 }}>
                  No previous scan
                </div>
            }
            <ScanCard scan={newScanObj} label="Current scan" accent="#38bdf8" />
          </div>
        )}

        {/* DIFF SECTION */}
        {newScanObj && oldScanObj && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--border-radius-lg)", padding: "1.5rem"
            }}>

            {/* tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { key: "diff",  label: `All changes (${addedVulns.length + fixedVulns.length})` },
                { key: "new",   label: `New (${addedVulns.length})` },
                { key: "fixed", label: `Fixed (${fixedVulns.length})` },
                { key: "persist", label: `Persisting (${persistVulns.length})` },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                  border: `1px solid ${tab === t.key ? "#38bdf8" : "var(--color-border-tertiary)"}`,
                  background: tab === t.key ? "rgba(56,189,248,0.12)" : "transparent",
                  color: tab === t.key ? "#38bdf8" : "var(--color-text-secondary)"
                }}>{t.label}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>

                {tab === "diff" && (
                  <>
                    {addedVulns.length === 0 && fixedVulns.length === 0 && (
                      <p style={{ color: "#6b7fa3", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
                        No changes between these scans.
                      </p>
                    )}
                    {addedVulns.map((v, i) => <DiffRow key={`new-${i}`} vuln={v} type="new" />)}
                    {fixedVulns.map((v, i) => <DiffRow key={`fix-${i}`} vuln={v} type="fixed" />)}
                  </>
                )}

                {tab === "new" && (
                  <>
                    {addedVulns.length === 0
                      ? <p style={{ color: "#22c55e", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>No new vulnerabilities — great job!</p>
                      : addedVulns.map((v, i) => <DiffRow key={i} vuln={v} type="new" />)
                    }
                  </>
                )}

                {tab === "fixed" && (
                  <>
                    {fixedVulns.length === 0
                      ? <p style={{ color: "#6b7fa3", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>No vulnerabilities fixed yet.</p>
                      : fixedVulns.map((v, i) => <DiffRow key={i} vuln={v} type="fixed" />)
                    }
                  </>
                )}

                {tab === "persist" && (
                  <>
                    {persistVulns.length === 0
                      ? <p style={{ color: "#22c55e", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>All vulnerabilities addressed!</p>
                      : persistVulns.map((v, i) => <DiffRow key={i} vuln={v} type="persist" />)
                    }
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* SEVERITY BREAKDOWN CHART */}
        {newScanObj && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginTop: "1.5rem"
            }}>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Severity breakdown — current scan</p>
            {(() => {
              const counts = newVulns.reduce((a, v) => {
                const s = sev(v.severity);
                a[s] = (a[s] || 0) + 1;
                return a;
              }, {});
              const total = newVulns.length;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["CRITICAL","HIGH","MEDIUM","LOW"].map(k => {
                    const count = counts[k] || 0;
                    const pct   = total ? Math.round((count / total) * 100) : 0;
                    const c     = SEV_COLOR[k];
                    return (
                      <div key={k}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{k}</span>
                          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 6, background: "var(--color-background-secondary)", overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            style={{ height: "100%", background: c.text, borderRadius: 6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ComparisonPage;