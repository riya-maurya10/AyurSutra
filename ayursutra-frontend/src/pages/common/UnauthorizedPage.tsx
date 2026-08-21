import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
          AyurSutra
        </p>

        <h1 className="mt-3 text-5xl font-semibold text-[#1F3D2E]">
          Access Denied
        </h1>

        <p className="mt-4 text-[#5A4A3A]">
          You do not have permission to access this area.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-[#1F3D2E] px-6 py-3 font-medium text-white transition hover:bg-[#6B7F4E]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;