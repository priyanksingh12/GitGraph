import { useState } from "react";
import {
  FaGlobe,
  FaShareAlt,
  FaUsers,
  FaInstagram,
  FaTwitter,
  FaFacebook,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate=useNavigate();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    window.location.href = `mailto:singhpriyanshu741@gmail.com?subject=Message from GitGraph&body=${encodeURIComponent(
      message
    )}`;
    setSent(true);
    setMessage("");

    setTimeout(() => setSent(false), 3000);
  };

  return (
    <footer className="border-t border-cyan-500/10 bg-[#020817] py-24 text-white">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <h3 className="mb-4 text-3xl font-bold tracking-tight text-white">
            GraphGuardians
          </h3>

          <p className="text-base leading-relaxed text-slate-400">
            Visualize dependency relationships, detect hidden vulnerabilities,
            and secure your software supply chain with clarity.
          </p>

          <div className="relative mt-6 flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/15 bg-[#081a36] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
              <FaGlobe />
            </div>

            <div
              onClick={handleShare}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-cyan-500/15 bg-[#081a36] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.08)] transition hover:border-cyan-400/40 hover:text-cyan-300"
            >
              <FaShareAlt />
            </div>

            <a
              href="https://instagram.com/freelanzo"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/15 bg-[#081a36] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.08)] transition hover:border-cyan-400/40 hover:text-cyan-300"
            >
              <FaUsers />
            </a>

            {copied && (
              <span className="absolute -top-10 left-16 rounded-lg border border-cyan-500/20 bg-[#0b1d3d] px-3 py-1 text-sm text-cyan-300">
                Link copied!
              </span>
            )}
          </div>

          <div className="mt-6 text-sm text-slate-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-cyan-400">GitGraph</span>. All
            rights reserved.
          </div>
        </div>

        <div>
          <h4 className="mb-5 text-lg font-semibold uppercase tracking-wide text-white">
            Platform
          </h4>
          <ul className="space-y-3 text-base text-slate-400">
            <li className="transition hover:text-cyan-400">Analyze Repo</li>
            <li className="transition hover:text-cyan-400">Dependency Graph</li>
            <li className="transition hover:text-cyan-400">Risk Insights</li>
            <li className="transition hover:text-cyan-400">Monitoring</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-lg font-semibold uppercase tracking-wide text-white">
            Company
          </h4>
          <ul className="space-y-3 text-base text-slate-400">
           <li
  onClick={() => navigate("/about")}
  className="transition hover:text-cyan-400"
>
  About Us
</li>
            <li className="transition hover:text-cyan-400">Careers</li>
            <li className="transition hover:text-cyan-400">Press</li>
            <li className="transition hover:text-cyan-400">Contact</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-lg font-semibold uppercase tracking-wide text-white">
            Send Us a Message
          </h4>

          <textarea
            className="w-full resize-none rounded-xl border border-cyan-500/15 bg-[#081a36] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
            rows="4"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={handleSend}
            className="mt-3 w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.2)] transition hover:bg-cyan-300"
          >
            Send Message
          </button>

          {sent && (
            <p className="mt-2 text-sm text-cyan-400">
              Message sent successfully!
            </p>
          )}

         <div className="mt-6 flex justify-end gap-5 pr-4">
  <a
    href="https://instagram.com/GitGraph"
    target="_blank"
    rel="noreferrer"
    className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/15 bg-[#081a36] text-cyan-400 text-2xl transition hover:border-cyan-400/40 hover:text-cyan-300"
  >
    <FaInstagram />
  </a>

  <a
    href="https://twitter.com"
    target="_blank"
    rel="noreferrer"
    className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/15 bg-[#081a36] text-cyan-400 text-2xl transition hover:border-cyan-400/40 hover:text-cyan-300"
  >
    <FaTwitter />
  </a>

  <a
    href="https://facebook.com"
    target="_blank"
    rel="noreferrer"
    className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/15 bg-[#081a36] text-cyan-400 text-2xl transition hover:border-cyan-400/40 hover:text-cyan-300"
  >
    <FaFacebook />
  </a>
</div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;