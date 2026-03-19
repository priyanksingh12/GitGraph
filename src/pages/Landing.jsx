import { Link } from "react-router-dom";

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

        {/* SECTION: HOW IT WORKS PLACEHOLDER */}
        <section
          id="how-it-works"
          className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
        >
          <div className="rounded-3xl border border-dashed border-cyan-500/20 bg-slate-900/30 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
              How It Works
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Add your next section here
            </h2>
            <p className="mt-3 text-slate-400">
              Send me the content for this section and I’ll match the same style.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}