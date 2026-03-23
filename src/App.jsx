import { Routes, Route } from "react-router-dom";

// ================= PAGES =================
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashBoard";
import GraphPage from "./pages/GraphPage";
import ChainGraph from "./pages/ChainGraph";
import Graph3D from "./pages/Graph3D"; // 🌌 NEW
import Vulnerabilities from "./pages/Vulnerabilities";
import AuthSuccess from "./pages/AuthSuccess";

// ================= COMPONENTS =================
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* ================= PROTECTED ROUTES ================= */}

      {/* 🔥 DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/:repoId"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 🌳 GRAPH (2D) */}
      <Route
        path="/graph/:repoId"
        element={
          <ProtectedRoute>
            <GraphPage />
          </ProtectedRoute>
        }
      />

      {/* 💀 CHAIN GRAPH */}
      <Route
        path="/chain/:repoId"
        element={
          <ProtectedRoute>
            <ChainGraph />
          </ProtectedRoute>
        }
      />

      {/* 🌌 3D GRAPH (🔥 USP) */}
      <Route
        path="/graph3d/:repoId"
        element={
          <ProtectedRoute>
            <Graph3D />
          </ProtectedRoute>
        }
      />

      {/* ⚠️ VULNERABILITIES */}
      <Route
        path="/vulnerabilities/:repoId"
        element={
          <ProtectedRoute>
            <Vulnerabilities />
          </ProtectedRoute>
        }
      />

      {/* 📊 COMPARISON */}
      <Route
        path="/comparison/:repoId"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white text-xl">
              📊 Comparison Coming Soon
            </div>
          </ProtectedRoute>
        }
      />

      {/* 🤖 AI SUGGESTIONS */}
      <Route
        path="/ai/:repoId"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white text-xl">
              🤖 AI Suggestions Coming Soon
            </div>
          </ProtectedRoute>
        }
      />

      {/* ❌ FALLBACK */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white text-xl">
            404 | Page Not Found
          </div>
        }
      />

    </Routes>
  );
}

export default App;