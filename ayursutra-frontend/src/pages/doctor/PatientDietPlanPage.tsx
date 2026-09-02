import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getPatientById,
  getDietPlansByPatient,
  createDietPlan,
  getMyDoctorProfile,
} from "../../services/doctor/doctorService";

import type {
  PatientResponse,
  DoctorResponse,
  DietPlan,
  DietPlanDayRequest,
  DietMealRequest,
} from "../../services/doctor/doctorService";

function PatientDietPlanPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);

  const [existingPlans, setExistingPlans] = useState<DietPlan[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [planName, setPlanName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [days, setDays] = useState<DietPlanDayRequest[]>([]);

  // =====================================================
  // LOAD PATIENT + DOCTOR + EXISTING DIET PLANS
  // =====================================================

  useEffect(() => {
    if (!id) return;

    loadData(id);
  }, [id]);

  const loadData = async (patientId: string) => {
    try {
      setLoading(true);
      setError("");

      const [patientData, dietPlans, doctorData] =
        await Promise.all([
          getPatientById(patientId),
          getDietPlansByPatient(patientId),
          getMyDoctorProfile(),
        ]);

      setPatient(patientData);
      setExistingPlans(dietPlans);
      setDoctor(doctorData);
    } catch (err) {
      console.error(
        "Failed to load diet plan data:",
        err
      );

      setError(
        "Unable to load this patient's diet information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GENERATE DAYS FROM DATE RANGE
  // =====================================================

  useEffect(() => {
    if (!startDate || !endDate) {
      setDays([]);
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (end < start) {
      setDays([]);
      return;
    }

    const generatedDays: DietPlanDayRequest[] = [];
    const current = new Date(start);

    let dayNumber = 1;

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(
        current.getMonth() + 1
      ).padStart(2, "0");
      const day = String(
        current.getDate()
      ).padStart(2, "0");

      const date = `${year}-${month}-${day}`;

      generatedDays.push({
        dayNumber,
        date,
        phase: "REGULAR",
        meals: [],
      });

      current.setDate(
        current.getDate() + 1
      );

      dayNumber++;
    }

    setDays(generatedDays);
  }, [startDate, endDate]);

  // =====================================================
  // ADD MEAL
  // =====================================================

  const addMeal = (dayNumber: number) => {
    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.dayNumber !== dayNumber) {
          return day;
        }

        const nextSequence =
          day.meals.length + 1;

        const newMeal: DietMealRequest = {
          sequenceOrder: nextSequence,
          mealType: "Breakfast",
          mealTime: "",
          foodItems: "",
          instructions: "",
          restrictions: "",
        };

        return {
          ...day,
          meals: [
            ...day.meals,
            newMeal,
          ],
        };
      })
    );
  };

  // =====================================================
  // REMOVE MEAL
  // =====================================================

  const removeMeal = (
    dayNumber: number,
    mealIndex: number
  ) => {
    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.dayNumber !== dayNumber) {
          return day;
        }

        const meals = day.meals
          .filter(
            (_, index) =>
              index !== mealIndex
          )
          .map((meal, index) => ({
            ...meal,
            sequenceOrder: index + 1,
          }));

        return {
          ...day,
          meals,
        };
      })
    );
  };

  // =====================================================
  // UPDATE MEAL
  // =====================================================

  const updateMeal = (
    dayNumber: number,
    mealIndex: number,
    field: keyof DietMealRequest,
    value: string
  ) => {
    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.dayNumber !== dayNumber) {
          return day;
        }

        const meals = day.meals.map(
          (meal, index) => {
            if (index !== mealIndex) {
              return meal;
            }

            return {
              ...meal,
              [field]:
                field === "sequenceOrder"
                  ? Number(value)
                  : value,
            };
          }
        );

        return {
          ...day,
          meals,
        };
      })
    );
  };

  // =====================================================
  // UPDATE DAY PHASE
  // =====================================================

  const updatePhase = (
    dayNumber: number,
    phase: string
  ) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              phase,
            }
          : day
      )
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!id || !patient) {
      return;
    }

    if (!doctor?.id) {
      setError(
        "Doctor information is missing. Please login again."
      );
      return;
    }

    if (!planName.trim()) {
      setError(
        "Please enter a diet plan name."
      );
      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please select start and end dates."
      );
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const request = {
        patientId: patient.id,

        // IMPORTANT:
        // Use the actual Doctor document ID
        // returned from /api/doctors/me.
        doctorId: doctor.id,

        planName: planName.trim(),

        diagnosis:
          diagnosis.trim(),

        startDate,

        endDate,

        status: "ACTIVE",

        notes:
          notes.trim(),

        days,
      };

      const created =
        await createDietPlan(request);

      setSuccess(
        "Diet plan created successfully."
      );

      setExistingPlans((current) => [
        created,
        ...current,
      ]);

      // Clear form after successful creation
      setPlanName("");
      setDiagnosis("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setDays([]);
    } catch (err) {
      console.error(
        "Failed to create diet plan:",
        err
      );

      setError(
        "Unable to create the diet plan."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#F1F0E8] p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D8D2C3] border-t-[#1F3D2E]" />

            <p className="mt-4 text-sm text-[#665849]">
              Loading diet information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / PATIENT UNAVAILABLE
  // =====================================================

  if (error && !patient) {
    return (
      <div className="min-h-full bg-[#F1F0E8] p-8">
        <button
          onClick={() =>
            navigate(
              `/doctor/patients/${id}`
            )
          }
          className="mb-6 text-sm font-semibold text-[#315A46]"
        >
          ← Back to Patient
        </button>

        <div className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-12 text-center">
          <h2 className="text-xl font-semibold text-[#173F32]">
            Diet information unavailable
          </h2>

          <p className="mt-2 text-sm text-[#665849]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F1F0E8] p-8">

      {/* =================================================
          BACK
          ================================================= */}

      <button
        onClick={() =>
          navigate(
            `/doctor/patients/${patient?.id}`
          )
        }
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#315A46] hover:text-[#1F3D2E]"
      >
        <span>←</span>
        Back to Patient
      </button>

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7F4E]">
              Patient Care
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-[#173F32]">
              Diet Plan
            </h1>

            <p className="mt-1 text-sm text-[#665849]">
              {patient?.fullName}
            </p>

            {doctor && (
              <p className="mt-2 text-xs font-medium text-[#766F63]">
                Prescribed by Dr. {doctor.fullName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          SUCCESS / ERROR
          ================================================= */}

      {success && (
        <div className="mt-5 rounded-xl border border-[#B8CBAE] bg-[#EAF2E4] px-5 py-4 text-sm font-medium text-[#315A46]">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          CREATE FORM
          ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        <section className="rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

          <div className="border-b border-[#DDD7C9] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7F4E]">
              New Prescription
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#173F32]">
              Create Diet Plan
            </h2>

            <p className="mt-1 text-sm text-[#766F63]">
              Prescribe meals and dietary instructions for this patient.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">

            {/* PLAN NAME */}

            <Field
              label="Plan Name"
              value={planName}
              onChange={setPlanName}
              placeholder="e.g. Panchakarma Recovery Diet"
            />

            {/* DIAGNOSIS */}

            <Field
              label="Diagnosis"
              value={diagnosis}
              onChange={setDiagnosis}
              placeholder="Clinical diagnosis or dietary reason"
            />

            {/* START DATE */}

            <DateField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />

            {/* END DATE */}

            <DateField
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />

            {/* NOTES */}

            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#665849]">
                General Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows={3}
                placeholder="General dietary guidance..."
                className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-white px-4 py-3 text-sm text-[#3F382F] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            DAILY SCHEDULE
            ================================================= */}

        {days.length > 0 && (
          <section className="mt-6 rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

            <div className="border-b border-[#DDD7C9] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7F4E]">
                Daily Prescription
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#173F32]">
                Meal Schedule
              </h2>
            </div>

            <div className="space-y-5 p-6">

              {days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="rounded-2xl border border-[#D8D2C3] bg-[#F8F6F0] p-5"
                >

                  {/* DAY HEADER */}

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7F4E]">
                        Day {day.dayNumber}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#173F32]">
                        {formatDate(day.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <select
                        value={day.phase}
                        onChange={(e) =>
                          updatePhase(
                            day.dayNumber,
                            e.target.value
                          )
                        }
                        className="rounded-xl border border-[#CFC8B9] bg-white px-3 py-2 text-sm text-[#4E463D] outline-none focus:border-[#6B7F4E]"
                      >
                        <option value="REGULAR">
                          Regular
                        </option>

                        <option value="SAMSARJANA">
                          Samsarjana
                        </option>

                        <option value="POST_THERAPY">
                          Post Therapy
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          addMeal(day.dayNumber)
                        }
                        className="rounded-xl bg-[#1F3D2E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#315A46]"
                      >
                        + Add Meal
                      </button>
                    </div>
                  </div>

                  {/* MEALS */}

                  {day.meals.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-[#CFC8B9] bg-white px-5 py-7 text-center">
                      <p className="text-sm font-medium text-[#665849]">
                        No meals added
                      </p>

                      <p className="mt-1 text-xs text-[#91897C]">
                        Add meals for this day.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">

                      {day.meals.map(
                        (meal, mealIndex) => (
                          <div
                            key={mealIndex}
                            className="rounded-xl border border-[#D8D2C3] bg-white p-5"
                          >

                            <div className="flex items-center justify-between">

                              <h3 className="font-semibold text-[#173F32]">
                                Meal {meal.sequenceOrder}
                              </h3>

                              <button
                                type="button"
                                onClick={() =>
                                  removeMeal(
                                    day.dayNumber,
                                    mealIndex
                                  )
                                }
                                className="text-sm font-semibold text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">

                              <SelectField
                                label="Meal Type"
                                value={meal.mealType}
                                options={[
                                  "Breakfast",
                                  "Mid-Morning",
                                  "Lunch",
                                  "Evening",
                                  "Dinner",
                                  "Bedtime",
                                ]}
                                onChange={(value) =>
                                  updateMeal(
                                    day.dayNumber,
                                    mealIndex,
                                    "mealType",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Meal Time"
                                value={meal.mealTime}
                                onChange={(value) =>
                                  updateMeal(
                                    day.dayNumber,
                                    mealIndex,
                                    "mealTime",
                                    value
                                  )
                                }
                                placeholder="e.g. 08:00 AM"
                              />

                              <div className="md:col-span-2">
                                <TextAreaField
                                  label="Food Items"
                                  value={meal.foodItems}
                                  onChange={(value) =>
                                    updateMeal(
                                      day.dayNumber,
                                      mealIndex,
                                      "foodItems",
                                      value
                                    )
                                  }
                                  placeholder="e.g. Rice porridge, cooked vegetables, herbal tea"
                                />
                              </div>

                              <TextAreaField
                                label="Instructions"
                                value={meal.instructions}
                                onChange={(value) =>
                                  updateMeal(
                                    day.dayNumber,
                                    mealIndex,
                                    "instructions",
                                    value
                                  )
                                }
                                placeholder="Preparation or serving instructions"
                              />

                              <TextAreaField
                                label="Restrictions"
                                value={meal.restrictions}
                                onChange={(value) =>
                                  updateMeal(
                                    day.dayNumber,
                                    mealIndex,
                                    "restrictions",
                                    value
                                  )
                                }
                                placeholder="Foods to avoid"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =================================================
            SUBMIT
            ================================================= */}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || !doctor}
            className="rounded-xl bg-[#1F3D2E] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#315A46] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Creating Diet Plan..."
              : "Create Diet Plan"}
          </button>
        </div>
      </form>

      {/* =================================================
          EXISTING PLANS
          ================================================= */}

      {existingPlans.length > 0 && (
        <section className="mt-8 rounded-2xl border border-[#D8D2C3] bg-[#FFFDF8] shadow-sm">

          <div className="border-b border-[#DDD7C9] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7F4E]">
              Existing Care
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#173F32]">
              Previous Diet Plans
            </h2>
          </div>

          <div className="divide-y divide-[#E4DFD2]">

            {existingPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-[#173F32]">
                    {plan.planName}
                  </h3>

                  <p className="mt-1 text-sm text-[#665849]">
                    {formatDate(plan.startDate)}
                    {" → "}
                    {formatDate(plan.endDate)}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#E4EDDE] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#315A46]">
                  {plan.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// =====================================================
// SMALL COMPONENTS
// =====================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#665849]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-white px-4 py-3 text-sm text-[#3F382F] outline-none transition placeholder:text-[#91897C] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#665849]">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-white px-4 py-3 text-sm text-[#3F382F] outline-none focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#665849]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-white px-4 py-3 text-sm text-[#3F382F] outline-none focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#665849]">
        {label}
      </label>

      <textarea
        rows={3}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#CFC8B9] bg-white px-4 py-3 text-sm text-[#3F382F] outline-none transition placeholder:text-[#91897C] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#DDE7D6]"
      />
    </div>
  );
}

// =====================================================
// DATE FORMATTER
// =====================================================

function formatDate(value: string) {
  if (!value) return "—";

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

export default PatientDietPlanPage;