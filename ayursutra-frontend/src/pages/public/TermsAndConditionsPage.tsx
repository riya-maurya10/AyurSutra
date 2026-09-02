import { ArrowLeft, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TermsAndConditionsPage() {
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
        {/* Page Heading */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#71834F]">
            AyurSutra
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#173D2D] sm:text-5xl">
            Terms & Conditions
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667064]">
            Please read these Terms & Conditions carefully before creating
            an account or using the AyurSutra platform.
          </p>

          <p className="mt-3 text-xs text-[#8A927B]">
            Last updated: August 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              1. Acceptance of Terms
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              By creating an account or using AyurSutra, you acknowledge
              that you have read, understood, and agree to these Terms &
              Conditions. If you do not agree with these terms, please do
              not create an account or use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              2. About AyurSutra
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              AyurSutra is a digital platform designed to support the
              management of Ayurvedic wellness and Panchakarma care
              activities. The platform may provide features related to
              patient information, therapy plans, therapy sessions,
              diet plans, progress records, and related administrative
              activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              3. Patient Account
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              You are responsible for providing accurate information when
              creating your account. You are also responsible for keeping
              your login credentials secure and for activities performed
              through your account.
            </p>

            <p className="mt-3 leading-7 text-[#596458]">
              If you believe that your account has been accessed without
              authorization, you should notify the appropriate AyurSutra
              administrator as soon as possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              4. Therapy and Healthcare Information
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Information displayed through AyurSutra may include therapy
              schedules, diet recommendations, progress assessments, and
              other healthcare-related information provided by authorized
              practitioners.
            </p>

            <p className="mt-3 leading-7 text-[#596458]">
              AyurSutra is a management and information-support platform.
              Information available through the platform should not be
              treated as a substitute for professional medical or
              Ayurvedic consultation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              5. Therapy Sessions and Appointments
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Therapy session information displayed on the platform is
              based on records and schedules maintained by authorized
              users. Session times, therapists, rooms, and other details
              may be changed by authorized staff when required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              6. Acceptable Use
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              You agree not to misuse AyurSutra, attempt to gain
              unauthorized access, interfere with the operation of the
              platform, or use another person's account without
              authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              7. Accuracy of Information
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Users should provide accurate and up-to-date information.
              Authorized practitioners and staff are responsible for
              maintaining the accuracy of information entered into the
              system within their respective roles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              8. Platform Availability
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              AyurSutra may occasionally be unavailable because of
              maintenance, updates, technical issues, or circumstances
              outside the platform's control. Reasonable efforts may be
              taken to maintain reliable availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              9. Privacy
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              Your use of AyurSutra is also governed by our Privacy Policy,
              which explains how information may be collected, used,
              stored, and protected.
            </p>

            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="mt-4 text-sm font-semibold text-[#71834F] underline underline-offset-4 hover:text-[#4F673D]"
            >
              Read our Privacy Policy
            </button>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              10. Changes to These Terms
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              These Terms & Conditions may be updated when necessary.
              Updated terms will be made available through the AyurSutra
              platform. Continued use of the platform after an update
              indicates acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1F3D2E]">
              11. Contact
            </h2>

            <p className="mt-3 leading-7 text-[#596458]">
              If you have questions regarding these Terms & Conditions,
              please contact the AyurSutra administration or the
              organization operating the platform.
            </p>
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

export default TermsAndConditionsPage;