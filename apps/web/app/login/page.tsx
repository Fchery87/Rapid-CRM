"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        const token = data.token as string;
        document.cookie = `token=${token}; Path=/; SameSite=Lax`;
        router.push("/reports");
      } catch (e: any) {
        setErr(e.message || "Login failed");
      }
    });
  }

  return (
    <div aria-labelledby="login-title" className="bg-white p-6 rounded-lg shadow border">
      <h1 id="login-title" className="text-xl font-semibold mb-4">
        Sign in
      </h1>
      {err && (
        <div role="alert" className="text-sm text-red-700 mb-2">
          {err}
        </div>
      )}
      <form className="space-y-4" noValidate aria-describedby="login-help" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <p id="login-help" className="text-sm text-gray-600">
          Use any email and the password <code>password</code> in this demo.
        </p>
        <button
          type="submit"
          aria-busy={isPending}
          className="w-full rounded-md bg-brand-700 text-white px-4 py-2 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          {isPending ? "Signing in..." : "Continue"}
        </button>
      </form>
    </div>
  );
}