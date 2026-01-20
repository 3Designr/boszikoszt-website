"use client";

import { createContext, useContext, useState } from "react";

// app/lib -> project root/messages is: ../../messages
import en from "@/app/messages/en.json";
import hu from "@/app/messages/hu.json";
const LangContext = createContext(null);

const dict = { en, hu };

export function LangProvider({ children }) {
  const [lang, setLang] = useState("hu");

  const t = (key) => dict[lang]?.[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
