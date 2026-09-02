import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllPatients,
} from "../../services/doctor/doctorService";

import type {
  PatientResponse,
} from "../../services/doctor/doctorService";

function MyPatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllPatients();

      setPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setError("Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        patient.fullName,
        patient.email,
        patient.phone,
        patient.gender,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(value)
        )
    );
  }, [patients, search]);

  const getInitials = (name?: string) => {
    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="min-h-full bg-[#F1F0E8] p-8">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6B7F4E]">
          Clinical Care
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[#173F32]">
          My Patients
        </h1>

        <p className="mt-2 text-[15px] text-[#665849]">
          View and manage the patients currently under your care.
        </p>
      </div>

      {/* =====================================================
          SEARCH / SUMMARY
          ===================================================== */}

      <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A746A]">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#D8D2C3] bg-[#F8F6F0] py-3 pl-11 pr-4 text-sm text-[#173F32] outline-none transition placeholder:text-[#91897C] focus:border-[#6B7F4E] focus:bg-white focus:ring-2 focus:ring-[#6B7F4E]/15"
          />
        </div>

        {/* Count */}
        <div className="text-sm text-[#665849]">
          <span className="font-semibold text-[#173F32]">
            {filteredPatients.length}
          </span>{" "}
          {filteredPatients.length === 1 ? "patient" : "patients"} under your care
        </div>
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

        {/* Card heading */}
        <div className="border-b border-[#DDD7C9] bg-[#F8F6F0] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#173F32]">
            Patient Records
          </h2>

          <p className="mt-1 text-sm text-[#665849]">
            Select a patient to view their clinical record and treatment plan.
          </p>
        </div>

        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D8D2C3] border-t-[#1F3D2E]" />

            <p className="mt-4 text-sm text-[#665849]">
              Loading patient records...
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
            ================================================= */}

        {!loading && error && (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-[#8B3A32]">
              {error}
            </p>

            <button
              onClick={loadPatients}
              className="mt-5 rounded-xl bg-[#1F3D2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#315A46]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            EMPTY
            ================================================= */}

        {!loading &&
          !error &&
          filteredPatients.length === 0 && (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5EBDD] text-2xl text-[#4F6B3C]">
                ♧
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[#173F32]">
                {search
                  ? "No matching patients"
                  : "No patients found"}
              </h3>

              <p className="mt-2 text-sm text-[#665849]">
                {search
                  ? "Try searching with a different name, email or phone number."
                  : "Patient records will appear here once they are registered."}
              </p>

            </div>
          )}

        {/* =================================================
            PATIENT LIST
            ================================================= */}

        {!loading &&
          !error &&
          filteredPatients.length > 0 && (
            <div>

              {/* Column heading */}
              <div className="hidden grid-cols-[minmax(280px,2fr)_1fr_1fr_150px] border-b border-[#DDD7C9] bg-[#F8F6F0] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#766F63] md:grid">

                <div>Patient</div>
                <div>Age / Gender</div>
                <div>Contact</div>
                <div className="text-right">Action</div>

              </div>

              {/* Rows */}
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="group border-b border-[#E5E0D5] px-5 py-5 transition last:border-b-0 hover:bg-[#F4F5EC] md:px-6"
                >

                  <div className="grid gap-5 md:grid-cols-[minmax(280px,2fr)_1fr_1fr_150px] md:items-center">

                    {/* -------------------------------------
                        PATIENT
                        ------------------------------------- */}

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DDE7D6] text-sm font-bold text-[#315A46]">
                        {getInitials(patient.fullName)}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-[#173F32]">
                          {patient.fullName || "Unnamed Patient"}
                        </p>

                        <p className="mt-1 truncate text-sm text-[#766F63]">
                          {patient.email || "No email available"}
                        </p>

                      </div>

                    </div>

                    {/* -------------------------------------
                        AGE / GENDER
                        ------------------------------------- */}

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-[#91897C] md:hidden">
                        Demographics
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#4E463D] md:mt-0">
                        {patient.age ?? "—"} years
                        <span className="mx-2 text-[#B5AEA1]">
                          •
                        </span>
                        {patient.gender || "—"}
                      </p>

                    </div>

                    {/* -------------------------------------
                        CONTACT
                        ------------------------------------- */}

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-[#91897C] md:hidden">
                        Contact
                      </p>

                      <p className="mt-1 text-sm text-[#4E463D] md:mt-0">
                        {patient.phone || "No phone available"}
                      </p>

                    </div>

                    {/* -------------------------------------
                        ACTION
                        ------------------------------------- */}

                    <div className="flex md:justify-end">

                      <button
                        onClick={() =>
                          navigate(
                            `/doctor/patients/${patient.id}`
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#315A46] md:w-auto"
                      >
                        View Patient
                        <span className="text-base">
                          →
                        </span>
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>
    </div>
  );
}

export default MyPatientsPage;