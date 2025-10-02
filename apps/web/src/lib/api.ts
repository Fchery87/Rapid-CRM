import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getTokenClient(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function requestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-expect-error
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function apiGet(path: string, init?: RequestInit) {
  let headers: Record<string, string> = { ...(init?.headers as any) };
  headers["X-Request-ID"] = headers["X-Request-ID"] || requestId();

  // On server, read from next/headers; on client, from document.cookie
  if (typeof window === "undefined") {
    try {
      const tok = cookies().get("token")?.value;
      if (tok) headers["Authorization"] = `Bearer ${tok}`;
    } catch {}
  } else {
    const tok = getTokenClient();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: any, init?: RequestInit) {
  let headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as any) };
  headers["X-Request-ID"] = headers["X-Request-ID"] || requestId();

  if (typeof window === "undefined") {
    try {
      const tok = cookies().get("token")?.value;
      if (tok) headers["Authorization"] = `Bearer ${tok}`;
    } catch {}
  } else {
    const tok = getTokenClient();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`API POST ${path} failed: ${res.status}`);
  return res.json();
}