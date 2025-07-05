"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { post } from "../hooks/useApi";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post("/auth/register", form);
      toast.success("✅ Signup successful. Please login.");
      router.push("/login");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "❌ Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-indigo-600">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join us and manage your devices smartly.</p>
        </div>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            onChange={handle}
            value={form.name}
            className="input w-full"
            required
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={handle}
            value={form.email}
            className="input w-full"
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block mb-1 font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={handle}
            value={form.password}
            className="input w-full pr-10"
            required
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center gap-2"
          disabled={loading}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By signing up, you agree to our{" "}
          <span className="text-indigo-600 underline cursor-pointer">
            Terms & Conditions
          </span>.
        </p>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
