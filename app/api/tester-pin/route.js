// app/api/tester-pin/route.js

import { NextResponse } from "next/server";

// ========= Rate limit for PIN attempts =========
const attemptsByIp = new Map();
/**
 * attemptsByIp:
 * ip -> { count: number, lastAttemptMs: number, lockedUntilMs: number }
 */

// ========= Download token store (in-memory) =========
// token -> { ip: string, platform: "android"|"ios", expiresAtMs: number, used: boolean }
const downloadTokens = new Map();

// Token settings
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function issueDownloadToken({ ip, platform }) {
  const token =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  downloadTokens.set(token, {
    ip,
    platform,
    expiresAtMs: Date.now() + TOKEN_TTL_MS,
    used: false,
  });

  return token;
}

// Optional: tiny cleanup so the map doesn't grow forever
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, meta] of downloadTokens.entries()) {
    if (!meta || meta.used || meta.expiresAtMs <= now) {
      downloadTokens.delete(token);
    }
  }
}

export async function POST(req) {
  cleanupExpiredTokens();

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

    // issue short-lived tokens for downloads
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
    // lock for 10 minutes
    record.lockedUntilMs = now + 10 * 60 * 1000;
  }

  attemptsByIp.set(ip, record);

  return NextResponse.json(
    { ok: false, reason: "invalid", remaining: Math.max(0, 5 - record.count) },
    { status: 401 }
  );
}

export { downloadTokens };
