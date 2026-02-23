"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";

export default function FieldAdminLoginPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");

  const handleAuthenticate = () => {
    if (employeeId.trim() && pin.length >= 4) {
      router.push("/fieldadmin");
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
          Enter Employee ID to access your task queue
        </p>

        <input
          type="text"
          placeholder="Employee ID (e.g. PWD-402)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <input
          type="password"
          placeholder="4-Digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          maxLength={4}
          className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={handleAuthenticate}
          className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold rounded-xl py-3.5 transition-colors shadow-md"
        >
          Authenticate
        </button>
      </div>
    </div>
  );
}
