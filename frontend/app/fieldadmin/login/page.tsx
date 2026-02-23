"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Sun, Moon, Loader2 } from "lucide-react";
import { loginUser } from "@/lib/api";

export default function FieldAdminLoginPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthenticate = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password);
      router.push("/fieldadmin");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginUser("admin@sewasetu.com", "admin_password");
      router.push("/fieldadmin");
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] flex flex-col justify-center items-center px-6 relative transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      {/* Logo */}
      <Image
        src="/logo.png"
        alt="SewaSetu"
        width={120}
        height={40}
        className="mb-8 object-contain"
      />

      {/* Login Card */}
      <div className="w-full bg-white dark:bg-[#0f172a] rounded-[2rem] p-8 shadow-lg dark:border dark:border-white/10 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Staff Portal
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
          Enter your credentials to access your task queue
        </p>

        {error && (
          <div className="w-full text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={handleAuthenticate}
          disabled={loading || !email.trim() || !password}
          className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold rounded-xl py-3.5 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          Authenticate
        </button>

        <div className="w-full my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Continue as Demo Admin
        </button>
      </div>
    </div>
  );
}
