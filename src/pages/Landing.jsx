import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      {/* SECTION: NAVBAR */}
      <section className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#020817]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 ring-1 ring-cyan-400/30 sm:h-10 sm:w-10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-cyan-400 sm:h-6 sm:w-6"
              >
                <path
                  d="M12 3L19 6V11C19 15.5 16.1 19.6 12 21C7.9 19.6 5 15.5 5 11V6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 11.5L11.2 13.2L14.8 9.6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-lg font-bold tracking-wide sm:text-xl">GitGraph</p>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
            >
              How it works
            </a>

            <Link
              to="/about"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
            >
              About
            </Link>

            <a
              href="#analyze"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
            >
              AnalyzeRepo
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-white sm:px-4 sm:text-sm"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.28)] transition hover:scale-[1.02] hover:bg-cyan-300 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Register
            </Link>
          </div>
        </nav>
      </section>

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%)]" />

        {/* SECTION: HERO */}
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:px-4 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              New: AI vulnerability prediction
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Secure Your <span className="text-cyan-400">Dependencies.</span>
              <br />
              Visualize Risk.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:mt-8 sm:text-lg sm:leading-8 lg:text-xl">
              Analyze your repository instantly to uncover hidden vulnerabilities
              across your dependency graph. Move beyond reactive security and get a
              clear view of risk before it becomes a problem.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row">
              <a
                href="#analyze"
                className="rounded-2xl bg-cyan-400 px-6 py-4 text-center text-base font-bold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.25)] transition hover:scale-[1.02] hover:bg-cyan-300 sm:px-8 sm:text-lg"
              >
                Analyze Repository →
              </a>

              <button className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 px-6 py-4 text-base font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-white sm:px-8 sm:text-lg">
                View Demo
              </button>
            </div>
          </div>

          {/* SECTION: HERO VISUAL */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[32px] bg-cyan-400/10 blur-3xl sm:-inset-6" />
            <div className="relative rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,20,45,0.96),rgba(2,8,23,0.96))] p-4 shadow-2xl sm:rounded-[32px] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <p className="text-xs tracking-wide text-slate-500 sm:text-sm">
                  graph_viewer.sh
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/25 bg-[#020817] p-4 sm:p-6">
                <svg
                  viewBox="0 0 320 240"
                  className="h-auto w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="160"
                    y1="40"
                    x2="70"
                    y2="130"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  <line
                    x1="160"
                    y1="40"
                    x2="85"
                    y2="190"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  <line
                    x1="160"
                    y1="40"
                    x2="230"
                    y2="190"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  <line
                    x1="85"
                    y1="190"
                    x2="230"
                    y2="190"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    opacity="0.7"
                  />

                  <circle cx="160" cy="40" r="9" fill="#22d3ee" />
                  <circle cx="70" cy="130" r="9" fill="#22c55e" />
                  <circle cx="85" cy="190" r="9" fill="#ff4d5a" />
                  <circle cx="230" cy="190" r="9" fill="#facc15" />

                  <circle cx="70" cy="130" r="18" fill="#22c55e" opacity="0.18" />
                  <circle cx="85" cy="190" r="18" fill="#ff4d5a" opacity="0.18" />
                  <circle cx="230" cy="190" r="18" fill="#facc15" opacity="0.18" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: RISK STATS */}
        <section
          id="analyze"
          className="relative border-t border-cyan-500/10 bg-[linear-gradient(180deg,#041129_0%,#020817_100%)]"
        >
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-cyan-500/10 bg-[#0a2342]/75 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6.75C4 5.78 4.78 5 5.75 5H18.25C19.22 5 20 5.78 20 6.75V17.25C20 18.22 19.22 19 18.25 19H5.75C4.78 19 4 18.22 4 17.25V6.75Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M7 9H17"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 15H10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.5 11.5L9 13L11.5 10.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">70–90% External Code</h3>
                    <p className="mt-2 text-base leading-7 text-slate-400">
                      Most modern apps rely on unvetted third-party libraries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-red-500/10 bg-[#1a1630]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L20 19H4L12 4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9V13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">500+ Hidden Risks</h3>
                    <p className="mt-2 text-base leading-7 text-slate-400">
                      Deeply nested transitive dependencies hide vulnerabilities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-violet-500/10 bg-[#15173a]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 3L6 13H11L10 21L18 10H13L13 3Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">Reactive Security</h3>
                    <p className="mt-2 text-base leading-7 text-slate-400">
                      Traditional tools find risks after they are exploited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

              {/* SECTION: HOW IT WORKS */}
        <section
          id="how-it-works"
          className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              Our multi-stage analysis engine maps your entire ecosystem in seconds.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-y-10 sm:mt-16 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-14">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 14L14 10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7.5 16.5L5.5 18.5C4.4 19.6 2.6 19.6 1.5 18.5C0.4 17.4 0.4 15.6 1.5 14.5L3.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16.5 7.5L18.5 5.5C19.6 4.4 21.4 4.4 22.5 5.5C23.6 6.6 23.6 8.4 22.5 9.5L20.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-cyan-400">01. URL</h3>
              <p className="mt-2 text-base text-slate-500">Enter Repo URL</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 7L12 3L16 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 17L12 21L16 17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-cyan-400">02. Extract</h3>
              <p className="mt-2 text-base text-slate-500">Parse Manifests</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M14 14L20 20"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 18H12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 15V21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-cyan-400">03. Detect</h3>
              <p className="mt-2 text-base text-slate-500">Scan CVE Database</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="4.5" r="2" fill="currentColor" />
                  <circle cx="12" cy="19.5" r="2" fill="currentColor" />
                  <circle cx="4.5" cy="12" r="2" fill="currentColor" />
                  <circle cx="19.5" cy="12" r="2" fill="currentColor" />
                  <circle cx="6.8" cy="6.8" r="2" fill="currentColor" />
                  <circle cx="17.2" cy="6.8" r="2" fill="currentColor" />
                  <circle cx="6.8" cy="17.2" r="2" fill="currentColor" />
                  <circle cx="17.2" cy="17.2" r="2" fill="currentColor" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-cyan-400">04. Build</h3>
              <p className="mt-2 text-base text-slate-500">Dependency Graph</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 16L8 12L11 15L16 8L20 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 8H19V11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="18.5" cy="18.5" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M20.5 20.5L22 22"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-cyan-400">05. Score</h3>
              <p className="mt-2 text-base text-slate-500">Calculate Risk</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L19 7V12C19 16.2 16.3 19.9 12 21C7.7 19.9 5 16.2 5 12V7L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-cyan-400">06. AI Insights</h3>
              <p className="mt-2 text-base text-slate-500">Remediation Plan</p>
            </div>
          </div>
        </section>


        {/* SECTION: ENTERPRISE-GRADE SECURITY */}
        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Enterprise-Grade
              <br />
              Security
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-cyan-500/10 bg-[#07162f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="4" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
                  <rect x="14" y="4" width="6" height="6" rx="1.2" fill="currentColor" opacity="0.9" />
                  <rect x="14" y="14" width="6" height="6" rx="1.2" fill="currentColor" opacity="0.9" />
                  <path
                    d="M10 7H14M17 10V14M10 17H14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Graph Visualization</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Visualize complex many-to-many relationships across your dependency tree.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/10 bg-[#07162f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L18.5 5.8V10.4C18.5 14.6 15.8 18.2 12 19.5C8.2 18.2 5.5 14.6 5.5 10.4V5.8L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V11.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="14.5" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">CVE Detection</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Instant mapping of dependencies to known CVEs with real-time updates.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/10 bg-[#07162f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 16L10 11L13 14L19 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 8H19V12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.5 6.5L7 9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 6.5L4.5 9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">AI Fixes</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Automatically generated PRs to patch vulnerabilities with minimal breaking changes.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/10 bg-[#07162f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="16" cy="7.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="16" cy="16.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M10.1 10.9L13.8 8.6M10.1 13.1L13.8 15.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Webhook Monitoring</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Monitor every push and pull request for new dependency risks.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/10 bg-[#07162f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M12 8V12L14.8 14.3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Scheduled Scanning</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Continuous background scanning for newly discovered zero-day exploits.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/10 bg-[#07162f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M8 10H10M8 14H10M14 10H16M14 14H16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Risk Scoring</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">
                A proprietary 1–100 score based on reachability and exploitability.
              </p>
            </div>
          </div>
        </section>

                {/* SECTION: DASHBOARD PREVIEW */}
        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Dashboard Preview
            </p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              See Your Repository Risk
              <br />
              in One Unified Dashboard
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Explore dependency relationships, identify vulnerable packages, and
              prioritize risk with a web dashboard built for fast decisions.
            </p>
          </div>

          <div className="mt-12 sm:mt-14">
            <div className="overflow-hidden rounded-[28px] border border-cyan-500/20 bg-[#07152f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              {/* TOP BAR */}
              <div className="flex items-center justify-between border-b border-cyan-500/10 bg-[#081a36] px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="ml-3 hidden rounded-lg bg-[#0d2347] px-3 py-1.5 text-xs text-slate-400 sm:block">
                    dashboard.gitgraph.ai
                  </div>
                </div>

                <div className="rounded-xl bg-red-500/15 px-3 py-2 text-[10px] font-bold uppercase leading-4 text-red-300 sm:px-4 sm:text-xs">
                  Critical Risk: 84
                </div>
              </div>

              {/* CONTENT */}
              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
                {/* LEFT SIDE */}
                <div className="rounded-3xl border border-cyan-500/10 bg-[#081a36] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Dependency Map
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-white">
                        Main Repository Graph
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Repo: gitgraph-engine
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10244a] text-slate-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="11" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.8" />
                          <path
                            d="M16 16L20 20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>

                      <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10244a] text-slate-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 5V19"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5 12H19"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-500/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_55%),linear-gradient(180deg,#0b1a34_0%,#09142b_100%)] p-4 sm:p-6">
                    <svg
                      viewBox="0 0 620 360"
                      className="h-auto w-full"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line x1="70" y1="220" x2="150" y2="180" stroke="#94a3b8" strokeOpacity="0.28" />
                      <line x1="150" y1="180" x2="230" y2="120" stroke="#94a3b8" strokeOpacity="0.28" />
                      <line x1="230" y1="120" x2="320" y2="160" stroke="#94a3b8" strokeOpacity="0.28" />
                      <line x1="320" y1="160" x2="420" y2="110" stroke="#94a3b8" strokeOpacity="0.28" />
                      <line x1="420" y1="110" x2="520" y2="170" stroke="#94a3b8" strokeOpacity="0.28" />
                      <line x1="120" y1="270" x2="190" y2="220" stroke="#94a3b8" strokeOpacity="0.25" />
                      <line x1="190" y1="220" x2="290" y2="240" stroke="#94a3b8" strokeOpacity="0.25" />
                      <line x1="290" y1="240" x2="390" y2="210" stroke="#94a3b8" strokeOpacity="0.25" />
                      <line x1="390" y1="210" x2="500" y2="250" stroke="#94a3b8" strokeOpacity="0.25" />
                      <line x1="150" y1="180" x2="190" y2="220" stroke="#94a3b8" strokeOpacity="0.22" />
                      <line x1="230" y1="120" x2="290" y2="240" stroke="#94a3b8" strokeOpacity="0.22" />
                      <line x1="320" y1="160" x2="390" y2="210" stroke="#94a3b8" strokeOpacity="0.22" />
                      <line x1="420" y1="110" x2="500" y2="250" stroke="#94a3b8" strokeOpacity="0.22" />
                      <line x1="230" y1="120" x2="420" y2="110" stroke="#94a3b8" strokeOpacity="0.18" />
                      <line x1="190" y1="220" x2="390" y2="210" stroke="#94a3b8" strokeOpacity="0.18" />
                      <line x1="70" y1="220" x2="120" y2="270" stroke="#94a3b8" strokeOpacity="0.18" />
                      <line x1="500" y1="250" x2="560" y2="210" stroke="#94a3b8" strokeOpacity="0.18" />

                      <circle cx="70" cy="220" r="7" fill="#cbd5e1" fillOpacity="0.7" />
                      <circle cx="120" cy="270" r="7" fill="#cbd5e1" fillOpacity="0.55" />
                      <circle cx="150" cy="180" r="8" fill="#d6a36f" />
                      <circle cx="190" cy="220" r="7" fill="#cbd5e1" fillOpacity="0.7" />
                      <circle cx="230" cy="120" r="8" fill="#cbd5e1" fillOpacity="0.7" />
                      <circle cx="290" cy="240" r="8" fill="#cbd5e1" fillOpacity="0.6" />
                      <circle cx="320" cy="160" r="8" fill="#cbd5e1" fillOpacity="0.65" />
                      <circle cx="390" cy="210" r="8" fill="#d6a36f" />
                      <circle cx="420" cy="110" r="8" fill="#cbd5e1" fillOpacity="0.65" />
                      <circle cx="500" cy="250" r="8" fill="#cbd5e1" fillOpacity="0.6" />
                      <circle cx="520" cy="170" r="7" fill="#cbd5e1" fillOpacity="0.5" />
                      <circle cx="560" cy="210" r="7" fill="#cbd5e1" fillOpacity="0.45" />
                    </svg>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-4">
                  <div className="rounded-3xl border border-cyan-500/10 bg-[#081a36] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Recent Vulnerabilities
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-red-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">lodash</h4>
                            <p className="mt-1 text-[11px] text-slate-400">
                              CVE-2023-1234: Prototype Pollution
                            </p>
                          </div>
                          <span className="rounded-md bg-red-500 px-2 py-1 text-[9px] font-bold uppercase text-white">
                            Critical
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-orange-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">axios</h4>
                            <p className="mt-1 text-[11px] text-slate-400">
                              CVE-2023-5678: SSRF Vulnerability
                            </p>
                          </div>
                          <span className="rounded-md bg-orange-500 px-2 py-1 text-[9px] font-bold uppercase text-white">
                            High
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-yellow-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">express</h4>
                            <p className="mt-1 text-[11px] text-slate-400">
                              CVE-2022-9998: ReDoS in router
                            </p>
                          </div>
                          <span className="rounded-md bg-yellow-400 px-2 py-1 text-[9px] font-bold uppercase text-slate-950">
                            Medium
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-cyan-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">moment</h4>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Deprecated: Use date-fns instead
                            </p>
                          </div>
                          <span className="rounded-md bg-cyan-400 px-2 py-1 text-[9px] font-bold uppercase text-slate-950">
                            Low
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="mt-5 w-full rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20">
                      View Full Report
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-red-500/10 bg-[#081a36] p-4">
                      <p className="text-xs text-slate-500">Critical Packages</p>
                      <p className="mt-2 text-3xl font-bold text-white">12</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/10 bg-[#081a36] p-4">
                      <p className="text-xs text-slate-500">Health Score</p>
                      <p className="mt-2 text-3xl font-bold text-white">84%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION: VALUE + TECH STACK */}
        <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_35%)]" />

          {/* VALUE POINTS */}
          <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 md:grid-cols-3 md:gap-10 lg:gap-12">
              <div className="rounded-[28px] border border-cyan-500/10 bg-[#07162f]/75 p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                <h3 className="text-3xl font-extrabold leading-tight text-cyan-400 sm:text-[2rem]">
                  Direct + Transitive
                </h3>
                <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
                  We don’t just scan your package.json. We scan the packages your
                  packages use, all the way down.
                </p>
              </div>

              <div className="rounded-[28px] border border-cyan-500/10 bg-[#07162f]/75 p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                <h3 className="text-3xl font-extrabold leading-tight text-cyan-400 sm:text-[2rem]">
                  Real-time + Scheduled
                </h3>
                <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
                  Continuous monitoring through CI/CD integration combined with
                  daily full-stack re-scans.
                </p>
              </div>

              <div className="rounded-[28px] border border-cyan-500/10 bg-[#07162f]/75 p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                <h3 className="text-3xl font-extrabold leading-tight text-cyan-400 sm:text-[2rem]">
                  Full Ecosystem
                </h3>
                <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
                  Support for npm, PyPI, Maven, Go Modules, and Docker images in a
                  single unified view.
                </p>
              </div>
            </div>
          </div>

          {/* DIVIDER + LABEL */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="relative flex items-center justify-center">
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <span className="relative bg-[#020817] px-5 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Powering Global Security Teams
              </span>
            </div>
          </div>

        <div className="mx-auto mt-10 max-w-6xl overflow-x-auto">
  <div className="flex min-w-max items-center justify-center gap-4 sm:gap-5">
    {[
      "React",
      "Node.js",
      "TigerGraph",
      "GitHub API",
      "NVD Database",
      "OpenAI / LLM",
    ].map((tech) => (
      <span
        key={tech}
        className="whitespace-nowrap rounded-full border border-cyan-500/15 bg-[#0a1d3b]/90 px-6 py-3 text-base font-semibold text-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-[#0d2448] hover:text-white sm:px-7 sm:py-3.5 sm:text-lg"
      >
        {tech}
      </span>
    ))}
  </div>
</div>

        </section>


<Footer/>

      </main>
    </div>
  );
}