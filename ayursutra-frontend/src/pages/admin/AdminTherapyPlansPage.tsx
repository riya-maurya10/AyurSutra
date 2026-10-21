import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  CheckCircle2,
  Eye,
  FileText,
  Search,
  X,
} from "lucide-react";

import apiClient from "../../services/api/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

/* =========================================================
   TYPES
   ========================================================= */

interface TherapyPlanItem {
  day: number;
  therapyId: string;
  therapyName: string;
  durationMinutes: number;
  sequenceOrder: number;
}

interface TherapyPlan {
  id: string;
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis: string | null;
  startDate: string;
  endDate: string;
  status: string;
  therapies: TherapyPlanItem[];
}

interface TherapySession {
  id: string;
  therapyPlanId: string;
  status: string;
}

interface Patient {
  id: string;
  userId?: string;
  fullName: string;
  email?: string;
  phone?: string;
}

interface Doctor {
  id: string;
  userId?: string;
  fullName: string;
  email?: string;
  phone?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate && !endDate) {
    return "—";
  }

  if (startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function formatStatus(status: string) {
  switch (status?.toUpperCase()) {
    case "IN_PROGRESS":
      return "In Progress";

    case "ACTIVE":
      return "Active";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    case "PLANNED":
      return "Planned";

    default:
      return status
        ? status
            .toLowerCase()
            .replace(/\_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
        : "Unknown";
  }
}

function getStatusClasses(status: string) {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return {
        badge: "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
      };

    case "CANCELLED":
      return {
        badge: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    case "ACTIVE":
    case "IN_PROGRESS":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "PLANNED":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };

    default:
      return {
        badge: "border-gray-200 bg-gray-50 text-gray-600",
        dot: "bg-gray-400",
      };
  }
}

/* =========================================================
   COMPONENT
   ========================================================= */

function AdminTherapyPlansPage() {
  const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>(
    []
  );

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | null>(null);

  /* =========================================================
     LOAD DATA
     ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          therapyPlansResponse,
          therapySessionsResponse,
          patientsResponse,
          doctorsResponse,
        ] = await Promise.all([
          apiClient.get<ApiResponse<TherapyPlan[]>>("/therapy-plans"),

          apiClient.get<ApiResponse<TherapySession[]>>(
            "/therapy-sessions"
          ),

          apiClient.get<ApiResponse<Patient[]>>("/patients"),

          apiClient.get<ApiResponse<Doctor[]>>("/doctors"),
        ]);

        setTherapyPlans(therapyPlansResponse.data.data ?? []);

        setTherapySessions(therapySessionsResponse.data.data ?? []);

        setPatients(patientsResponse.data.data ?? []);

        setDoctors(doctorsResponse.data.data ?? []);
      } catch (err: any) {
        console.error("Failed to load therapy plans:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load therapy plans. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     PATIENT / DOCTOR LOOKUP
     ========================================================= */

  const patientMap = useMemo(() => {
    const map = new Map<string, Patient>();

    patients.forEach((patient) => {
      if (patient.id) {
        map.set(patient.id, patient);
      }
    });

    return map;
  }, [patients]);

  const doctorMap = useMemo(() => {
    const map = new Map<string, Doctor>();

    doctors.forEach((doctor) => {
      if (doctor.id) {
        map.set(doctor.id, doctor);
      }
    });

    return map;
  }, [doctors]);

  const getPatientName = (patientId: string) => {
    return patientMap.get(patientId)?.fullName || "Unknown Patient";
  };

  const getDoctorName = (doctorId: string) => {
    return doctorMap.get(doctorId)?.fullName || "Unknown Doctor";
  };

  /* =========================================================
     PROGRESS
     ========================================================= */

  const getPlanProgress = (planId: string) => {
    const sessions = therapySessions.filter(
      (session) => session.therapyPlanId === planId
    );

    const total = sessions.length;

    const completed = sessions.filter(
      (session) => session.status?.toUpperCase() === "COMPLETED"
    ).length;

    const percentage =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      completed,
      total,
      percentage,
    };
  };

  /* =========================================================
     SEARCH + FILTER
     ========================================================= */

  const filteredPlans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return therapyPlans.filter((plan) => {
      const patientName = getPatientName(plan.patientId).toLowerCase();

      const doctorName = getDoctorName(plan.doctorId).toLowerCase();

      const matchesSearch =
        !query ||
        plan.planName?.toLowerCase().includes(query) ||
        plan.patientId?.toLowerCase().includes(query) ||
        plan.doctorId?.toLowerCase().includes(query) ||
        plan.diagnosis?.toLowerCase().includes(query) ||
        patientName.includes(query) ||
        doctorName.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        plan.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    therapyPlans,
    therapySessions,
    searchQuery,
    statusFilter,
    patientMap,
    doctorMap,
  ]);

  /* =========================================================
     STATS
     ========================================================= */

  const totalPlans = therapyPlans.length;

  const activePlans = therapyPlans.filter((plan) =>
    ["ACTIVE", "IN_PROGRESS"].includes(plan.status?.toUpperCase())
  ).length;

  const completedPlans = therapyPlans.filter(
    (plan) => plan.status?.toUpperCase() === "COMPLETED"
  ).length;

  const cancelledPlans = therapyPlans.filter(
    (plan) => plan.status?.toUpperCase() === "CANCELLED"
  ).length;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <Sidebar role="ADMIN" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <Topbar
          title="Admin Portal"
          userName="Riya Maurya"
          role="ADMIN"
        />

        <main className="flex-1 p-5 md:p-8">
          {/* =====================================================
              HEADER
             ===================================================== */}

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-[#2F3A32] md:text-4xl">
              Therapy Plans
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor and review patient treatment plans
            </p>
          </div>

          {/* =====================================================
              STATS
             ===================================================== */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Plans
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#2F3A32]">
                    {totalPlans}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#557A5A]">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            {/* Active */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Active Plans
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#2F3A32]">
                    {activePlans}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Activity size={21} />
                </div>
              </div>
            </div>

            {/* Completed */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Completed
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#2F3A32]">
                    {completedPlans}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            {/* Cancelled */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Cancelled
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#2F3A32]">
                    {cancelledPlans}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <X size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SEARCH + FILTER
             ===================================================== */}

          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search by plan, patient, doctor or diagnosis..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="PLANNED">
                  Planned
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>
          </div>

          {/* =====================================================
              ERROR
             ===================================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =====================================================
              LOADING / EMPTY / TABLE
             ===================================================== */}

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#557A5A]" />

              <p className="text-sm text-gray-500">
                Loading therapy plans...
              </p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <FileText
                size={42}
                className="mx-auto mb-4 text-gray-300"
              />

              <h3 className="text-lg font-semibold text-[#2F3A32]">
                No therapy plans found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FCFBF8] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Therapy Plan
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Doctor
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Schedule
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPlans.map((plan) => {
                      const statusClasses = getStatusClasses(
                        plan.status
                      );

                      const patientName = getPatientName(
                        plan.patientId
                      );

                      const doctorName = getDoctorName(
                        plan.doctorId
                      );

                      return (
                        <tr
                          key={plan.id}
                          className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#FCFBF8]"
                        >
                          {/* PLAN */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#557A5A]">
                                <FileText size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate font-medium text-[#2F3A32]">
                                  {plan.planName ||
                                    "Unnamed Plan"}
                                </p>

                                <p className="mt-1 max-w-[230px] truncate text-xs text-gray-400">
                                  {plan.diagnosis ||
                                    "No diagnosis"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* PATIENT */}

                          <td className="px-6 py-5">
                            <div className="min-w-[170px]">
                              <p className="font-medium text-[#2F3A32]">
                                {patientName}
                              </p>

                              <p className="mt-1 max-w-[180px] truncate text-xs text-gray-400">
                                ID: {plan.patientId}
                              </p>
                            </div>
                          </td>

                          {/* DOCTOR */}

                          <td className="px-6 py-5">
                            <div className="min-w-[170px]">
                              <p className="font-medium text-[#2F3A32]">
                                {doctorName}
                              </p>

                              <p className="mt-1 max-w-[180px] truncate text-xs text-gray-400">
                                ID: {plan.doctorId}
                              </p>
                            </div>
                          </td>

                          {/* SCHEDULE */}

                          <td className="px-6 py-5">
                            <div className="min-w-[125px]">
                              <p className="text-sm font-medium text-[#2F3A32]">
                                {formatDateRange(
                                  plan.startDate,
                                  plan.endDate
                                )}
                              </p>
                            </div>
                          </td>

                       
                          {/* STATUS */}

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusClasses.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                              />

                              {formatStatus(plan.status)}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPlan(plan)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#557A5A] transition hover:border-[#557A5A] hover:bg-[#F5F8F4]"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
                Showing {filteredPlans.length} of{" "}
                {therapyPlans.length} therapy plans
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
          VIEW DETAILS MODAL
         ========================================================= */}

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5 md:px-7">
              <div className="min-w-0 pr-6">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#557A5A]">
                  Therapy Plan
                </p>

                <h2 className="mt-1 truncate font-serif text-2xl font-semibold text-[#2F3A32] md:text-3xl">
                  {selectedPlan.planName}
                </h2>

                {selectedPlan.diagnosis && (
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {selectedPlan.diagnosis}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="overflow-y-auto px-6 py-6 md:px-7">
              {/* PEOPLE + DATES */}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* PATIENT */}

                <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Patient
                  </p>

                  <p className="mt-2 text-base font-medium text-[#2F3A32]">
                    {getPatientName(
                      selectedPlan.patientId
                    )}
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-400">
                    ID: {selectedPlan.patientId}
                  </p>
                </div>

                {/* DOCTOR */}

                <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Doctor
                  </p>

                  <p className="mt-2 text-base font-medium text-[#2F3A32]">
                    {getDoctorName(
                      selectedPlan.doctorId
                    )}
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-400">
                    ID: {selectedPlan.doctorId}
                  </p>
                </div>

                {/* START DATE */}

                <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Start Date
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#2F3A32]">
                    {formatDate(
                      selectedPlan.startDate
                    )}
                  </p>
                </div>

                {/* END DATE */}

                <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    End Date
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#2F3A32]">
                    {formatDate(
                      selectedPlan.endDate
                    )}
                  </p>
                </div>
              </div>

              {/* PROGRESS */}

              {(() => {
                const progress = getPlanProgress(
                  selectedPlan.id
                );

                return (
                  <div className="mt-6 rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                          Treatment Progress
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#2F3A32]">
                          {progress.completed} of{" "}
                          {progress.total} sessions completed
                        </p>
                      </div>

                      <span className="text-lg font-semibold text-[#557A5A]">
                        {progress.percentage}%
                      </span>
                    </div>

                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#557A5A] transition-all duration-300"
                        style={{
                          width: `${progress.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* STATUS */}

              <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 bg-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Plan Status
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Current treatment plan status
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    getStatusClasses(
                      selectedPlan.status
                    ).badge
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      getStatusClasses(
                        selectedPlan.status
                      ).dot
                    }`}
                  />

                  {formatStatus(selectedPlan.status)}
                </span>
              </div>

              {/* DIAGNOSIS */}

              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Diagnosis
                </p>

                <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] px-4 py-3.5">
                  <p className="text-sm leading-6 text-gray-600">
                    {selectedPlan.diagnosis ||
                      "No diagnosis provided."}
                  </p>
                </div>
              </div>

              {/* PLANNED THERAPIES */}

              <div className="mt-7">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Treatment Schedule
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-[#2F3A32]">
                      Planned Therapies
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500">
                    {selectedPlan.therapies?.length ?? 0}{" "}
                    {selectedPlan.therapies?.length === 1
                      ? "therapy"
                      : "therapies"}
                  </p>
                </div>

                {selectedPlan.therapies?.length ? (
                  <div className="space-y-2.5">
                    {[...selectedPlan.therapies]
                      .sort(
                        (a, b) =>
                          a.day - b.day ||
                          a.sequenceOrder -
                            b.sequenceOrder
                      )
                      .map((therapy, index) => (
                        <div
                          key={`${therapy.therapyId}-${therapy.day}-${index}`}
                          className="rounded-xl border border-gray-100 bg-[#FCFBF8] px-4 py-3.5 transition hover:border-[#DCE7DC] hover:bg-[#F9FBF8]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF2EA] text-xs font-semibold text-[#557A5A]">
                                {therapy.day}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-[#2F3A32]">
                                  {therapy.therapyName}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-gray-400">
                                  Therapy ID:{" "}
                                  {therapy.therapyId}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-4 text-xs text-gray-500 sm:pl-4">
                              <span>
                                Day {therapy.day}
                              </span>

                              <span>
                                {therapy.durationMinutes}{" "}
                                min
                              </span>

                              <span>
                                #{therapy.sequenceOrder}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    No therapies added to this plan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTherapyPlansPage;