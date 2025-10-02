import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function makeTargetUrl(pathname: string): string {
  // Strip /api/proxy prefix
  const after = pathname.replace(/^\/api\/proxy/, "");
  return `${API_URL}${after}`;
}

function ensureRequestId(headers: Headers) {
  if (!headers.get("X-Request-ID")) {
    headers.set("X-Request-ID", `req_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  }
}

async function forward(req: NextRequest, method: string, body?: BodyInit | null) {
  const url = new URL(req.url);
  const target = new URL(makeTargetUrl(url.pathname));
  target.search = url.search;

  const hdrs = new Headers(req.headers);
  // Attach JWT from cookie
  const tok = cookies().get("token")?.value;
  if (tok) hdrs.set("Authorization", `Bearer ${tok}`);

  // Remove host header to avoid mismatch
  hdrs.delete("host");
  ensureRequestId(hdrs);

  const res = await fetch(target.toString(), {
    method,
    headers: hdrs,
    body
  });

  const outHeaders = new Headers(res.headers);
  // mirror request id from upstream if present
  const rid = res.headers.get("x-request-id");
  if (rid) outHeaders.set("x-request-id", rid);

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: res.status,
    headers: outHeaders
  });
}

export async function GET(req: NextRequest) {
  return forward(req, "GET");
}

export async function DELETE(req: NextRequest) {
  return forward(req, "DELETE");
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  let body: BodyInit | null = null;
  if (ct.includes("application/json")) {
    const json = await req.json();
    body = JSON.stringify(json);
  } else {
    body = await req.arrayBuffer();
  }
  return forward(req, "POST", body);
}

export async function PUT(req: NextRequest) {
  const data = await req.arrayBuffer();
  return forward(req, "PUT", data);
}

export async function PATCH(req: NextRequest) {
  const data = await req.arrayBuffer();
  return forward(req, "PATCH", data);
}