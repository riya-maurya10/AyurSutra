import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  UserRound,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import {
  getMyPatients,
  type PatientResponse,
} from "../../services/therapist/therapistService";

function AssignedPatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientResponse[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyPatients();

      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      console.error("Failed to fetch assigned patients:", err);
      setError(
        "Unable to load your assigned patients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(query)
      );
    });

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleViewPatient = (patientId: string) => {
    navigate(`/therapist/patients/${patientId}`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#8A6A3B]">
              Patient Care
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F3D2E] md:text-3xl">
              Assigned Patients
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-[#7A806F]">
              View and manage the patients currently assigned to your
              therapy sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPatients}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D9DDCF] bg-white px-4 py-2.5 text-sm font-medium text-[#1F3D2E] shadow-sm transition hover:border-[#BFC8B8] hover:bg-[#FAFBF7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            {/* Refresh */}
          </button>
        </div>

        {/* =====================================================
            SUMMARY CARD
            ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A806F]">
                  Assigned Patients
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
                  {loading ? "—" : patients.length}
                </p>

                <p className="mt-1 text-xs text-[#8A8F82]">
                  Patients currently in your care
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#3F684F]">
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A806F]">
                  Showing
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
                  {loading ? "—" : filteredPatients.length}
                </p>

                <p className="mt-1 text-xs text-[#8A8F82]">
                  Matching patients
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8A6A3B]">
                <UserRound size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SEARCH
            ===================================================== */}

        <div className="rounded-2xl border border-[#E1E4DA] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9F92]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search patients by name, email or phone..."
              className="w-full rounded-xl border border-[#D9DDCF] bg-[#FAFBF7] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#9A9F92] focus:border-[#8FA68E] focus:bg-white focus:ring-2 focus:ring-[#DDE7D9]"
            />
          </div>
        </div>

        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-[#E6C9C9] bg-[#FFF8F8] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#8A3F3F]">
                Unable to load patients
              </p>

              <p className="mt-1 text-sm text-[#9A6868]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPatients}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#8A3F3F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#743636]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#E8EBE3]" />

                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-[#E8EBE3]" />
                    <div className="mt-2 h-3 w-24 rounded bg-[#EEF0EA]" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-3 w-full rounded bg-[#EEF0EA]" />
                  <div className="h-3 w-4/5 rounded bg-[#EEF0EA]" />
                  <div className="h-3 w-3/5 rounded bg-[#EEF0EA]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            PATIENT LIST
            ===================================================== */}

        {!loading && !error && filteredPatients.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1F3D2E]">
                  Your Patients
                </h3>

                <p className="mt-1 text-sm text-[#7A806F]">
                  Patients linked to your therapy sessions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="group rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8D1C2] hover:shadow-md"
                >
                  {/* Patient identity */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF3EA] text-[#3F684F]">
                        <UserRound size={22} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#1F3D2E]">
                          {patient.fullName}
                        </h4>

                        <p className="mt-1 text-xs text-[#8A8F82]">
                          Patient ID: {patient.id.slice(-8)}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#EEF3EA] px-2.5 py-1 text-xs font-medium text-[#3F684F]">
                      Assigned
                    </span>
                  </div>

                  {/* Basic information */}

                  <div className="mt-6 space-y-3 border-t border-[#EEF0EA] pt-5">
                    {patient.age !== null && (
                      <div className="flex items-center gap-3 text-sm">
                        <UserRound
                          size={16}
                          className="shrink-0 text-[#8A6A3B]"
                        />

                        <span className="text-[#5F665B]">
                          {patient.age} years
                          {patient.gender
                            ? ` • ${patient.gender}`
                            : ""}
                        </span>
                      </div>
                    )}

                    {patient.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone
                          size={16}
                          className="shrink-0 text-[#8A6A3B]"
                        />

                        <span className="truncate text-[#5F665B]">
                          {patient.phone}
                        </span>
                      </div>
                    )}

                    {patient.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail
                          size={16}
                          className="shrink-0 text-[#8A6A3B]"
                        />

                        <span className="truncate text-[#5F665B]">
                          {patient.email}
                        </span>
                      </div>
                    )}

                    {patient.address && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#8A6A3B]"
                        />

                        <span className="text-[#5F665B]">
                          {patient.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Medical history */}

                  <div className="mt-5 rounded-xl bg-[#FAFBF7] p-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                        className="text-[#3F684F]"
                      />

                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6D7569]">
                        Medical History
                      </p>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5F665B]">
                      {patient.medicalHistory ||
                        "No medical history recorded."}
                    </p>
                  </div>

                  {/* Action */}

                  <button
                    type="button"
                    onClick={() => handleViewPatient(patient.id)}
                    className="mt-5 flex w-full items-center justify-between rounded-xl border border-[#D9DDCF] bg-white px-4 py-3 text-sm font-medium text-[#1F3D2E] transition hover:border-[#AEBDA7] hover:bg-[#F7F9F4]"
                  >
                    <span>View patient</span>

                    <ChevronRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================
            NO SEARCH RESULTS
            ===================================================== */}

        {!loading &&
          !error &&
          patients.length > 0 &&
          filteredPatients.length === 0 && (
            <div className="rounded-2xl border border-[#E1E4DA] bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3EA] text-[#3F684F]">
                <Search size={24} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#1F3D2E]">
                No patients found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#7A806F]">
                No assigned patients match your current search.
                Try a different name, email or phone number.
              </p>
            </div>
          )}

        {/* =====================================================
            EMPTY STATE
            ===================================================== */}

        {!loading && !error && patients.length === 0 && (
          <div className="rounded-2xl border border-[#E1E4DA] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3EA] text-[#3F684F]">
              <Users size={24} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#1F3D2E]">
              No assigned patients
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#7A806F]">
              You currently have no patients assigned through therapy
              sessions.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default AssignedPatientsPage;