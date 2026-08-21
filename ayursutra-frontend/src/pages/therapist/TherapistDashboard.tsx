import { useAuth } from "../../context/AuthContext";

function TherapistDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <header className="flex items-center justify-between border-b border-[#DCC8A3] bg-white px-8 py-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
            AyurSutra
          </p>

          <h1 className="text-2xl font-semibold text-[#1F3D2E]">
            Therapist Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-[#1F3D2E]">
              {user?.fullName}
            </p>

            <p className="text-sm text-[#6B7F4E]">
              {user?.role}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-[#1F3D2E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[#6B7F4E]">
          Therapy Care
        </p>

        <h2 className="mt-2 text-4xl font-semibold text-[#1F3D2E]">
          Welcome, {user?.fullName}
        </h2>

        <p className="mt-2 text-[#5A4A3A]">
          Manage assigned therapy sessions and patient care.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#6B7F4E]">Assigned Patients</p>
            <p className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
              —
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#6B7F4E]">Today's Sessions</p>
            <p className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
              —
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#6B7F4E]">Completed Sessions</p>
            <p className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
              —
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TherapistDashboard;