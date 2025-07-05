"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { post } from "../hooks/useApi";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
  };
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handle = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await post<LoginResponse>("/auth/login", form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setErr(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">IoT Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Login to control and monitor your smart devices
          </p>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            onChange={handle}
            value={form.email}
            className="input w-full"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={handle}
            value={form.password}
            className="input w-full pr-10"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-9 right-3 text-gray-500"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button type="submit" className="btn btn-primary w-full">
          Sign In
        </button>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign up
          </button>
        </div>

        <div className="text-xs text-center text-gray-400 pt-2">
          ⚡ Monitor energy usage, control appliances, and reduce power bills.
        </div>
      </form>
    </div>
  );
}
