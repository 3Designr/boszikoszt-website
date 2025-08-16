// app/page.js
'use client'
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white">
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center py-20">
        <h1 className="text-5xl font-extrabold mb-6" style={{ color: '#ff1100' }}>
          Boszikoszt
        </h1>
        <p className="text-xl text-gray-200 mb-4">
          Authentic Hungarian food – made with love ❤️
        </p>
        <p className="text-lg font-semibold text-yellow-400 mb-10">
          📱 We are moving to a mobile app – launching on Android, 1st September!
        </p>
        <Image
          src="/goulash.webp"
          alt="Hungarian Goulash"
          width={400}
          height={200}
          className="rounded-3xl border-1 border-red-600 mx-auto"
          priority
        />
      </section>

      {/* About Section */}
      <section className="w-full max-w-3xl text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#ff1100' }}>
          Who We Are
        </h2>
        <p className="text-lg text-gray-300">
          Boszikoszt brings traditional Hungarian flavors to your table in the UK.
          Freshly prepared, hearty, and always authentic – just like home.
        </p>
      </section>

      {/* Menu Section */}
      <section className="w-full max-w-3xl text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#ff1100' }}>
          Our Menu
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          Weekly trays, soups, and daily specials.
          From roasted chicken to a delicious Hungarian sausage, we deliver comfort food that feels like family.
        </p>
        <Image
          src="/meattray.webp"
          alt="Hungarian Tray"
          width={400}
          height={250}
          className="rounded-3xl border-1 border-red-600 mx-auto"
        />
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-3xl text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#ff1100' }}>
          Get in Touch
        </h2>
        <div className="flex flex-col items-center space-y-2">
          <p className="flex items-center gap-2 text-lg text-gray-300">
            <FaPhone /> +44 7415354275
          </p>
          <p className="flex items-center gap-2 text-lg text-gray-300">
            <MdEmail /> boszikoszt@gmail.com
          </p>
          <p className="flex items-center gap-2 text-lg text-gray-300">
            <FaMapMarkerAlt /> London, United Kingdom
          </p>
        </div>
        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-6">
          <a href="https://www.facebook.com/Boszikoszt" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={30} className="hover:text-blue-500 transition-colors" />
          </a>
          <a href="https://www.instagram.com/boszikoszt/" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={30} className="hover:text-pink-500 transition-colors" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-gray-700 mt-8 text-sm text-gray-400">
        © {new Date().getFullYear()} Boszikoszt – All rights reserved.
      </footer>
    </main>
  );
}
