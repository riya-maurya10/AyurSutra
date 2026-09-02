import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPatientById,
} from "../../services/doctor/doctorService";

import type {
  PatientResponse,
} from "../../services/doctor/doctorService";

function PatientClinicalRecordPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] =
    useState<PatientResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (id) {
      loadPatient(id);
    }
  }, [id]);

  const loadPatient = async (patientId: string) => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getPatientById(patientId);

      setPatient(data);
    } catch (err) {
      console.error(
        "Failed to load patient:",
        err
      );

      setError(
        "Unable to load this patient's record."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F1F0E8] p-8">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8D2C3] border-t-[#1F3D2E]" />

            <p className="mt-4 text-sm text-[#665849]">
              Loading clinical record...
            </p>

          </div>

        </div>

      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-full bg-[#F1F0E8] p-8">

        <button
          onClick={() =>
            navigate("/doctor/patients")
          }
          className="mb-6 text-sm font-semibold text-[#315A46] hover:text-[#1F3D2E]"
        >
          ← Back to My Patients
        </button>

        <div className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-12 text-center shadow-sm">

          <h2 className="text-xl font-semibold text-[#173F32]">
            Patient record unavailable
          </h2>

          <p className="mt-2 text-sm text-[#665849]">
            {error || "Patient not found."}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F1F0E8] p-8">

      {/* =====================================================
          BACK
          ===================================================== */}

      <button
        onClick={() =>
          navigate("/doctor/patients")
        }
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#315A46] transition hover:text-[#1F3D2E]"
      >
        <span>←</span>
        Back to My Patients
      </button>

      {/* =====================================================
          PATIENT HEADER
          ===================================================== */}

      <div className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-6 shadow-sm">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-5">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#DDE7D6] text-lg font-bold text-[#315A46]">
              {getInitials(patient.fullName)}
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7F4E]">
                Patient Clinical Record
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-[#173F32]">
                {patient.fullName}
              </h1>

              <p className="mt-1 text-sm text-[#665849]">
                {patient.age ?? "—"} years
                <span className="mx-2 text-[#B5AEA1]">
                  •
                </span>
                {patient.gender || "—"}
              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate(
                  `/doctor/patients/${patient.id}/therapy-plan`
                )
              }
              className="rounded-xl bg-[#1F3D2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#315A46]"
            >
              + Therapy Plan
            </button>

            <button
              onClick={() =>
                navigate(
                  `/doctor/patients/${patient.id}/diet-plan`
                )
              }
              className="rounded-xl border border-[#B8BBA8] bg-[#EEF2E8] px-5 py-2.5 text-sm font-semibold text-[#315A46] transition hover:bg-[#E3EBD9]"
            >
              + Diet Plan
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          PATIENT INFORMATION
          ===================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* -----------------------------------------------
            PERSONAL INFORMATION
            ----------------------------------------------- */}

        <section className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

          <div className="border-b border-[#DDD7C9] px-6 py-5">

            <h2 className="font-semibold text-[#173F32]">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-[#766F63]">
              Basic patient details
            </p>

          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6 p-6">

            <InfoItem
              label="Full Name"
              value={patient.fullName}
            />

            <InfoItem
              label="Age"
              value={
                patient.age
                  ? `${patient.age} years`
                  : "—"
              }
            />

            <InfoItem
              label="Gender"
              value={patient.gender}
            />

            <InfoItem
              label="Phone"
              value={patient.phone}
            />

            <InfoItem
              label="Email"
              value={patient.email}
            />

            <InfoItem
              label="Patient ID"
              value={patient.id}
            />

            <div className="col-span-2">
              <InfoItem
                label="Address"
                value={patient.address}
              />
            </div>

          </div>

        </section>

        {/* -----------------------------------------------
            MEDICAL HISTORY
            ----------------------------------------------- */}

        <section className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

          <div className="border-b border-[#DDD7C9] px-6 py-5">

            <h2 className="font-semibold text-[#173F32]">
              Medical History
            </h2>

            <p className="mt-1 text-sm text-[#766F63]">
              Relevant clinical information
            </p>

          </div>

          <div className="p-6">

            <div className="min-h-[180px] rounded-xl border border-[#DED9CC] bg-[#F8F6F0] p-5">

              {patient.medicalHistory ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#4E463D]">
                  {patient.medicalHistory}
                </p>
              ) : (
                <div className="flex h-[140px] items-center justify-center text-center">

                  <div>
                    <p className="font-medium text-[#665849]">
                      No medical history recorded
                    </p>

                    <p className="mt-1 text-sm text-[#91897C]">
                      Clinical notes can be added to the patient record.
                    </p>
                  </div>

                </div>
              )}

            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          CARE MANAGEMENT
          ===================================================== */}

      <section className="mt-6 rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

        <div className="border-b border-[#DDD7C9] px-6 py-5">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7F4E]">
            Clinical Management
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#173F32]">
            Patient Care
          </h2>

          <p className="mt-1 text-sm text-[#766F63]">
            Manage treatment, diet and therapy sessions for this patient.
          </p>

        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">

          {/* THERAPY */}

          <button
            onClick={() =>
              navigate(
                `/doctor/patients/${patient.id}/therapy-plan`
              )
            }
            className="group rounded-2xl border border-[#D5DCCB] bg-[#F1F4EC] p-6 text-left transition hover:-translate-y-0.5 hover:border-[#AAB99C] hover:bg-[#E9EFE2]"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCE7D4] text-xl text-[#315A46]">
                ♧
              </div>

              <span className="text-xl text-[#7A8A6A] transition group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#173F32]">
              Therapy Plans
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#665849]">
              Create and manage Panchakarma therapies and treatment schedules.
            </p>

            <div className="mt-5 text-sm font-semibold text-[#315A46]">
              Manage therapy →
            </div>

          </button>

          {/* DIET */}

          <button
            onClick={() =>
              navigate(
                `/doctor/patients/${patient.id}/diet-plan`
              )
            }
            className="group rounded-2xl border border-[#DED7C2] bg-[#F5F1E6] p-6 text-left transition hover:-translate-y-0.5 hover:border-[#C9B98F] hover:bg-[#F0EBDD]"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAE2CD] text-xl text-[#806A3B]">
                ◌
              </div>

              <span className="text-xl text-[#998B6C] transition group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#173F32]">
              Diet Plans
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#665849]">
              Prescribe daily meals, dietary instructions and food restrictions.
            </p>

            <div className="mt-5 text-sm font-semibold text-[#806A3B]">
              Manage diet →
            </div>

          </button>

        </div>

      </section>

      {/* =====================================================
          FUTURE SECTIONS
          ===================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        <PlaceholderCard
          title="Therapy Sessions"
          description="Scheduled and completed therapy sessions for this patient will appear here."
        />

        <PlaceholderCard
          title="Treatment Progress"
          description="Patient progress, observations and clinical updates will appear here."
        />

      </div>

    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#91897C]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-[#4E463D]">
        {value || "—"}
      </p>
    </div>
  );
}

function PlaceholderCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-6 shadow-sm">

      <h2 className="text-lg font-semibold text-[#173F32]">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#766F63]">
        {description}
      </p>

      <div className="mt-5 rounded-xl border border-dashed border-[#D1CBBD] bg-[#F8F6F0] px-5 py-8 text-center">
        <p className="text-sm text-[#91897C]">
          No records available yet.
        </p>
      </div>

    </section>
  );
}

export default PatientClinicalRecordPage;