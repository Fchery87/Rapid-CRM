const PROXY_BASE = "/api/proxy";

function requestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-expect-error
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function apiGet(path: string, init?: RequestInit) {
  const headers: Record<string, string> = { ...(init?.headers as any) };
  headers["X-Request-ID"] = headers["X-Request-ID"] || requestId();
  const res = await fetch(`${PROXY_BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: any, init?: RequestInit) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as any) };
  headers["X-Request-ID"] = headers["X-Request-ID"] || requestId();
  const res = await fetch(`${PROXY_BASE}${path}`, { ...init, method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`API POST ${path} failed: ${res.status}`);
  return res.json();
}