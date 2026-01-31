"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-4xl font-bold text-red-600 mb-6">
        Data & Privacy Policy
      </h1>

      <p className="mb-6">
        By using the Boszikoszt website and mobile application, you agree to the
        following data protection and privacy terms. We are committed to
        handling your personal information transparently, securely, and
        responsibly.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        What Data We Collect
      </h2>
      <p className="mb-4">
        This application collects only the personal information that you
        voluntarily provide during registration and normal use of the service.
        This may include:
      </p>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Delivery address</li>
      </ul>
      <p className="mb-4">
        No hidden, background, or unauthorized data collection takes place.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        How Your Data Is Used
      </h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>To create and manage your user account</li>
        <li>To process and deliver food orders</li>
        <li>To communicate with you regarding your orders or support requests</li>
        <li>To improve application reliability and user experience</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Data Storage & Security
      </h2>
      <p className="mb-4">
        All user information is stored securely within our cloud infrastructure.
        Appropriate technical and organizational security measures are applied,
        including encryption and access controls, to protect your data against
        unauthorized access, loss, or misuse.
      </p>
      <p className="mb-4">
        While administrators may have limited access for maintenance or support
        purposes, only the account owner can modify or request deletion of their
        personal information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Cookies & Tracking
      </h2>
      <p className="mb-4">
        We do not use third-party cookies, tracking pixels, or advertising
        trackers. Session-related information is handled securely within the
        application itself and is not used for external tracking or marketing
        purposes.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Data Sharing
      </h2>
      <p className="mb-4">
        Your personal information is never sold, rented, or shared with third
        parties. Data may only be disclosed if required by applicable law, court
        order, or governmental request.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Your Rights & Data Deletion
      </h2>
      <p className="mb-4">
        You have the right to request the permanent deletion of your account and
        all associated personal data at any time.
      </p>
      <p className="mb-4">
        To request deletion, use our deletion request page:
      </p>

      <Link
        href="/delete-account"
        className="text-blue-400 underline hover:text-blue-300"
      >
        Request account deletion
      </Link>

      <h2 className="text-2xl font-semibold mt-10 mb-2 text-red-500">
        Acceptance of This Policy
      </h2>
      <p className="mb-4">
        By creating an account and using this application, you acknowledge and
        accept the data processing and storage practices described in this
        policy.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Contact
      </h2>
      <p>
        If you have any questions, concerns, or requests regarding your personal
        data, please contact us:
      </p>
      <p className="mt-2">
        📧 boszikoszt@gmail.com
        <br />
        📍 United Kingdom
      </p>
    </main>
  );
}
