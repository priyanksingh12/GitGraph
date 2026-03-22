import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          console.error("❌ No token received");
          navigate("/login");
          return;
        }

        // 🧹 Remove old token first (IMPORTANT)
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // 🔥 Save new token
        localStorage.setItem("token", token);
        console.log("✅ NEW TOKEN SAVED:", token);

        // 🔥 Fetch latest user using new token
        const res = await getCurrentUser();
        const user = res?.data?.user;

        if (!user) {
          throw new Error("User not found");
        }

        // 🔥 Save fresh user data
        localStorage.setItem("user", JSON.stringify(user));
        console.log("✅ USER UPDATED:", user);

        // 🚀 Redirect (React way, no reload)
        navigate("/dashboard");

      } catch (err) {
        console.error("❌ Auth success error:", err);

        // 🧹 Cleanup on failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Connecting GitHub...
    </div>
  );
};

export default AuthSuccess;