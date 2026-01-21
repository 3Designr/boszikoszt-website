// app/api/download/android/route.js

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

  if (meta.platform !== "android") {
    return NextResponse.json({ ok: false, error: "Wrong platform token" }, { status: 401 });
  }

  if (Date.now() > meta.expiresAtMs) {
    downloadTokens.delete(token);
    return NextResponse.json({ ok: false, error: "Token expired" }, { status: 401 });
  }

  // Bind to same IP that passed PIN
  if (meta.ip !== ip) {
    return NextResponse.json({ ok: false, error: "Token IP mismatch" }, { status: 401 });
  }

  const apkUrl = String(process.env.ANDROID_APK_URL ?? "").trim();
  if (!apkUrl) {
    return NextResponse.json(
      { ok: false, error: "ANDROID_APK_URL not configured" },
      { status: 500 }
    );
  }

  // One-time use
  meta.used = true;
  downloadTokens.set(token, meta);

  // Redirect to GitHub (GitHub serves the file)
  return NextResponse.redirect(apkUrl, { status: 302 });
}
