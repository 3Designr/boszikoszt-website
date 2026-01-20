import { NextResponse } from "next/server";

// Basic in-memory limiter (works well in dev / single instance).
// On serverless it may reset between invocations. For production, use Upstash/Redis.
const attemptsByIp = new Map();

/**
 * attemptsByIp structure:
 * ip -> { count: number, lastAttemptMs: number, lockedUntilMs: number }
 */
function getClientIp(req) {
  // Vercel/Proxies commonly set x-forwarded-for
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
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

  const { pin } = await req.json().catch(() => ({ pin: "" }));
  const expected = process.env.TESTER_PIN || "";

  const isOk = typeof pin === "string" && expected && pin === expected;

  if (isOk) {
    // reset on success
    attemptsByIp.delete(ip);
    return NextResponse.json({ ok: true });
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
