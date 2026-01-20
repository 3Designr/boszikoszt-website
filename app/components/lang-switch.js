"use client";

import { useLang } from "@/app/lib/lang-context";

export default function LangSwitch() {
  const { lang, setLang } = useLang();

  return (
    <div className="fixed top-4 left-4 flex gap-2 z-50">
      <button
        onClick={() => setLang("hu")}
        className={`px-3 py-1 text-sm rounded ${
          lang === "hu" ? "bg-red-600" : "bg-gray-700"
        }`}
      >
        HUN
      </button>

      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 text-sm rounded ${
          lang === "en" ? "bg-red-600" : "bg-gray-700"
        }`}
      >
        ENG
      </button>
    </div>
  );
}
