"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Icon } from "@/components/ui/Icon";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
      }
    } catch {
      setError("Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white border border-[#c2c6d6] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-8 sm:p-10 flex flex-col items-center">
      {/* Stitch Brand Logo Container */}
      <div className="w-16 h-16 rounded-2xl bg-[#e7eefe] flex items-center justify-center mb-6 text-[#0058be] shadow-sm">
        <Icon name="developer_board" size={36} filled />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#151c27] mb-6 text-center tracking-tight font-sans">
        Welcome back
      </h1>

      {error && (
        <div className="w-full mb-5 p-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-sm flex items-center gap-2">
          <Icon name="error" size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#424754] uppercase tracking-wider" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-[#c2c6d6] rounded-lg bg-white text-[#151c27] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#424754] uppercase tracking-wider" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 pr-11 border border-[#c2c6d6] rounded-lg bg-white text-[#151c27] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#151c27] transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#c2c6d6] text-[#0058be] focus:ring-[#0058be] cursor-pointer"
            />
            <span className="text-xs font-medium text-[#424754] group-hover:text-[#151c27] transition-colors">
              Remember me
            </span>
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset instructions sent to your email!");
            }}
            className="text-xs font-medium text-[#0058be] hover:text-[#2170e4] hover:underline transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 px-4 bg-[#0058be] text-white font-medium text-sm rounded-lg hover:bg-[#2170e4] active:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block animate-spin">
              <Icon name="progress_activity" size={18} />
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="mt-8 text-center w-full pt-6 border-t border-[#c2c6d6]/60">
        <span className="text-sm text-[#424754]">
          Don&apos;t have an account?
        </span>
        <Link
          href="/signup"
          className="text-sm font-semibold text-[#0058be] hover:text-[#2170e4] hover:underline ml-1.5 transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
};
