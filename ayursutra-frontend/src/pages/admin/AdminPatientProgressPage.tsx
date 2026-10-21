import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronRight,
  UserRound,
  Stethoscope,
  CalendarDays,
  CircleCheck,
  FileText,
} from "lucide-react";

import apiClient from "../../services/api/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

/* =========================================================
   TYPES
========================================================= */

interface PatientProgress {
  id: string;
  patientId: string;
  therapyPlanId: string;
  assessmentDate: string;
  dayNumber: number;
  symptoms?: string;
  observations?: string;
  improvementPercentage?: number;
  therapyResponse?: string;
  practitionerNotes?: string;
  nextRecommendation?: string;
}

interface TherapyPlan {
  id: string;
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis?: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface TherapySession {
  id: string;
  therapyPlanId: string;
  patientId: string;
  therapistId?: string;
  therapyId?: string;
  roomId?: string;
  therapyName?: string;
  dayNumber?: number;
  sequenceOrder?: number;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  plannedDurationMinutes?: number;
  actualDurationMinutes?: number;
  status: string;
  notes?: string;
}

interface Patient {
  id: string;
  fullName?: string;
  name?: string;
}

interface Doctor {
  id: string;
  fullName?: string;
  name?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

interface ProgressCardData {
  plan: TherapyPlan;
  patient: Patient | undefined;
  doctor: Doctor | undefined;
  sessions: TherapySession[];
  assessments: PatientProgress[];
  completedSessions: number;
  totalSessions: number;
  progressPercentage: number;
  latestAssessment?: PatientProgress;
}

/* =========================================================
   HELPERS
========================================================= */

const getPatientName = (patient?: Patient) => {
  if (!patient) return "Unknown Patient";
  return patient.fullName || patient.name || "Unknown Patient";
};

const getDoctorName = (doctor?: Doctor) => {
  if (!doctor) return "Not assigned";
  return doctor.fullName || doctor.name || "Not assigned";
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusLabel = (status?: string) => {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusStyles = (status?: string) => {
  const normalized = status?.toUpperCase();

  switch (normalized) {
    case "COMPLETED":
      return {
        container:
          "border-[#B7EBD2] bg-[#F0FFF7] text-[#14845A]",
        dot: "bg-[#24A66F]",
      };

    case "IN_PROGRESS":
      return {
        container:
          "border-[#B7EBD2] bg-[#F0FFF7] text-[#14845A]",
        dot: "bg-[#24A66F]",
      };

    case "PLANNED":
      return {
        container:
          "border-[#C9DDFF] bg-[#F4F8FF] text-[#245EDB]",
        dot: "bg-[#3B82F6]",
      };

    case "CANCELLED":
      return {
        container:
          "border-[#F2C6C6] bg-[#FFF6F6] text-[#C44747]",
        dot: "bg-[#E35D5D]",
      };

    default:
      return {
        container:
          "border-[#E0E5E0] bg-[#F8FAF8] text-[#657267]",
        dot: "bg-[#98A39A]",
      };
  }
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }: { status?: string }) => {
  const styles = getStatusStyles(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${styles.container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {getStatusLabel(status)}
    </span>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdminPatientProgressPage: React.FC = () => {
  const [progressRecords, setProgressRecords] = useState<
    PatientProgress[]
  >([]);

  const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
  const [therapySessions, setTherapySessions] = useState<
    TherapySession[]
  >([]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");

  const [selectedProgress, setSelectedProgress] =
    useState<ProgressCardData | null>(null);

  /* =========================================================
     FETCH DATA
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          progressResponse,
          plansResponse,
          sessionsResponse,
          patientsResponse,
          doctorsResponse,
        ] = await Promise.all([
          apiClient.get<ApiResponse<PatientProgress[]>>(
            "/patient-progress"
          ),
          apiClient.get<ApiResponse<TherapyPlan[]>>(
            "/therapy-plans"
          ),
          apiClient.get<ApiResponse<TherapySession[]>>(
            "/therapy-sessions"
          ),
          apiClient.get<ApiResponse<Patient[]>>("/patients"),
          apiClient.get<ApiResponse<Doctor[]>>("/doctors"),
        ]);

        setProgressRecords(progressResponse.data?.data || []);
        setTherapyPlans(plansResponse.data?.data || []);
        setTherapySessions(sessionsResponse.data?.data || []);
        setPatients(patientsResponse.data?.data || []);
        setDoctors(doctorsResponse.data?.data || []);
      } catch (error) {
        console.error(
          "Failed to fetch patient progress data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     BUILD PROGRESS DATA
  ========================================================= */

  const progressCards = useMemo<ProgressCardData[]>(() => {
    return therapyPlans.map((plan) => {
      const patient = patients.find(
        (item) => item.id === plan.patientId
      );

      const doctor = doctors.find(
        (item) => item.id === plan.doctorId
      );

      const sessions = therapySessions.filter(
        (session) => session.therapyPlanId === plan.id
      );

      const assessments = progressRecords
        .filter(
          (progress) => progress.therapyPlanId === plan.id
        )
        .sort(
          (a, b) =>
            new Date(b.assessmentDate).getTime() -
            new Date(a.assessmentDate).getTime()
        );

      const completedSessions = sessions.filter(
        (session) =>
          session.status?.toUpperCase() === "COMPLETED"
      ).length;

      const totalSessions = sessions.length;

      const progressPercentage =
        totalSessions > 0
          ? Math.round(
              (completedSessions / totalSessions) * 100
            )
          : 0;

      return {
        plan,
        patient,
        doctor,
        sessions,
        assessments,
        completedSessions,
        totalSessions,
        progressPercentage,
        latestAssessment: assessments[0],
      };
    });
  }, [
    therapyPlans,
    therapySessions,
    patients,
    doctors,
    progressRecords,
  ]);

  /* =========================================================
     FILTERS
  ========================================================= */

  const filteredProgressCards = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return progressCards.filter((item) => {
      const patientName = getPatientName(item.patient).toLowerCase();
      const doctorName = getDoctorName(item.doctor).toLowerCase();
      const planName =
        item.plan.planName?.toLowerCase() || "";
      const diagnosis =
        item.plan.diagnosis?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        patientName.includes(search) ||
        doctorName.includes(search) ||
        planName.includes(search) ||
        diagnosis.includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.plan.status?.toUpperCase() === statusFilter;

      const matchesPlan =
        planFilter === "ALL" ||
        item.plan.id === planFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlan
      );
    });
  }, [
    progressCards,
    searchTerm,
    statusFilter,
    planFilter,
  ]);

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
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-8">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#24372D] md:text-5xl">
              Patient Progress
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#68757E] md:text-base">
              Monitor treatment progress and review clinical
              assessments across active therapy plans.
            </p>
          </div>

          {/* =================================================
              FILTER BAR
          ================================================= */}

          <div className="mb-7 rounded-[20px] border border-[#E5E5DF] bg-white p-4 shadow-[0_2px_8px_rgba(30,45,35,0.05)]">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A0AA]"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search patient, doctor, therapy plan or diagnosis..."
                  className="h-14 w-full rounded-xl border border-[#E1E5E0] bg-[#FCFCFA] pl-12 pr-4 text-sm text-[#344239] outline-none transition placeholder:text-[#A0AAB3] focus:border-[#AFC3B1] focus:ring-2 focus:ring-[#DDE8DD]"
                />
              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-14 rounded-xl border border-[#E1E5E0] bg-[#FCFCFA] px-5 text-sm text-[#344239] outline-none focus:border-[#AFC3B1] focus:ring-2 focus:ring-[#DDE8DD] lg:w-44"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Therapy Plan */}

              <select
                value={planFilter}
                onChange={(event) =>
                  setPlanFilter(event.target.value)
                }
                className="h-14 rounded-xl border border-[#E1E5E0] bg-[#FCFCFA] px-5 text-sm text-[#344239] outline-none focus:border-[#AFC3B1] focus:ring-2 focus:ring-[#DDE8DD] lg:w-64"
              >
                <option value="ALL">All Therapy Plans</option>

                {therapyPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.planName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="text-sm text-[#78857D]">
                Loading patient progress...
              </div>
            </div>
          ) : filteredProgressCards.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="rounded-[24px] border border-dashed border-[#D6DDD5] bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF2EC]">
                <UserRound
                  size={24}
                  className="text-[#6B8771]"
                />
              </div>

              <h3 className="mt-5 font-serif text-2xl font-semibold text-[#354239]">
                No patient progress found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#8B969D]">
                Try changing your search or filter criteria
                to find a therapy plan.
              </p>
            </div>
          ) : (
            /* =================================================
               PROGRESS CARDS
            ================================================= */

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredProgressCards.map((item) => (
                <div
                  key={item.plan.id}
                  className="overflow-hidden rounded-[22px] border border-[#E3E6E1] bg-white shadow-[0_2px_8px_rgba(30,45,35,0.05)] transition hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(30,45,35,0.08)]"
                >
                  {/* Card Header */}

                  <div className="flex items-start justify-between gap-4 border-b border-[#EEF0EC] px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3EC]">
                        <UserRound
                          size={20}
                          className="text-[#315C46]"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-[17px] font-semibold text-[#26382E]">
                          {getPatientName(item.patient)}
                        </h2>

                        <p className="mt-1 truncate text-sm text-[#78857D]">
                          {item.plan.planName}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={item.plan.status} />
                  </div>

                  {/* Card Content */}

                  <div className="px-6 py-5">
                    {/* Progress Metric */}

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8A96A5]">
                          Treatment Progress
                        </p>

                        <p className="mt-2 text-sm text-[#536158]">
                          {item.completedSessions} /{" "}
                          {item.totalSessions} sessions
                          completed
                        </p>
                      </div>
                    </div>

                    {/* Details */}

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-[#FBFAF7] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope
                            size={14}
                            className="text-[#82918A]"
                          />

                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#929DA5]">
                            Doctor
                          </span>
                        </div>

                        <p className="mt-2 truncate text-sm font-medium text-[#354239]">
                          {getDoctorName(item.doctor)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FBFAF7] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={14}
                            className="text-[#82918A]"
                          />

                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#929DA5]">
                            Started
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-[#354239]">
                          {formatDate(item.plan.startDate)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FBFAF7] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CircleCheck
                            size={14}
                            className="text-[#82918A]"
                          />

                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#929DA5]">
                            Last Assessment
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-[#354239]">
                          {item.latestAssessment
                            ? formatDate(
                                item.latestAssessment
                                  .assessmentDate
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* View Progress */}

                    <button
                      onClick={() =>
                        setSelectedProgress(item)
                      }
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#DCE5DB] bg-white text-sm font-medium text-[#52725A] transition hover:border-[#B8CCBA] hover:bg-[#F4F8F3]"
                    >
                      View Progress
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          PROGRESS MODAL
      ===================================================== */}

      {selectedProgress && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17251F]/45 px-4 py-6 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProgress(null);
            }
          }}
        >
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[#E3E7E0] bg-[#FBFAF6] shadow-[0_24px_80px_rgba(32,52,42,0.24)]">
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex shrink-0 items-start justify-between border-b border-[#E7E9E3] px-7 py-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#66816D]">
                  Patient Progress
                </p>

                <h2 className="mt-1 font-serif text-3xl font-semibold text-[#26382E]">
                  {getPatientName(
                    selectedProgress.patient
                  )}
                </h2>

                <p className="mt-1 text-sm text-[#7A8790]">
                  {selectedProgress.plan.planName}
                </p>
              </div>

              <button
                onClick={() => setSelectedProgress(null)}
                className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E1E5DE] bg-white text-[#7A8790] transition hover:bg-[#EEF2EC] hover:text-[#355B42]"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="overflow-y-auto px-7 py-7">
              {/* Summary */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Doctor */}

                <div className="rounded-2xl border border-[#E5E9E2] bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF3EC]">
                      <Stethoscope
                        size={17}
                        className="text-[#315C46]"
                      />
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A0AD]">
                      Doctor
                    </span>
                  </div>

                  <p className="text-[15px] font-medium text-[#354239]">
                    {getDoctorName(
                      selectedProgress.doctor
                    )}
                  </p>
                </div>

                {/* Treatment Period */}

                <div className="rounded-2xl border border-[#E5E9E2] bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF3EC]">
                      <CalendarDays
                        size={17}
                        className="text-[#315C46]"
                      />
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A0AD]">
                      Treatment Period
                    </span>
                  </div>

                  <p className="text-[15px] font-medium text-[#354239]">
                    {formatDate(
                      selectedProgress.plan.startDate
                    )}{" "}
                    —{" "}
                    {formatDate(
                      selectedProgress.plan.endDate
                    )}
                  </p>
                </div>

                {/* Sessions */}

                <div className="rounded-2xl border border-[#E5E9E2] bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF3EC]">
                      <CircleCheck
                        size={17}
                        className="text-[#315C46]"
                      />
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A0AD]">
                      Sessions
                    </span>
                  </div>

                  <p className="text-[15px] font-medium text-[#354239]">
                    {selectedProgress.completedSessions} /{" "}
                    {selectedProgress.totalSessions}{" "}
                    completed
                  </p>
                </div>
              </div>

              {/* =================================================
                  TREATMENT PROGRESS
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-[#E5E9E2] bg-white p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A96A5]">
                      Treatment Progress
                    </p>

                    <p className="mt-2 text-sm text-[#536158]">
                      {
                        selectedProgress.completedSessions
                      }{" "}
                      of {selectedProgress.totalSessions}{" "}
                      therapy sessions completed
                    </p>
                  </div>

                  <p className="font-serif text-4xl font-semibold text-[#315C46]">
                    {selectedProgress.progressPercentage}%
                  </p>
                </div>

                {/* Segmented progress */}

                {selectedProgress.totalSessions > 0 && (
                  <div className="mt-5 flex gap-1.5">
                    {Array.from({
                      length: selectedProgress.totalSessions,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full ${
                          index <
                          selectedProgress.completedSessions
                            ? "bg-[#315C46]"
                            : "bg-[#E8ECE7]"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* =================================================
                  SESSION TIMELINE
              ================================================= */}

              <div className="mt-8">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A96A5]">
                    Treatment History
                  </p>

                  <h3 className="mt-1 font-serif text-2xl font-semibold text-[#304238]">
                    Session Timeline
                  </h3>
                </div>

                {selectedProgress.sessions.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D9DED8] bg-white px-6 py-10 text-center">
                    <p className="text-sm text-[#8A9690]">
                      No therapy sessions have been
                      scheduled for this plan yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...selectedProgress.sessions]
                      .sort(
                        (a, b) =>
                          (a.dayNumber || 0) -
                          (b.dayNumber || 0) ||
                          (a.sequenceOrder || 0) -
                            (b.sequenceOrder || 0)
                      )
                      .map((session, index) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-4 rounded-2xl border border-[#E7EAE4] bg-white px-5 py-4 transition hover:border-[#D5DED3]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF3EC] text-sm font-semibold text-[#315C46]">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[#354239]">
                              Session {index + 1}
                            </p>

                            <p className="mt-1 text-sm text-[#8A96A5]">
                              {formatDate(
                                session.sessionDate
                              )}

                              {session.therapyName
                                ? ` · ${session.therapyName}`
                                : ""}
                            </p>
                          </div>

                          <StatusBadge
                            status={session.status}
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* =================================================
                  CLINICAL ASSESSMENTS
              ================================================= */}

              <div className="mt-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A96A5]">
                      Clinical Monitoring
                    </p>

                    <h3 className="mt-1 font-serif text-2xl font-semibold text-[#304238]">
                      Clinical Assessments
                    </h3>
                  </div>

                  <span className="text-sm text-[#8A96A5]">
                    {selectedProgress.assessments.length}{" "}
                    {selectedProgress.assessments.length ===
                    1
                      ? "assessment"
                      : "assessments"}
                  </span>
                </div>

                {selectedProgress.assessments.length ===
                0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#D9DED8] bg-white px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3EF]">
                      <FileText
                        size={21}
                        className="text-[#91A095]"
                      />
                    </div>

                    <p className="mt-4 font-medium text-[#536158]">
                      No clinical assessments yet
                    </p>

                    <p className="mt-1 text-sm text-[#929DA5]">
                      Clinical observations will appear
                      here as the patient progresses.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selectedProgress.assessments.map(
                      (assessment) => (
                        <div
                          key={assessment.id}
                          className="rounded-2xl border border-[#E5E9E2] bg-white p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-[#354239]">
                                Day {assessment.dayNumber}
                              </p>

                              <p className="mt-1 text-xs text-[#8A9690]">
                                {formatDate(
                                  assessment.assessmentDate
                                )}
                              </p>
                            </div>

                            {assessment.improvementPercentage !==
                              undefined &&
                              assessment.improvementPercentage !==
                                null && (
                                <div className="rounded-full bg-[#EDF4EC] px-3 py-1.5 text-xs font-semibold text-[#315C46]">
                                  {
                                    assessment.improvementPercentage
                                  }
                                  % improvement
                                </div>
                              )}
                          </div>

                          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {assessment.symptoms && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A29D]">
                                  Symptoms
                                </p>

                                <p className="mt-1.5 text-sm leading-6 text-[#536158]">
                                  {assessment.symptoms}
                                </p>
                              </div>
                            )}

                            {assessment.observations && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A29D]">
                                  Observations
                                </p>

                                <p className="mt-1.5 text-sm leading-6 text-[#536158]">
                                  {assessment.observations}
                                </p>
                              </div>
                            )}

                            {assessment.therapyResponse && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A29D]">
                                  Therapy Response
                                </p>

                                <p className="mt-1.5 text-sm leading-6 text-[#536158]">
                                  {
                                    assessment.therapyResponse
                                  }
                                </p>
                              </div>
                            )}

                            {assessment.practitionerNotes && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A29D]">
                                  Practitioner Notes
                                </p>

                                <p className="mt-1.5 text-sm leading-6 text-[#536158]">
                                  {
                                    assessment.practitionerNotes
                                  }
                                </p>
                              </div>
                            )}

                            {assessment.nextRecommendation && (
                              <div className="md:col-span-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A29D]">
                                  Next Recommendation
                                </p>

                                <p className="mt-1.5 text-sm leading-6 text-[#536158]">
                                  {
                                    assessment.nextRecommendation
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Bottom spacing */}

              <div className="h-3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatientProgressPage;