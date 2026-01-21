// app/api/download/ios/route.js

import { NextResponse } from "next/server";
import crypto from "node:crypto";

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function base64urlDecodeToString(s) {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = s.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(pad);
  return Buffer.from(b64, "base64").toString("utf8");
}

function base64urlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function hmacSha256Base64Url(secret, message) {
  const h = crypto.createHmac("sha256", secret);
  h.update(message);
  return base64urlEncode(h.digest());
}

function timingSafeEqual(a, b) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function verifyToken(token, { ip, platform }) {
  const secret = String(process.env.DOWNLOAD_TOKEN_SECRET ?? "").trim();
  if (!secret || secret.length < 32) return { ok: false, error: "Server token secret missing" };

  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return { ok: false, error: "Invalid token" };

  const expectedSig = hmacSha256Base64Url(secret, body);
  if (!timingSafeEqual(sig, expectedSig)) return { ok: false, error: "Invalid token" };

  let payload;
  try {
    payload = JSON.parse(base64urlDecodeToString(body));
  } catch {
    return { ok: false, error: "Invalid token" };
  }

  if (!payload?.exp || Date.now() > Number(payload.exp)) return { ok: false, error: "Token expired" };
  if (payload.platform !== platform) return { ok: false, error: "Wrong platform token" };
  if (payload.ip !== ip) return { ok: false, error: "Token IP mismatch" };

  return { ok: true, payload };
}

export async function GET(req) {
  const ip = getClientIp(req);
  const { searchParams } = new URL(req.url);
  const token = String(searchParams.get("token") ?? "").trim();

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  const verified = verifyToken(token, { ip, platform: "ios" });
  if (!verified.ok) {
    return NextResponse.json({ ok: false, error: verified.error }, { status: 401 });
  }

  const ipaUrl = String(process.env.IOS_IPA_URL ?? "").trim();
  if (!ipaUrl) {
    return NextResponse.json({ ok: false, error: "IOS_IPA_URL not configured" }, { status: 500 });
  }

  return NextResponse.redirect(ipaUrl, { status: 302 });
}
