"use client";
import { useState } from "react";
import { post } from "../hooks/useApi";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" }),
    [err, setErr] = useState("");
  const router = useRouter();

  const handle = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e: any) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await post("/auth/login", form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={submit} className="card w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">Login</h2>
        <div>
          <label>Email</label>
          <input name="email" onChange={handle} className="input" required />
        </div>
        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            onChange={handle}
            className="input"
            required
          />
        </div>
        {err && <p className="text-red-600">{err}</p>}
        <button type="submit" className="btn btn-primary w-full">
          Sign In
        </button>
      </form>
    </div>
  );
}
