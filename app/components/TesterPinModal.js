// app/api/tester-pin/route.js

import { NextResponse } from "next/server";
import crypto from "node:crypto";

// ========= Rate limit for PIN attempts =========
const attemptsByIp = new Map();
/**
 * attemptsByIp:
 * ip -> { count: number, lastAttemptMs: number, lockedUntilMs: number }
 */

const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function base64urlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlEncodeString(str) {
  return base64urlEncode(Buffer.from(str, "utf8"));
}

function hmacSha256Base64Url(secret, message) {
  const h = crypto.createHmac("sha256", secret);
  h.update(message);
  return base64urlEncode(h.digest());
}

function issueDownloadToken({ ip, platform }) {
  const secret = String(process.env.DOWNLOAD_TOKEN_SECRET ?? "").trim();
  if (!secret || secret.length < 32) {
    throw new Error("DOWNLOAD_TOKEN_SECRET missing/too short");
  }

  const payload = {
    ip,
    platform, // "android" | "ios"
    exp: Date.now() + TOKEN_TTL_MS,
    // random id only for uniqueness/debug; not used for one-time enforcement
    jti: crypto.randomBytes(12).toString("hex"),
  };

  const body = base64urlEncodeString(JSON.stringify(payload));
  const sig = hmacSha256Base64Url(secret, body);

  return `${body}.${sig}`;
}

export async function POST(req) {
  const ip = getClientIp(req);
  const now = Date.now();

  const record = attemptsByIp.get(ip) || {
    count: 0,
    lastAttemptMs: 0,
    lockedUntilMs: 0,
  };

  // Hard lock after 5 failed attempts (server-side lock 10 minutes)
  if (record.lockedUntilMs && now < record.lockedUntilMs) {
    return NextResponse.json(
      { ok: false, reason: "locked", lockedForMs: record.lockedUntilMs - now },
      { status: 429 }
    );
  }

  // Enforce 2s spacing between attempts (server-side too)
  if (now - record.lastAttemptMs < 2000) {
    return NextResponse.json(
      { ok: false, reason: "cooldown", waitMs: 2000 - (now - record.lastAttemptMs) },
      { status: 429 }
    );
  }

  record.lastAttemptMs = now;

  const body = await req.json().catch(() => ({}));
  const incomingPin = String(body?.pin ?? "").trim();
  const expected = String(process.env.TESTER_PIN ?? "").trim();

  const isOk = expected.length > 0 && incomingPin === expected;

  if (isOk) {
    // reset attempt limiter on success
    attemptsByIp.delete(ip);

    const androidToken = issueDownloadToken({ ip, platform: "android" });
    const iosToken = issueDownloadToken({ ip, platform: "ios" });

    return NextResponse.json({
      ok: true,
      androidToken,
      iosToken,
      TOKEN_TTL_MS,
    });
  }

  // failed attempt
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntilMs = now + 10 * 60 * 1000;
  }

  attemptsByIp.set(ip, record);

  return NextResponse.json(
    { ok: false, reason: "invalid", remaining: Math.max(0, 5 - record.count) },
    { status: 401 }
  );
}
