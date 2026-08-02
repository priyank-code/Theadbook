import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import useAuthStore from "../store/useAuthStore";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginStore = useAuthStore((state) => state.login);

  // Demo autofill for quick testing
  const handleQuickDemo = () => {
    setEmail("admin@theadbook.com");
    setPassword("admin123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Real backend API call to Node.js backend
      const response = await API.post("/auth/login", { email, password });

      const { token, user } = response.data;

      // Save to Zustand persist store
      loginStore(token, user);

      setIsLoading(false);

      // Callback to parent or state to switch view
      if (onLogin) {
        onLogin({ ...user, token });
      }
    } catch (err) {
      setIsLoading(false);
      setError(
        err.response?.data?.message || "Invalid credentials or server error!",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-3">
            <Sparkles
              size={28}
              className="text-orange-500 fill-orange-500/20"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AdBook DOOH CMS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to access fleet control & screen schedules
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-red-400 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Official Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="admin@theadbook.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  alert("Password reset link sent to registered email.")
                }
                className="text-[11px] text-orange-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Node...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-[#1f2937] flex flex-col items-center gap-2">
          <p className="text-[11px] text-gray-400">
            Testing credentials mode active
          </p>
          <button
            onClick={handleQuickDemo}
            className="px-3 py-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-orange-400 border border-[#1f2937] rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition"
          >
            <ShieldCheck size={13} /> Auto-fill Super Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
