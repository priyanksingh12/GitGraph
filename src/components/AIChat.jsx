import { useState } from "react";
import API from "../api";

const AIChat = ({ repoData }) => {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!msg) return;

    const res = await API.post("/api/ai-chat", {
      question: msg,
      repoData
    });

    setChat([
      ...chat,
      { q: msg, a: res.data.answer }
    ]);

    setMsg("");
  };

  return (
    <div className="bg-[#07162f] p-4 rounded-xl mt-6">
      <h2 className="text-lg mb-3">🤖 AI Security Assistant</h2>

      <div className="h-40 overflow-y-auto mb-3">
        {chat.map((c, i) => (
          <div key={i} className="mb-2">
            <p className="text-cyan-400">Q: {c.q}</p>
            <p className="text-gray-300">A: {c.a}</p>
          </div>
        ))}
      </div>

      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Ask about vulnerabilities..."
        className="w-full p-2 rounded bg-black text-white"
      />

      <button
        onClick={sendMessage}
        className="mt-2 bg-cyan-400 text-black px-3 py-1 rounded"
      >
        Ask
      </button>
    </div>
  );
};

export default AIChat;