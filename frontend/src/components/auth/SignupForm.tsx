"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Icon } from "@/components/ui/Icon";

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    try {
      const success = await signup(name, email, password);
      if (success) {
        router.push("/dashboard");
      }
    } catch {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-[460px] bg-white border border-[#c2c6d6] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-8 sm:p-10 flex flex-col items-center">
      {/* Stitch Brand Logo Container */}
      <div className="w-16 h-16 rounded-2xl bg-[#e7eefe] flex items-center justify-center mb-5 text-[#0058be] shadow-sm">
        <Icon name="developer_board" size={36} filled />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#151c27] mb-1.5 text-center tracking-tight font-sans">
        Create your account
      </h1>
      <p className="text-sm text-[#424754] mb-6 text-center">
        Start collaborating in real-time with your team.
      </p>

      {error && (
        <div className="w-full mb-5 p-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-sm flex items-center gap-2">
          <Icon name="error" size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#424754] uppercase tracking-wider" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-[#c2c6d6] rounded-lg bg-white text-[#151c27] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] transition-all shadow-sm"
          />
        </div>

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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#424754] uppercase tracking-wider" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-[#c2c6d6] rounded-lg bg-white text-[#151c27] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] transition-all shadow-sm"
          />
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-[#c2c6d6] text-[#0058be] focus:ring-[#0058be] cursor-pointer shrink-0"
          />
          <label htmlFor="terms" className="text-xs font-medium text-[#424754] cursor-pointer leading-tight">
            I agree to the Terms of Service and Privacy Policy
          </label>
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
            "Create account"
          )}
        </button>
      </form>

      <div className="mt-8 text-center w-full pt-6 border-t border-[#c2c6d6]/60">
        <span className="text-sm text-[#424754]">
          Already have an account?
        </span>
        <Link
          href="/login"
          className="text-sm font-semibold text-[#0058be] hover:text-[#2170e4] hover:underline ml-1.5 transition-colors"
        >
          Login
        </Link>
      </div>
    </div>
  );
};
