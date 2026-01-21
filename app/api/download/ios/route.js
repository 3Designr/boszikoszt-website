// app/api/download/ios/route.js

import { NextResponse } from "next/server";
import { downloadTokens } from "@/app/api/tester-pin/route";

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export async function GET(req) {
  const ip = getClientIp(req);
  const { searchParams } = new URL(req.url);
  const token = String(searchParams.get("token") ?? "").trim();

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  const meta = downloadTokens.get(token);
  if (!meta) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  if (meta.used) {
    return NextResponse.json({ ok: false, error: "Token already used" }, { status: 401 });
  }

  if (meta.platform !== "ios") {
    return NextResponse.json({ ok: false, error: "Wrong platform token" }, { status: 401 });
  }

  if (Date.now() > meta.expiresAtMs) {
    downloadTokens.delete(token);
    return NextResponse.json({ ok: false, error: "Token expired" }, { status: 401 });
  }

  if (meta.ip !== ip) {
    return NextResponse.json({ ok: false, error: "Token IP mismatch" }, { status: 401 });
  }

  const ipaUrl = String(process.env.IOS_IPA_URL ?? "").trim();
  if (!ipaUrl) {
    return NextResponse.json({ ok: false, error: "IOS_IPA_URL not configured" }, { status: 500 });
  }

  meta.used = true;
  downloadTokens.set(token, meta);

  return NextResponse.redirect(ipaUrl, { status: 302 });
}
