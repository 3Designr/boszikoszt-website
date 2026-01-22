import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.TESTER_PIN;
  const pin = typeof raw === "string" ? raw.trim() : "";

  return NextResponse.json({
    env: process.env.VERCEL_ENV || "unknown",
    hasPin: pin.length > 0,
    pinLength: pin.length,
    firstChar: pin ? pin[0] : null,
    lastChar: pin ? pin.slice(-1) : null,
  });
}
