"use client";

import Image from "next/image";
import { useState } from "react";
import { FaFacebook, FaInstagram, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useLang } from "@/app/lib/lang-context";
import LangSwitch from "@/app/components/lang-switch";
import TesterPinModal from "@/app/components/TesterPinModal";

export default function Home() {
  const { t } = useLang();
  const [pinOpen, setPinOpen] = useState(false);

  // Put your tester signup form here (optional)
  const testerFormUrl = ""; // e.g. "https://forms.gle/xxxx"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white">
      <LangSwitch />

      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center py-20">
        <h1 className="text-5xl font-extrabold mb-6 text-red-600">
          {t("hero.brand")}
        </h1>

        <p className="text-xl text-gray-200 mb-4">{t("hero.tagline")}</p>

        <p className="text-lg font-semibold text-yellow-400 mb-2">
          {t("hero.appNotice")}
        </p>

        {/* Tester CTA -> opens PIN modal */}
        <button
          type="button"
          onClick={() => setPinOpen(true)}
          className="text-sm text-blue-400 underline hover:text-blue-300 transition"
        >
          {t("hero.testerCta")}
        </button>

        <div className="mt-10">
          <Image
            src="/goulash.webp"
            alt={t("hero.imageAlt")}
            width={400}
            height={200}
            className="rounded-3xl border border-red-600 mx-auto"
            priority
          />
        </div>
      </section>

      {/* About Section */}
      <section className="w-full max-w-3xl text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4 text-red-600">
          {t("about.title")}
        </h2>
        <p className="text-lg text-gray-300">{t("about.body")}</p>
      </section>

      {/* Menu Section */}
      <section className="w-full max-w-3xl text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4 text-red-600">
          {t("menu.title")}
        </h2>
        <p className="text-lg text-gray-300 mb-6">{t("menu.body")}</p>

        <Image
          src="/meattray.webp"
          alt={t("menu.imageAlt")}
          width={400}
          height={250}
          className="rounded-3xl border border-red-600 mx-auto"
        />
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-3xl text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4 text-red-600">
          {t("contact.title")}
        </h2>

        <div className="flex flex-col items-center space-y-2">
          <p className="flex items-center gap-2 text-lg text-gray-300">
            <FaPhone /> +44 7415354275
          </p>
          <p className="flex items-center gap-2 text-lg text-gray-300">
            <MdEmail /> boszikoszt@gmail.com
          </p>
          <p className="flex items-center gap-2 text-lg text-gray-300">
            <FaMapMarkerAlt /> {t("contact.location")}
          </p>
        </div>

        <div className="flex justify-center space-x-6 mt-6">
          <a
            aria-label={t("social.facebookLabel")}
            href="https://www.facebook.com/Boszikoszt"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook size={30} className="hover:text-blue-500 transition-colors" />
          </a>
          <a
            aria-label={t("social.instagramLabel")}
            href="https://www.instagram.com/boszikoszt/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={30} className="hover:text-pink-500 transition-colors" />
          </a>
        </div>
      </section>

      <footer className="w-full text-center py-6 border-t border-gray-700 mt-8 text-sm text-gray-400">
        © {new Date().getFullYear()} {t("hero.brand")} – {t("footer.rights")}
      </footer>

      {/* PIN Modal */}
      <TesterPinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onVerified={() => {}}
        testerFormUrl={testerFormUrl}
      />
    </main>
  );
}
