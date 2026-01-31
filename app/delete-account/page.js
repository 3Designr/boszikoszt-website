"use client";

export default function DeleteAccountPage() {
  const email = "boszikoszt@gmail.com";

  const subject = encodeURIComponent("Account Deletion Request");
  const body = encodeURIComponent(
    `Hello Boszikoszt Support,\n\nI would like to request deletion of my account and associated personal data.\n\nPlease delete:\n- My account\n- My stored profile details (name, email, phone, address)\n- Any order-related personal data linked to my account (where applicable)\n\nMy account email/identifier: [ENTER YOUR EMAIL HERE]\n\nI understand deletion is permanent and cannot be undone.\n\nThank you.`
  );

  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-4xl font-bold text-red-600 mb-6">
        Request Account Deletion
      </h1>

      <p className="mb-6">
        You can request that your Boszikoszt account and associated personal data
        be permanently deleted at any time.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        How to Request Deletion
      </h2>

      <ol className="list-decimal list-inside space-y-2 mb-6">
        <li>
          Send an email to{" "}
          <a className="text-blue-400 underline hover:text-blue-300" href={`mailto:${email}`}>
            {email}
          </a>
        </li>
        <li>
          Use the subject line: <span className="font-semibold">Account Deletion Request</span>
        </li>
        <li>
          Include the email (or identifier) you used to register so we can locate
          your account.
        </li>
      </ol>

      <a
        href={mailto}
        className="inline-block px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition"
      >
        Email Deletion Request
      </a>

      <h2 className="text-2xl font-semibold mt-10 mb-2 text-red-500">
        What Data Will Be Deleted
      </h2>
      <ul className="list-disc list-inside space-y-1 mb-6">
        <li>Account profile information (name, email, phone number, address)</li>
        <li>Any personal data associated with your account</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Deletion Timeframe
      </h2>
      <p className="mb-6">
        After we receive and verify your request, we aim to complete deletion
        within a reasonable timeframe (typically within <span className="font-semibold">48 hours</span>).
        Deletion is permanent and cannot be reversed.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2 text-red-500">
        Verification
      </h2>
      <p className="mb-6">
        For security, we may ask you to confirm the request from the same email
        address used to create the account (or provide enough information to
        verify ownership).
      </p>
    </main>
  );
}
