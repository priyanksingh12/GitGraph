import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("🚀 AuthSuccess started");

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        console.log("🔑 Token from URL:", token);

        // ❌ No token → login
        if (!token) {
          console.error("❌ No token received");
          navigate("/login", { replace: true });
          return;
        }

        // 🧹 Clean old data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ✅ Save token
        localStorage.setItem("token", token);
        console.log("✅ TOKEN SAVED");

        /* =========================
           🔥 VERIFY USER (IMPORTANT FIX)
        ========================= */
        const res = await getCurrentUser();
        const user = res?.data?.user;

        console.log("👤 User fetched:", user);

        if (!user) {
          throw new Error("User fetch failed");
        }

        // ✅ Save user
        localStorage.setItem("user", JSON.stringify(user));

        console.log("✅ USER SAVED");

        /* =========================
           🚀 REDIRECT
        ========================= */
        navigate("/dashboard", { replace: true });

      } catch (err) {
        console.error("❌ Auth success error:", err?.response?.data || err.message);

        // 🧹 Cleanup
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] text-white">
      <div className="animate-spin h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
      <h1 className="text-xl font-semibold">Connecting GitHub...</h1>
      <p className="text-gray-400 mt-2 text-sm">
        Verifying your session ⚡
      </p>
    </div>
  );
};

export default AuthSuccess;