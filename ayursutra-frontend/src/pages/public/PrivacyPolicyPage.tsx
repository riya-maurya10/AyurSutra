import { ArrowLeft, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">
      {/* Header */}
      <header className="border-b border-[#D9DDCE] bg-[#F7F6F0]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3D2E] text-white">
              <Leaf size={19} />
            </div>

            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#71834F]">
                AyurSutra
              </p>

              <p className="text-sm font-semibold text-[#1F3D2E]">
                Wellness Care
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 rounded-full border border-[#C8CCBF] bg-white px-4 py-2.5 text-sm font-medium text-[#36533F] transition hover:bg-[#F0F2EA]"
          >
            <ArrowLeft size={16} />
            Back to Registration
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
        {/* Heading */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#71834F]">
            AyurSutra
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#173D2D] sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667064]">
            This Privacy Policy explains how AyurSutra collects, uses,
            protects, and manages information when you use the platform.
          </p>

          <p className="mt-3 text-xs text-[#8A927B]">
            Last updated: August 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              1. Information We Collect
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              When you create an AyurSutra account or use the platform,
              information may be collected to support your account and
              provide the services available through the system.
            </p>

            <p className="mt-3 leading-7 text-[#596458]">
              This may include your name, email address, phone number,
              age, gender, address, account information, and other
              information entered into the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              2. Health and Treatment Information
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              AyurSutra may store information related to your Ayurvedic
              care, including medical history, therapy plans, therapy
              sessions, diet plans, progress assessments, observations,
              practitioner notes, and recommendations.
            </p>

            <p className="mt-3 leading-7 text-[#596458]">
              Such information is used to support the management and
              documentation of your treatment journey within the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              3. How We Use Information
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Information collected through AyurSutra may be used to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-[#596458]">
              <li>Create and manage patient accounts.</li>
              <li>Display personalized therapy information.</li>
              <li>Manage therapy schedules and sessions.</li>
              <li>Provide diet and wellness recommendations.</li>
              <li>Record and display treatment progress.</li>
              <li>Support communication between authorized users.</li>
              <li>Maintain the security and operation of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              4. Information Sharing
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Patient information may be accessible to authorized
              practitioners, healthcare staff, and other authorized users
              when necessary for providing or managing Ayurvedic care
              through the platform.
            </p>

            <p className="mt-3 leading-7 text-[#596458]">
              AyurSutra does not intend to make private patient
              information publicly available through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              5. Data Security
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Reasonable technical and organizational measures may be
              used to protect information stored within AyurSutra from
              unauthorized access, alteration, disclosure, or
              destruction.
            </p>

            <p className="mt-3 leading-7 text-[#596458]">
              However, no digital system can guarantee absolute security.
              Users should also protect their account credentials and
              avoid sharing passwords with others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              6. Account Information
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              You are responsible for keeping the information associated
              with your account accurate and up to date. You should
              immediately report suspected unauthorized access to your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              7. Data Retention
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Information may be retained for as long as necessary to
              support the operation of AyurSutra, maintain treatment
              records, satisfy applicable requirements, or fulfil the
              purposes for which the information was collected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              8. Your Privacy Choices
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Depending on the functionality available within AyurSutra,
              you may be able to review or update certain account
              information. Requests concerning personal information may
              also be directed to the organization or administrator
              responsible for operating the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              9. Cookies and Technical Information
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              AyurSutra may use essential technical mechanisms, such as
              authentication tokens or similar technologies, to keep
              users signed in and allow the platform to operate securely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              10. Third-Party Services
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              The platform may rely on third-party infrastructure or
              services to support hosting, storage, authentication, or
              other technical functionality. Such services may process
              information only as necessary to provide their respective
              functions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              11. Changes to This Privacy Policy
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              This Privacy Policy may be updated when necessary. The
              updated version will be made available through the
              AyurSutra platform, together with the date of the latest
              update.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              12. Contact
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              If you have questions about this Privacy Policy or how
              your information is handled, please contact the AyurSutra
              administration or the organization operating the platform.
            </p>
          </section>

          {/* Terms Link */}
          <section className="border-t border-[#D9DDCE] pt-8">
            <p className="text-sm leading-7 text-[#596458]">
              Please also review our Terms & Conditions governing your
              use of the AyurSutra platform.
            </p>

            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="mt-3 text-sm font-semibold text-[#71834F] underline underline-offset-4 hover:text-[#4F673D]"
            >
              Read our Terms & Conditions
            </button>
          </section>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t border-[#D9DDCE] pt-8">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 rounded-full bg-[#1F3D2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#294C3A]"
          >
            <ArrowLeft size={16} />
            Back to Registration
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D9DDCE] bg-[#F1F1E9]">
        <div className="mx-auto max-w-6xl px-6 py-7 text-center">
          <p className="text-xs text-[#7A8175]">
            © 2026 AyurSutra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPolicyPage;