import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiClient from "../../services/api/client";
import {
  getAllPatients,
  type PatientResponse,
} from "../../services/doctor/doctorService";

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

type StatusFilter =
  | "ALL"
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED";

function DoctorTherapyPlansPage() {
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [patients, setPatients] = useState<PatientResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  /*
   * ============================================================
   * LOAD THERAPY PLANS + PATIENTS
   * ============================================================
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [plansResponse, patientsResponse] =
          await Promise.all([
            apiClient.get<ApiResponse<TherapyPlan[]>>(
              "/therapy-plans/doctor/my"
            ),
            getAllPatients(),
          ]);

        setPlans(plansResponse.data.data ?? []);
        setPatients(patientsResponse ?? []);
      } catch (err) {
        console.error(
          "Failed to load doctor therapy plans:",
          err
        );

        setError(
          "Unable to load therapy plans. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /*
   * ============================================================
   * GET PATIENT
   * ============================================================
   */
  const getPatient = (patientId: string) => {
    return patients.find(
      (patient) => patient.id === patientId
    );
  };

  /*
   * ============================================================
   * SUMMARY COUNTS
   * ============================================================
   */
  const totalPlans = plans.length;

  const plannedPlans = plans.filter(
    (plan) =>
      plan.status?.toUpperCase() === "PLANNED"
  ).length;

  const inProgressPlans = plans.filter(
    (plan) =>
      plan.status?.toUpperCase() === "IN_PROGRESS"
  ).length;

  const completedPlans = plans.filter(
    (plan) =>
      plan.status?.toUpperCase() === "COMPLETED"
  ).length;

  /*
   * ============================================================
   * SEARCH + STATUS FILTER
   * ============================================================
   */
  const filteredPlans = plans.filter((plan) => {
    const search = searchTerm.trim().toLowerCase();

    const patient = getPatient(plan.patientId);

    const patientName =
      patient?.fullName?.toLowerCase() ?? "";

    const planName =
      plan.planName?.toLowerCase() ?? "";

    const diagnosis =
      plan.diagnosis?.toLowerCase() ?? "";

    const planStatus =
      plan.status?.toLowerCase() ?? "";

    const therapyNames =
      (plan.therapies ?? [])
        .map(
          (therapy) =>
            therapy.therapyName?.toLowerCase() ?? ""
        )
        .join(" ");

    const matchesSearch =
      search === "" ||
      patientName.includes(search) ||
      planName.includes(search) ||
      diagnosis.includes(search) ||
      planStatus.includes(search) ||
      therapyNames.includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      plan.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */
  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * ============================================================
   * FORMAT STATUS
   * ============================================================
   */
  const formatStatus = (status: string) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  /*
   * ============================================================
   * STATUS CLASSES
   * ============================================================
   */
  const getStatusClasses = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "IN_PROGRESS":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "COMPLETED":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  /*
   * ============================================================
   * STATUS DOT
   * ============================================================
   */
  const getStatusDot = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
        return "bg-blue-500";

      case "IN_PROGRESS":
        return "bg-emerald-500";

      case "COMPLETED":
        return "bg-purple-500";

      case "CANCELLED":
        return "bg-red-500";

      default:
        return "bg-gray-400";
    }
  };

  /*
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading therapy plans...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Fetching your treatment plans
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */
  return (
    <div className="w-full space-y-6 px-6 py-5 lg:px-8">
      {/* ========================================================
          HEADER
      ========================================================= */}

      <div className="px-1">
        <p className="text-sm font-medium text-emerald-700">
          Clinical Management
        </p>
      </div>

      {/* ========================================================
          SUMMARY CARDS
      ========================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Plans */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Plans
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {totalPlans}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                All treatment plans
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <ClipboardList className="h-5 w-5 text-emerald-700" />
            </div>
          </div>
        </div>

        {/* Planned */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Planned
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {plannedPlans}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Awaiting treatment
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                In Progress
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {inProgressPlans}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Active treatment
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <Clock3 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {completedPlans}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Finished treatment
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH + STATUS FILTER
      ========================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search patient, plan, diagnosis or therapy..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            {/* Only our clear button */}
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "ALL"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("PLANNED")}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "PLANNED"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Planned
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter("IN_PROGRESS")
              }
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "IN_PROGRESS"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              In Progress
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "COMPLETED"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Result count */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {filteredPlans.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {plans.length}
            </span>{" "}
            plans
          </p>

          {(searchTerm || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-emerald-700 transition hover:text-emerald-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          ERROR
      ========================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ========================================================
          NO RESULTS
      ========================================================= */}

      {!error && filteredPlans.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-6 w-6 text-gray-400" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {searchTerm || statusFilter !== "ALL"
              ? "No matching therapy plans"
              : "No therapy plans yet"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {searchTerm || statusFilter !== "ALL"
              ? "Try a different search term or clear the filters to see all treatment plans."
              : "Therapy plans that you create for your patients will appear here."}
          </p>

          {(searchTerm || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          THERAPY PLANS
      ========================================================= */}

      {!error && filteredPlans.length > 0 && (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const patient = getPatient(plan.patientId);

            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-100 hover:shadow-md"
              >
                {/* ------------------------------------------------
                    PLAN HEADER
                ------------------------------------------------- */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {plan.planName}
                      </h2>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          plan.status
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                            plan.status
                          )}`}
                        />

                        {formatStatus(plan.status)}
                      </span>
                    </div>

                    {/* Patient */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserRound className="h-4 w-4 text-gray-400" />

                        <span className="font-medium text-gray-800">
                          {patient?.fullName ??
                            "Unknown Patient"}
                        </span>
                      </div>

                      <span className="h-1 w-1 rounded-full bg-gray-300" />

                      <span className="text-xs text-gray-400">
                        Plan ID: {plan.id.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex shrink-0 items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />

                    <span>
                      {formatDate(plan.startDate)}

                      <span className="mx-1.5 text-gray-300">
                        →
                      </span>

                      {formatDate(plan.endDate)}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-gray-100" />

                {/* ------------------------------------------------
                    DIAGNOSIS
                ------------------------------------------------- */}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Stethoscope className="h-4 w-4 text-emerald-700" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Diagnosis
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {plan.diagnosis ||
                          "No diagnosis provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------
                    TREATMENT SCHEDULE
                ------------------------------------------------- */}

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Treatment Schedule
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Therapies included in this treatment
                        plan
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {plan.therapies?.length ?? 0}{" "}
                      {(plan.therapies?.length ?? 0) === 1
                        ? "therapy"
                        : "therapies"}
                    </span>
                  </div>

                  {plan.therapies &&
                  plan.therapies.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {plan.therapies.map(
                        (therapy, index) => (
                          <div
                            key={`${plan.id}-${therapy.day}-${therapy.sequenceOrder}-${index}`}
                            className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-emerald-800">
                                {therapy.therapyName}
                              </p>

                              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
                                Day {therapy.day}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-emerald-700/70">
                              {therapy.durationMinutes}{" "}
                              minutes

                              <span className="mx-1.5">
                                •
                              </span>

                              Sequence{" "}
                              {therapy.sequenceOrder}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-gray-200 px-4 py-5 text-center">
                      <p className="text-sm text-gray-500">
                        No therapies added to this plan.
                      </p>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------
                    ACTION
                ------------------------------------------------- */}

                <div className="mt-5 flex items-center justify-end border-t border-gray-100 pt-4">
                  <Link
                    to={`/doctor/patients/${plan.patientId}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    View Patient Record
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DoctorTherapyPlansPage;