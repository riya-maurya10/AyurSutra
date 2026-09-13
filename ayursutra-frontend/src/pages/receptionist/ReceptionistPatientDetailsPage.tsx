import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  UserRound,
  CalendarDays,
  HeartPulse,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPatientById,
  type PatientResponse,
} from "../../services/doctor/doctorService";

function ReceptionistPatientDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadPatient = async () => {
      if (!id) {
        setError("Patient ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getPatientById(id);

        if (!mounted) return;

        setPatient(data);
      } catch (err: any) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load patient details."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPatient();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-[#6B7F4E]">
          <Loader2
            size={22}
            className="animate-spin"
          />
          <span className="text-sm font-medium">
            Loading patient details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">

        <button
          type="button"
          onClick={() => navigate("/receptionist/patients")}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DCC8A3] bg-white px-4 py-2.5 text-sm font-medium text-[#1F3D2E] transition hover:border-[#6B7F4E] hover:bg-[#F1F3E9]"
        >
          <ArrowLeft size={17} />
          Back to Patients
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error || "Patient details could not be found."}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
            Front Desk
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F3D2E]">
            Patient Details
          </h1>

          <p className="mt-1 text-sm text-[#7A806F]">
            View registered patient information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/receptionist/patients")}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#DCC8A3] bg-white px-4 py-2.5 text-sm font-medium text-[#1F3D2E] transition hover:border-[#6B7F4E] hover:bg-[#F1F3E9]"
        >
          <ArrowLeft size={17} />
          Back to Patients
        </button>

      </div>

      {/* =====================================================
          PATIENT PROFILE HEADER
      ===================================================== */}

      <div className="overflow-hidden rounded-3xl border border-[#E6DDCC] bg-white shadow-sm">

        <div className="border-b border-[#EEE7D9] bg-[#FCFBF7] px-6 py-6 md:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F1F3E9]">
              <UserRound
                size={30}
                className="text-[#6B7F4E]"
              />
            </div>

            <div className="min-w-0">

              <h2 className="text-2xl font-semibold text-[#1F3D2E]">
                {patient.fullName}
              </h2>

              <p className="mt-1 text-sm text-[#7A806F]">
                Patient ID: {patient.id}
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <div className="p-6 md:p-8">

          <div className="grid gap-5 md:grid-cols-2">

            {/* Age */}

            <div className="rounded-2xl border border-[#EEE7D9] bg-[#FCFBF7] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F3E9]">
                  <CalendarDays
                    size={18}
                    className="text-[#6B7F4E]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8F7F]">
                    Age
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {patient.age ?? "Not provided"}
                  </p>
                </div>

              </div>

            </div>

            {/* Gender */}

            <div className="rounded-2xl border border-[#EEE7D9] bg-[#FCFBF7] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F1E5]">
                  <UserRound
                    size={18}
                    className="text-[#8A684D]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8F7F]">
                    Gender
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {patient.gender || "Not provided"}
                  </p>
                </div>

              </div>

            </div>

            {/* Phone */}

            <div className="rounded-2xl border border-[#EEE7D9] bg-[#FCFBF7] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F3E9]">
                  <Phone
                    size={18}
                    className="text-[#6B7F4E]"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8F7F]">
                    Phone
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-[#1F3D2E]">
                    {patient.phone || "Not provided"}
                  </p>

                </div>

              </div>

            </div>

            {/* Email */}

            <div className="rounded-2xl border border-[#EEE7D9] bg-[#FCFBF7] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F1E5]">
                  <Mail
                    size={18}
                    className="text-[#8A684D]"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8F7F]">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-[#1F3D2E]">
                    {patient.email || "Not provided"}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="mt-5 rounded-2xl border border-[#EEE7D9] bg-[#FCFBF7] p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F3E9]">
                <MapPin
                  size={18}
                  className="text-[#6B7F4E]"
                />
              </div>

              <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8F7F]">
                  Address
                </p>

                <p className="mt-1 text-sm leading-6 text-[#42564D]">
                  {patient.address || "Address not provided"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              MEDICAL HISTORY
          ================================================= */}

          <div className="mt-5 rounded-2xl border border-[#EEE7D9] bg-[#FCFBF7] p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F1E5]">
                <HeartPulse
                  size={18}
                  className="text-[#8A684D]"
                />
              </div>

              <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8F7F]">
                  Medical History
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#42564D]">
                  {patient.medicalHistory ||
                    "No medical history provided."}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ReceptionistPatientDetailsPage;