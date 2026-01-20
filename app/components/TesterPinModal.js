"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/app/lib/lang-context";

export default function TesterPinModal({ open, onClose }) {
  const { t } = useLang();

  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | error | locked | success
  const [errorMsg, setErrorMsg] = useState("");
  const [remaining, setRemaining] = useState(5);

  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const now = Date.now();
  const isCoolingDown = now < cooldownUntil;
  const isLocked = now < lockedUntil;

  const cooldownSecondsLeft = useMemo(() => {
    if (!isCoolingDown) return 0;
    return Math.ceil((cooldownUntil - now) / 1000);
  }, [cooldownUntil, now, isCoolingDown]);

  const lockedSecondsLeft = useMemo(() => {
    if (!isLocked) return 0;
    return Math.ceil((lockedUntil - now) / 1000);
  }, [lockedUntil, now, isLocked]);

  useEffect(() => {
    if (!open) {
      setPin("");
      setStatus("idle");
      setErrorMsg("");
      setRemaining(5);
      setCooldownUntil(0);
      setLockedUntil(0);
    }
  }, [open]);

  // Refresh countdown display
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setCooldownUntil((v) => v);
      setLockedUntil((v) => v);
    }, 250);
    return () => clearInterval(id);
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLocked || isCoolingDown) return;

    if (!pin.trim()) {
      setStatus("error");
      setErrorMsg(t("testerModal.errorEmpty"));
      return;
    }

    // client cooldown
    setCooldownUntil(Date.now() + 2000);
    setStatus("checking");
    setErrorMsg("");

    try {
      const res = await fetch("/api/tester-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus("success");
        setErrorMsg("");
        return; // IMPORTANT: don't close modal
      }

      // rate limits
      if (res.status === 429) {
        if (data?.reason === "cooldown") {
          const waitMs = Number(data?.waitMs || 2000);
          setCooldownUntil(Date.now() + waitMs);
          setStatus("error");
          setErrorMsg(t("testerModal.errorCooldown"));
          return;
        }
        if (data?.reason === "locked") {
          const lockedForMs = Number(data?.lockedForMs || 600000);
          setLockedUntil(Date.now() + lockedForMs);
          setStatus("locked");
          setErrorMsg(t("testerModal.errorLocked"));
          return;
        }
      }

      // invalid pin
      const nextRemaining =
        typeof data?.remaining === "number"
          ? data.remaining
          : Math.max(0, remaining - 1);

      setRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        setLockedUntil(Date.now() + 10 * 60 * 1000);
        setStatus("locked");
        setErrorMsg(t("testerModal.errorLocked"));
      } else {
        setStatus("error");
        setErrorMsg(t("testerModal.errorInvalid"));
      }
    } catch {
      setStatus("error");
      setErrorMsg(t("testerModal.errorNetwork"));
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        aria-label={t("testerModal.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-gray-700 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">{t("testerModal.title")}</h3>
            <p className="mt-1 text-sm text-gray-300">{t("testerModal.subtitle")}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition"
            aria-label={t("testerModal.close")}
          >
            ✕
          </button>
        </div>

        {/* SUCCESS UI */}
        {status === "success" ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-200">{t("testerModal.successText")}</p>

            <a
              href="/downloads/boszikoszt-android.apk"
              className="block w-full text-center rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 transition"
              download
            >
              {t("testerModal.downloadAndroid")}
            </a>

            {/* <a
              href="/downloads/boszikoszt-ios.ipa"
              className="block w-full text-center rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
              download
            >
              {t("testerModal.downloadIOS")}
            </a> */}

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-gray-700 py-3 font-semibold text-gray-200 hover:bg-white/5 transition"
            >
              {t("testerModal.close")}
            </button>
          </div>
        ) : (
          // PIN FORM UI
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {t("testerModal.pinLabel")}
              </label>

              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white outline-none focus:border-red-600"
                placeholder={t("testerModal.pinPlaceholder")}
                disabled={status === "checking" || isLocked}
              />
            </div>

            {errorMsg ? <div className="text-sm text-red-400">{errorMsg}</div> : null}

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                {t("testerModal.remaining")}: {Math.max(0, remaining)}
              </span>

              {isLocked ? (
                <span>
                  {t("testerModal.lockedFor")}: {lockedSecondsLeft}s
                </span>
              ) : isCoolingDown ? (
                <span>
                  {t("testerModal.tryAgainIn")}: {cooldownSecondsLeft}s
                </span>
              ) : (
                <span>{t("testerModal.limitNote")}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "checking" || isLocked || isCoolingDown}
              className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:hover:bg-red-600"
            >
              {status === "checking" ? t("testerModal.checking") : t("testerModal.submit")}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-gray-700 py-3 font-semibold text-gray-200 hover:bg-white/5 transition"
            >
              {t("testerModal.cancel")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
