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
    jti: crypto.randomBytes(12).toString("hex"),
  };

  const body = base64urlEncode(JSON.stringify(payload));
  const sig = hmacSha256Base64Url(secret, body);
  return `${body}.${sig}`;
}

/**
 * DEBUG: open this in browser to confirm envs are loaded in PROD.
 * This does NOT expose the PIN.
 */
export async function GET() {
  const rawPin = process.env.TESTER_PIN;
  const pin = typeof rawPin === "string" ? rawPin.trim() : "";

  const rawSecret = process.env.DOWNLOAD_TOKEN_SECRET;
  const secret = typeof rawSecret === "string" ? rawSecret.trim() : "";

  return NextResponse.json({
    ok: true,
    env: process.env.VERCEL_ENV || "unknown",
    hasPin: pin.length > 0,
    pinLength: pin.length,
    firstChar: pin ? pin[0] : null,
    lastChar: pin ? pin.slice(-1) : null,
    hasDownloadSecret: secret.length >= 32,
    downloadSecretLength: secret.length,
  });
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
