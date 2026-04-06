🚀 GraphGuardians

🔐 AI-Powered Dependency Security Intelligence Platform

«“We don’t just detect vulnerabilities — we show exactly how they reach your code.”»

---

🧠 The Problem

Modern applications rely heavily on open-source dependencies.

- ⚠️ Hidden transitive vulnerabilities (A → B → C → D)
- ❌ No visibility of attack propagation path
- 🕒 Delayed detection after deployment
- 🧑‍💻 Manual debugging & triaging overhead

👉 Traditional tools (npm audit, Snyk) only show what is vulnerable
👉 They don’t show WHY and HOW it impacts your app

---

💡 Our Solution — GraphGuardians

GraphGuardians is a real-time, AI-powered platform that:

- 🧠 Maps entire dependency graph using TigerGraph
- 🔗 Traces exact dependency → vulnerability propagation paths
- 📊 Visualizes attack chains interactively
- ⚡ Performs real-time scans on every commit
- 📱 Sends instant mobile alerts via Firebase
- 🤖 Generates AI-powered fix suggestions

---

🔥 Core Innovation — Chain Graph

«The first system to visualize complete vulnerability propagation paths.»

Example:

express → serve-static → send → ms → GHSA-XXXX [CRITICAL]

✔ Shows exact attack path (multi-hop)
✔ Highlights severity with colors
✔ Interactive graph visualization
✔ Works on 4000+ node dependency graphs in milliseconds

---

🏗️ System Architecture

Frontend (React Web + Mobile App)
        ↓
Backend (Node.js + Express API)
        ↓
Graph Layer (TigerGraph Cloud)
        ↓
Data Layer (MongoDB + Firebase + OSV.dev)

---

⚙️ Tech Stack

- 🧠 Graph Engine: TigerGraph Cloud
- ⚙️ Backend: Node.js + Express
- 🌐 Frontend: React.js + Tailwind
- 📱 Mobile App: Flutter 
- 🔄 Real-Time: Socket.IO
- 🔔 Notifications: Firebase FCM
- 🤖 AI: OpenAI GPT-3.5
- 🛡️ Vulnerability DB: OSV.dev API

---

✨ Key Features

🔗 Dependency Chain Visualization

- Full graph traversal using TigerGraph
- Interactive force-directed graph
- Severity-based filtering (Critical / High / Medium / Low)

⚡ Real-Time Security Monitoring

- Auto rescan on every GitHub commit
- Live dashboard updates via Socket.IO
- Instant alerts on mobile (<5 sec)

🤖 AI Security Insights

- Batched AI analysis of top vulnerabilities
- Actionable fixes & summaries
- Optimized single-call inference

📱 Cross-Platform Support

- Web dashboard + Mobile app
- Push notifications with deep linking

---

📊 Real-World Performance

- 🔍 4,123 dependencies analyzed per scan
- 🔗 2,793 graph edges stored
- 🚨 1,049 vulnerability chains detected
- 🔴 100 CRITICAL vulnerabilities identified
- ⚡ < 1 sec dashboard render
- 📱 < 5 sec push notification

---

🎥 Demo

👉 Demo Video:
https://drive.google.com/file/d/1QJBNoEcdxjohO44JZctz57B6oBL5Gst5/view?usp=drivesdk

---

📸 Screenshots

👉 https://drive.google.com/drive/folders/1BO918riNZjUSYQUWwg3_2osKcK7moKoc

---

🏆 Competitive Advantage

Feature| Traditional Tools| GraphGuardians
Chain Graph Visualization| ❌| ✅
Transitive Path Detection| Partial| ✅
AI Fix Suggestions| Paid| ✅ Free
Real-Time Monitoring| ❌| ✅
Mobile Alerts| ❌| ✅
Graph Database| ❌| ✅

---

🚀 How It Works

1. 🔗 Connect GitHub repository
2. 📦 Parse dependency tree (package-lock.json)
3. 🛡️ Scan vulnerabilities via OSV.dev
4. 🔄 Store graph in TigerGraph
5. 🧠 Generate AI insights
6. 📊 Visualize chains + send alerts

---

🔮 Future Scope

- 🌍 Multi-language support (Python, Java, Go)
- 🤖 ML-based vulnerability prediction
- 🔔 Slack / Jira integrations
- 📦 SBOM generation
- ⚡ CI/CD integration

---

👥 Team GraphGuardians

- 👨‍💻 Dev Varshney — Team Lead / Backend
- 👨‍💻 Priyank Singh — Frontend
- 👩‍💻 Swastika Singh — App Developer
- 👩‍💻 Ritika Katta — ML Engineer

---

🏁 Hackathon Submission

🏆 Event: IIT Delhi Hackathon
🎯 Track: Open Innovation
🔐 Domain: Cybersecurity + Graph Intelligence

---

⭐ Final Note

«GraphGuardians redefines dependency security by transforming static vulnerability lists into actionable, visual intelligence.»

---

⭐ If you like this project, don’t forget to star the repo!
