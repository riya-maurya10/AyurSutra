import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPatientById,
  getMyDoctorProfile,
} from "../../services/doctor/doctorService";

import type {
  PatientResponse,
} from "../../services/doctor/doctorService";

import {
  getAllTherapies,
} from "../../services/therapy/therapyService";

import type {
  Therapy,
} from "../../services/therapy/therapyService";

import apiClient from "../../services/api/client";

// =====================================================
// TYPES
// =====================================================

interface TherapyPlanItem {
  day: number;
  therapyId: string;
  therapyName: string;
  durationMinutes: number;
  sequenceOrder: number;
}

interface TherapyPlanRequest {
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  status: string;
  therapies: TherapyPlanItem[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// COMPONENT
// =====================================================

function DoctorTherapyPlanPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ---------------------------------------------------
  // PATIENT
  // ---------------------------------------------------

  const [patient, setPatient] =
    useState<PatientResponse | null>(null);

  const [doctorId, setDoctorId] =
    useState("");

  const [patientLoading, setPatientLoading] =
    useState(true);

  // ---------------------------------------------------
  // THERAPIES
  // ---------------------------------------------------

  const [therapies, setTherapies] =
    useState<Therapy[]>([]);

  const [therapyLoading, setTherapyLoading] =
    useState(true);

  // ---------------------------------------------------
  // FORM
  // ---------------------------------------------------

  const [planName, setPlanName] =
    useState("");

  const [diagnosis, setDiagnosis] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  // ---------------------------------------------------
  // DAY-WISE THERAPIES
  // ---------------------------------------------------

  const [selectedDay, setSelectedDay] =
    useState(1);

  const [selectedTherapyId, setSelectedTherapyId] =
    useState("");

  const [schedule, setSchedule] =
    useState<TherapyPlanItem[]>([]);

  // ---------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // LOAD PATIENT
  // ===================================================

  useEffect(() => {
    if (!id) return;

    const loadPatient = async () => {
      try {
        setPatientLoading(true);

        const [patientData, doctorData] =
          await Promise.all([
            getPatientById(id),
            getMyDoctorProfile(),
          ]);

        setPatient(patientData);
        setDoctorId(doctorData.id);
      } catch (err) {
        console.error(
          "Failed to load patient:",
          err
        );

        setError(
          "Unable to load patient information."
        );
      } finally {
        setPatientLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  // ===================================================
  // LOAD THERAPIES
  // ===================================================

  useEffect(() => {
    const loadTherapies = async () => {
      try {
        setTherapyLoading(true);

        const data =
          await getAllTherapies();

        setTherapies(
          data.filter(
            (therapy) => therapy.active
          )
        );
      } catch (err) {
        console.error(
          "Failed to load therapies:",
          err
        );

        setError(
          "Unable to load available therapies."
        );
      } finally {
        setTherapyLoading(false);
      }
    };

    loadTherapies();
  }, []);

  // ===================================================
  // CALCULATE NUMBER OF DAYS
  // ===================================================

  const numberOfDays = useMemo(() => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start =
      new Date(`${startDate}T00:00:00`);

    const end =
      new Date(`${endDate}T00:00:00`);

    if (end < start) {
      return 0;
    }

    const difference =
      end.getTime() - start.getTime();

    return (
      Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
      ) + 1
    );
  }, [startDate, endDate]);

  // ===================================================
  // ADD THERAPY
  // ===================================================

  const addTherapy = () => {
    if (!selectedTherapyId) {
      return;
    }

    const therapy =
      therapies.find(
        (item) =>
          item.id === selectedTherapyId
      );

    if (!therapy) {
      return;
    }

    const existingForDay =
      schedule.filter(
        (item) =>
          item.day === selectedDay
      );

    const newItem: TherapyPlanItem = {
      day: selectedDay,
      therapyId: therapy.id,
      therapyName: therapy.name,
      durationMinutes:
        therapy.durationMinutes,
      sequenceOrder:
        existingForDay.length + 1,
    };

    setSchedule((previous) => [
      ...previous,
      newItem,
    ]);

    setSelectedTherapyId("");
  };

  // ===================================================
  // REMOVE THERAPY
  // ===================================================

  const removeTherapy = (
    indexToRemove: number
  ) => {
    setSchedule((previous) => {
      const updated =
        previous.filter(
          (_, index) =>
            index !== indexToRemove
        );

      // Recalculate sequence order
      return updated.map(
        (item) => {
          const dayItems =
            updated.filter(
              (dayItem) =>
                dayItem.day === item.day
            );

          return {
            ...item,
            sequenceOrder:
              dayItems.findIndex(
                (dayItem) =>
                  dayItem === item
              ) + 1,
          };
        }
      );
    });
  };

  // ===================================================
  // SUBMIT PLAN
  // ===================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError(
        "Patient ID is missing."
      );
      return;
    }

    if (!planName.trim()) {
      setError(
        "Please enter a plan name."
      );
      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please select start and end dates."
      );
      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (schedule.length === 0) {
      setError(
        "Please add at least one therapy."
      );
      return;
    }

   

    if (!doctorId) {
      setError(
        "Doctor information is missing. Please login again."
      );
      return;
    }

    const request: TherapyPlanRequest = {
      patientId: id,
      doctorId,
      planName: planName.trim(),
      diagnosis: diagnosis.trim(),
      startDate,
      endDate,
      status: "PLANNED",
      therapies: schedule,
    };

    try {
      setSaving(true);

      const response =
        await apiClient.post<
          ApiResponse<unknown>
        >(
          "/therapy-plans",
          request
        );

      if (response.data.success) {
        setSuccess(
          "Therapy plan created successfully."
        );

        setTimeout(() => {
          navigate(
            `/doctor/patients/${id}`
          );
        }, 1000);
      }
    } catch (err: any) {
      console.error(
        "Failed to create therapy plan:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Unable to create therapy plan."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (patientLoading) {
    return (
      <div className="min-h-full bg-[#F1F0E8] p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8D2C3] border-t-[#1F3D2E]" />

            <p className="mt-4 text-sm text-[#665849]">
              Loading patient information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="min-h-full bg-[#F1F0E8] p-8">

      {/* =================================================
          BACK
          ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate(
            `/doctor/patients/${id}`
          )
        }
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#315A46] transition hover:text-[#1F3D2E]"
      >
        <span>←</span>
        Back to Patient Record
      </button>

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7F4E]">
          Clinical Management
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[#173F32]">
          Create Therapy Plan
        </h1>

        <p className="mt-2 text-[#665849]">
          Create a personalized Panchakarma
          therapy schedule for your patient.
        </p>
      </div>

      {/* =================================================
          PATIENT SUMMARY
          ================================================= */}

      {patient && (
        <div className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DDE7D6] font-bold text-[#315A46]">
              {patient.fullName
                ?.split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(
                  (part) =>
                    part.charAt(0)
                )
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7F4E]">
                Patient
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#173F32]">
                {patient.fullName}
              </h2>

              <p className="mt-1 text-sm text-[#665849]">
                {patient.age ?? "—"} years
                <span className="mx-2 text-[#B5AEA1]">
                  •
                </span>
                {patient.gender || "—"}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =================================================
          FORM
          ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >

        {/* =================================================
            PLAN DETAILS
            ================================================= */}

        <section className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

          <div className="border-b border-[#DDD7C9] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#173F32]">
              Plan Details
            </h2>

            <p className="mt-1 text-sm text-[#766F63]">
              Define the overall treatment plan.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">

            {/* PLAN NAME */}

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[#4E463D]">
                Plan Name
              </label>

              <input
                type="text"
                value={planName}
                onChange={(event) =>
                  setPlanName(
                    event.target.value
                  )
                }
                placeholder="e.g. Panchakarma Wellness Plan"
                className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-[#FAF9F5] px-4 py-3 text-sm text-[#173F32] outline-none transition placeholder:text-[#9A9185] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
              />
            </div>

            {/* DIAGNOSIS */}

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[#4E463D]">
                Diagnosis / Clinical Notes
              </label>

              <textarea
                value={diagnosis}
                onChange={(event) =>
                  setDiagnosis(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Enter diagnosis or relevant clinical notes..."
                className="mt-2 w-full resize-none rounded-xl border border-[#CFC8B9] bg-[#FAF9F5] px-4 py-3 text-sm text-[#173F32] outline-none transition placeholder:text-[#9A9185] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
              />
            </div>

            {/* START DATE */}

            <div>
              <label className="text-sm font-semibold text-[#4E463D]">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-[#FAF9F5] px-4 py-3 text-sm text-[#173F32] outline-none focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
              />
            </div>

            {/* END DATE */}

            <div>
              <label className="text-sm font-semibold text-[#4E463D]">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-[#FAF9F5] px-4 py-3 text-sm text-[#173F32] outline-none focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
              />
            </div>

          </div>

        </section>

        {/* =================================================
            THERAPY SCHEDULE
            ================================================= */}

        <section className="mt-6 rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

          <div className="border-b border-[#DDD7C9] px-6 py-5">

            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7F4E]">
                  Treatment Schedule
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#173F32]">
                  Therapy Schedule
                </h2>

                <p className="mt-1 text-sm text-[#766F63]">
                  Add therapies to each treatment day.
                </p>
              </div>

              {numberOfDays > 0 && (
                <div className="rounded-xl bg-[#EAF0E3] px-4 py-2 text-sm font-medium text-[#315A46]">
                  {numberOfDays} treatment{" "}
                  {numberOfDays === 1
                    ? "day"
                    : "days"}
                </div>
              )}

            </div>

          </div>

          <div className="p-6">

            {/* NO DATES */}

            {numberOfDays === 0 && (
              <div className="rounded-xl border border-dashed border-[#D1CBBD] bg-[#F8F6F0] px-6 py-10 text-center">

                <p className="font-medium text-[#665849]">
                  Select start and end dates
                </p>

                <p className="mt-1 text-sm text-[#91897C]">
                  Treatment days will become available
                  after selecting the plan dates.
                </p>

              </div>
            )}

            {/* DAY SELECTOR */}

            {numberOfDays > 0 && (
              <>

                <div className="flex flex-wrap gap-2">

                  {Array.from(
                    { length: numberOfDays },
                    (_, index) => {
                      const day =
                        index + 1;

                      const active =
                        selectedDay === day;

                      const dayCount =
                        schedule.filter(
                          (item) =>
                            item.day === day
                        ).length;

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() =>
                            setSelectedDay(
                              day
                            )
                          }
                          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active
                              ? "bg-[#1F3D2E] text-white"
                              : "border border-[#D5D0C4] bg-[#FAF9F5] text-[#4E463D] hover:border-[#9EAA8F] hover:bg-[#EEF2E8]"
                            }`}
                        >
                          Day {day}

                          {dayCount > 0 && (
                            <span className="ml-2 opacity-70">
                              {dayCount}
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}

                </div>

                {/* ADD THERAPY */}

                <div className="mt-6 rounded-2xl border border-[#D5DCCB] bg-[#F1F4EC] p-5">

                  <div className="flex flex-col gap-4 md:flex-row md:items-end">

                    <div className="flex-1">
                      <label className="text-sm font-semibold text-[#315A46]">
                        Add Therapy to Day{" "}
                        {selectedDay}
                      </label>

                      <select
                        value={
                          selectedTherapyId
                        }
                        disabled={
                          therapyLoading
                        }
                        onChange={(event) =>
                          setSelectedTherapyId(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-[#C6CFBB] bg-white px-4 py-3 text-sm text-[#173F32] outline-none focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
                      >
                        <option value="">
                          {therapyLoading
                            ? "Loading therapies..."
                            : therapies.length ===
                              0
                              ? "No therapies available"
                              : "Select a therapy"}
                        </option>

                        {therapies.map(
                          (therapy) => (
                            <option
                              key={
                                therapy.id
                              }
                              value={
                                therapy.id
                              }
                            >
                              {therapy.name} —{" "}
                              {
                                therapy.durationMinutes
                              }{" "}
                              min
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={
                        addTherapy
                      }
                      disabled={
                        !selectedTherapyId ||
                        therapyLoading
                      }
                      className="rounded-xl bg-[#1F3D2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#315A46] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Add Therapy
                    </button>

                  </div>

                </div>

                {/* CURRENT DAY */}

                <div className="mt-6">

                  <div className="mb-4 flex items-center justify-between">

                    <div>
                      <h3 className="text-lg font-semibold text-[#173F32]">
                        Day {selectedDay}
                      </h3>

                      <p className="text-sm text-[#766F63]">
                        Therapies scheduled for this day.
                      </p>
                    </div>

                    <span className="text-sm font-medium text-[#6B7F4E]">
                      {
                        schedule.filter(
                          (item) =>
                            item.day ===
                            selectedDay
                        ).length
                      }{" "}
                      scheduled
                    </span>

                  </div>

                  <div className="space-y-3">

                    {schedule
                      .map(
                        (
                          item,
                          originalIndex
                        ) => ({
                          item,
                          originalIndex,
                        })
                      )
                      .filter(
                        ({ item }) =>
                          item.day ===
                          selectedDay
                      )
                      .map(
                        ({
                          item,
                          originalIndex,
                        }) => (
                          <div
                            key={`${item.day}-${item.therapyId}-${originalIndex}`}
                            className="flex items-center justify-between rounded-xl border border-[#DDD7C9] bg-[#FAF9F5] p-4"
                          >

                            <div className="flex items-center gap-4">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE7D6] text-sm font-bold text-[#315A46]">
                                {
                                  item.sequenceOrder
                                }
                              </div>

                              <div>
                                <p className="font-semibold text-[#173F32]">
                                  {
                                    item.therapyName
                                  }
                                </p>

                                <p className="mt-1 text-sm text-[#766F63]">
                                  {
                                    item.durationMinutes
                                  }{" "}
                                  minutes
                                </p>
                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeTherapy(
                                  originalIndex
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#9A594E] transition hover:bg-[#F5E8E4]"
                            >
                              Remove
                            </button>

                          </div>
                        )
                      )}

                    {schedule.filter(
                      (item) =>
                        item.day ===
                        selectedDay
                    ).length === 0 && (
                        <div className="rounded-xl border border-dashed border-[#D1CBBD] bg-[#F8F6F0] px-5 py-8 text-center">

                          <p className="font-medium text-[#665849]">
                            No therapies added
                          </p>

                          <p className="mt-1 text-sm text-[#91897C]">
                            Select a therapy above to
                            add it to this day.
                          </p>

                        </div>
                      )}

                  </div>

                </div>

              </>
            )}

          </div>

        </section>

        {/* =================================================
            MESSAGES
            ================================================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-[#E4C5BE] bg-[#FBEFEC] px-5 py-4 text-sm font-medium text-[#8B453B]">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-[#C7D7BD] bg-[#EAF2E5] px-5 py-4 text-sm font-medium text-[#315A46]">
            {success}
          </div>
        )}

        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/doctor/patients/${id}`
              )
            }
            className="rounded-xl border border-[#C6C1B5] bg-[#FAF9F5] px-5 py-3 text-sm font-semibold text-[#4E463D] transition hover:bg-[#F1EEE6]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              therapyLoading
            }
            className="rounded-xl bg-[#1F3D2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#315A46] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Creating Plan..."
              : "Create Therapy Plan →"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default DoctorTherapyPlanPage;