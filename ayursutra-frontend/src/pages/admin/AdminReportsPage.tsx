import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  HeartPulse,
  Loader2,
  Stethoscope,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import apiClient from "../../services/api/client";

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

interface Patient {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  status?: string;
}

interface Doctor {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
}

interface Therapist {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
}

interface Therapy {
  id: string;
  name?: string;
  therapyName?: string;
  status?: string;
}

interface TherapyPlan {
  id: string;
  patientId?: string;
  doctorId?: string;
  therapyId?: string;
  therapyName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface TherapySession {
  id: string;
  patientId?: string;
  therapistId?: string;
  therapyId?: string;
  therapyPlanId?: string;
  therapyName?: string;
  sessionDate?: string;
  status?: string;
}

interface PatientProgress {
  id: string;
  patientId?: string;
  therapyPlanId?: string;
  assessmentDate?: string;
  improvementPercentage?: number;
}

type DateFilter =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_3_MONTHS"
  | "ALL";

const getArray = <T,>(response: ApiResponse<T[]> | T[] | undefined): T[] => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
};

const getPersonName = (
  person?: Patient | Doctor | Therapist | null,
): string => {
  if (!person) return "Unknown";

  if (person.fullName?.trim()) return person.fullName;
  if (person.name?.trim()) return person.name;

  const fullName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();

  return fullName || "Unknown";
};

const normalizeStatus = (status?: string) =>
  (status ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isSameDay = (date: Date, target: Date) =>
  date.getFullYear() === target.getFullYear() &&
  date.getMonth() === target.getMonth() &&
  date.getDate() === target.getDate();

const isWithinSelectedRange = (
  dateString: string | undefined,
  filter: DateFilter,
) => {
  if (filter === "ALL") return true;
  if (!dateString) return false;

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  if (filter === "TODAY") {
    return isSameDay(date, now);
  }

  if (filter === "THIS_WEEK") {
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - diffToMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return date >= start && date < end;
  }

  if (filter === "THIS_MONTH") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  if (filter === "LAST_3_MONTHS") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setMonth(start.getMonth() - 2);
    start.setDate(1);

    return date >= start && date <= now;
  }

  return true;
};

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);

  const labels: Record<string, string> = {
    PLANNED: "Planned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    CANCELED: "Cancelled",
    SCHEDULED: "Scheduled",
    NO_SHOW: "No Show",
  };

  return labels[normalized] ?? status ?? "Unknown";
};

const getStatusClasses = (status?: string) => {
  const normalized = normalizeStatus(status);

  if (normalized === "COMPLETED") {
    return "bg-[#E8F2EA] text-[#315C46]";
  }

  if (normalized === "IN_PROGRESS") {
    return "bg-[#EEF3E8] text-[#557047]";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "CANCELED" ||
    normalized === "NO_SHOW"
  ) {
    return "bg-[#F9ECE9] text-[#A45B4E]";
  }

  return "bg-[#F2EFE7] text-[#766F62]";
};

export default function AdminReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [patientProgress, setPatientProgress] = useState<PatientProgress[]>(
    [],
  );

  const [dateFilter, setDateFilter] = useState<DateFilter>("THIS_MONTH");
  const [therapyFilter, setTherapyFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          patientsRes,
          doctorsRes,
          therapistsRes,
          therapiesRes,
          plansRes,
          sessionsRes,
          progressRes,
        ] = await Promise.all([
          apiClient.get<ApiResponse<Patient[]> | Patient[]>("/patients"),
          apiClient.get<ApiResponse<Doctor[]> | Doctor[]>("/doctors"),
          apiClient.get<ApiResponse<Therapist[]> | Therapist[]>("/therapists"),
          apiClient.get<ApiResponse<Therapy[]> | Therapy[]>("/therapies"),
          apiClient.get<ApiResponse<TherapyPlan[]> | TherapyPlan[]>(
            "/therapy-plans",
          ),
          apiClient.get<ApiResponse<TherapySession[]> | TherapySession[]>(
            "/therapy-sessions",
          ),
          apiClient.get<ApiResponse<PatientProgress[]> | PatientProgress[]>(
            "/patient-progress",
          ),
        ]);

        setPatients(getArray(patientsRes.data));
        setDoctors(getArray(doctorsRes.data));
        setTherapists(getArray(therapistsRes.data));
        setTherapies(getArray(therapiesRes.data));
        setTherapyPlans(getArray(plansRes.data));
        setTherapySessions(getArray(sessionsRes.data));
        setPatientProgress(getArray(progressRes.data));
      } catch (err) {
        console.error("Failed to load reports:", err);
        setError("Unable to load report data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  const selectedSessions = useMemo(() => {
    return therapySessions.filter((session) => {
      const dateMatches = isWithinSelectedRange(
        session.sessionDate,
        dateFilter,
      );

      const therapyMatches =
        therapyFilter === "ALL" ||
        session.therapyId === therapyFilter ||
        session.therapyName === therapyFilter;

      return dateMatches && therapyMatches;
    });
  }, [therapySessions, dateFilter, therapyFilter]);

  const selectedPlans = useMemo(() => {
    return therapyPlans.filter((plan) => {
      const dateMatches = isWithinSelectedRange(
        plan.startDate,
        dateFilter,
      );

      const therapyMatches =
        therapyFilter === "ALL" ||
        plan.therapyId === therapyFilter ||
        plan.therapyName === therapyFilter;

      return dateMatches && therapyMatches;
    });
  }, [therapyPlans, dateFilter, therapyFilter]);

  const completedSessions = useMemo(
    () =>
      selectedSessions.filter(
        (session) => normalizeStatus(session.status) === "COMPLETED",
      ),
    [selectedSessions],
  );

  const cancelledSessions = useMemo(
    () =>
      selectedSessions.filter((session) =>
        ["CANCELLED", "CANCELED"].includes(
          normalizeStatus(session.status),
        ),
      ),
    [selectedSessions],
  );

  const noShowSessions = useMemo(
    () =>
      selectedSessions.filter(
        (session) => normalizeStatus(session.status) === "NO_SHOW",
      ),
    [selectedSessions],
  );

  const activePlans = useMemo(
    () =>
      selectedPlans.filter((plan) =>
        ["PLANNED", "IN_PROGRESS"].includes(normalizeStatus(plan.status)),
      ),
    [selectedPlans],
  );

  const completedPlans = useMemo(
    () =>
      selectedPlans.filter(
        (plan) => normalizeStatus(plan.status) === "COMPLETED",
      ),
    [selectedPlans],
  );

  const selectedPatientIds = useMemo(() => {
    const ids = new Set<string>();

    selectedSessions.forEach((session) => {
      if (session.patientId) ids.add(session.patientId);
    });

    selectedPlans.forEach((plan) => {
      if (plan.patientId) ids.add(plan.patientId);
    });

    return ids;
  }, [selectedSessions, selectedPlans]);

  const clinicPatients = useMemo(() => {
    if (dateFilter === "ALL" && therapyFilter === "ALL") {
      return patients.length;
    }

    return selectedPatientIds.size;
  }, [patients.length, dateFilter, therapyFilter, selectedPatientIds]);

  const averageImprovement = useMemo(() => {
    const relevantAssessments = patientProgress.filter((progress) => {
      const dateMatches = isWithinSelectedRange(
        progress.assessmentDate,
        dateFilter,
      );

      if (!dateMatches) return false;

      if (therapyFilter === "ALL") return true;

      const relatedPlan = therapyPlans.find(
        (plan) => plan.id === progress.therapyPlanId,
      );

      return (
        relatedPlan?.therapyId === therapyFilter ||
        relatedPlan?.therapyName === therapyFilter
      );
    });

    const values = relevantAssessments
      .map((item) => item.improvementPercentage)
      .filter(
        (value): value is number =>
          typeof value === "number" && value >= 0,
      );

    if (!values.length) return 0;

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }, [patientProgress, therapyPlans, dateFilter, therapyFilter]);

  const therapyPerformance = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        sessions: number;
        completed: number;
      }
    >();

    selectedSessions.forEach((session) => {
      const key =
        session.therapyId ||
        session.therapyName ||
        "unknown";

      const name =
        session.therapyName ||
        therapies.find((therapy) => therapy.id === session.therapyId)
          ?.name ||
        therapies.find((therapy) => therapy.id === session.therapyId)
          ?.therapyName ||
        "Unknown Therapy";

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name,
          sessions: 0,
          completed: 0,
        });
      }

      const item = map.get(key)!;

      item.sessions += 1;

      if (normalizeStatus(session.status) === "COMPLETED") {
        item.completed += 1;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);
  }, [selectedSessions, therapies]);

  const therapistPerformance = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        sessions: number;
        completed: number;
      }
    >();

    selectedSessions.forEach((session) => {
      const id = session.therapistId || "unknown";

      const therapist = therapists.find(
        (item) => item.id === session.therapistId,
      );

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: getPersonName(therapist),
          sessions: 0,
          completed: 0,
        });
      }

      const item = map.get(id)!;

      item.sessions += 1;

      if (normalizeStatus(session.status) === "COMPLETED") {
        item.completed += 1;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);
  }, [selectedSessions, therapists]);

  const doctorPerformance = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        plans: number;
        completed: number;
      }
    >();

    selectedPlans.forEach((plan) => {
      const id = plan.doctorId || "unknown";

      const doctor = doctors.find(
        (item) => item.id === plan.doctorId,
      );

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: getPersonName(doctor),
          plans: 0,
          completed: 0,
        });
      }

      const item = map.get(id)!;

      item.plans += 1;

      if (normalizeStatus(plan.status) === "COMPLETED") {
        item.completed += 1;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.plans - a.plans)
      .slice(0, 6);
  }, [selectedPlans, doctors]);

  const completionRate = selectedSessions.length
    ? Math.round(
        (completedSessions.length / selectedSessions.length) * 100,
      )
    : 0;

  const filterLabel = {
    TODAY: "Today",
    THIS_WEEK: "This Week",
    THIS_MONTH: "This Month",
    LAST_3_MONTHS: "Last 3 Months",
    ALL: "All Time",
  }[dateFilter];

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
          <div className="mx-auto max-w-[1500px]">
            {/* Header */}
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C8B82]">
                  Clinic Analytics
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-[#26362E]">
                  Reports
                </h1>

                <p className="mt-2 text-sm text-[#718078]">
                  Clinic performance and treatment insights
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#718078]"
                  />

                  <select
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(e.target.value as DateFilter)
                    }
                    className="h-11 min-w-[165px] appearance-none rounded-xl border border-[#E3E0D6] bg-white pl-10 pr-9 text-sm font-medium text-[#405047] outline-none transition focus:border-[#315C46]"
                  >
                    <option value="TODAY">Today</option>
                    <option value="THIS_WEEK">This Week</option>
                    <option value="THIS_MONTH">This Month</option>
                    <option value="LAST_3_MONTHS">
                      Last 3 Months
                    </option>
                    <option value="ALL">All Time</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#718078]"
                  />

                  <select
                    value={therapyFilter}
                    onChange={(e) => setTherapyFilter(e.target.value)}
                    className="h-11 min-w-[190px] appearance-none rounded-xl border border-[#E3E0D6] bg-white pl-10 pr-9 text-sm font-medium text-[#405047] outline-none transition focus:border-[#315C46]"
                  >
                    <option value="ALL">All Therapies</option>

                    {therapies.map((therapy) => (
                      <option key={therapy.id} value={therapy.id}>
                        {therapy.name ||
                          therapy.therapyName ||
                          "Unnamed Therapy"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-[#E5E1D7] bg-white">
                <div className="flex flex-col items-center gap-3 text-[#718078]">
                  <Loader2
                    size={28}
                    className="animate-spin text-[#315C46]"
                  />
                  <p className="text-sm">Loading reports...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[#E8D4D0] bg-white p-8 text-center">
                <p className="text-sm font-medium text-[#A45B4E]">
                  {error}
                </p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    icon={<Users size={19} />}
                    label="Patients"
                    value={clinicPatients}
                    description={filterLabel}
                  />

                  <SummaryCard
                    icon={<ClipboardList size={19} />}
                    label="Active Plans"
                    value={activePlans.length}
                    description={`${completedPlans.length} completed`}
                  />

                  <SummaryCard
                    icon={<Activity size={19} />}
                    label="Sessions"
                    value={selectedSessions.length}
                    description={`${filterLabel}`}
                  />

                  <SummaryCard
                    icon={<CheckCircle2 size={19} />}
                    label="Completed"
                    value={completedSessions.length}
                    description={`${completionRate}% completion`}
                  />
                </div>

                {/* Session activity */}
                <section className="mt-6 rounded-2xl border border-[#E5E1D7] bg-white p-6 shadow-[0_5px_20px_rgba(48,64,55,0.035)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[#304139]">
                        Treatment Activity
                      </h2>

                      <p className="mt-1 text-sm text-[#849089]">
                        Session activity for {filterLabel.toLowerCase()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F3F6F1] px-4 py-2 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7C8B82]">
                        Completion Rate
                      </p>

                      <p className="mt-0.5 text-lg font-semibold text-[#315C46]">
                        {completionRate}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">
                    <ActivityItem
                      label="Total"
                      value={selectedSessions.length}
                    />

                    <ActivityItem
                      label="Completed"
                      value={completedSessions.length}
                    />

                    <ActivityItem
                      label="Scheduled"
                      value={
                        selectedSessions.filter((session) =>
                          ["SCHEDULED", "PLANNED"].includes(
                            normalizeStatus(session.status),
                          ),
                        ).length
                      }
                    />

                    <ActivityItem
                      label="Cancelled"
                      value={cancelledSessions.length}
                    />

                    <ActivityItem
                      label="No Show"
                      value={noShowSessions.length}
                    />
                  </div>
                </section>

                {/* Therapy + Clinical outcomes */}
                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.75fr]">
                  {/* Therapy Performance */}
                  <section className="rounded-2xl border border-[#E5E1D7] bg-white p-6 shadow-[0_5px_20px_rgba(48,64,55,0.035)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-[#304139]">
                          Therapy Performance
                        </h2>

                        <p className="mt-1 text-sm text-[#849089]">
                          Most active therapies in the selected period
                        </p>
                      </div>

                      <HeartPulse
                        size={20}
                        className="text-[#315C46]"
                      />
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      {therapyPerformance.length === 0 ? (
                        <EmptyState text="No therapy activity found." />
                      ) : (
                        <table className="w-full min-w-[560px]">
                          <thead>
                            <tr className="border-b border-[#ECE9E1] text-left">
                              <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A958F]">
                                Therapy
                              </th>

                              <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A958F]">
                                Sessions
                              </th>

                              <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A958F]">
                                Completed
                              </th>

                              <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A958F]">
                                Rate
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {therapyPerformance.map((therapy) => {
                              const rate = therapy.sessions
                                ? Math.round(
                                    (therapy.completed /
                                      therapy.sessions) *
                                      100,
                                  )
                                : 0;

                              return (
                                <tr
                                  key={therapy.id}
                                  className="border-b border-[#F0EEE8] last:border-0"
                                >
                                  <td className="py-4">
                                    <p className="font-medium text-[#3A4941]">
                                      {therapy.name}
                                    </p>
                                  </td>

                                  <td className="py-4 text-sm text-[#65736B]">
                                    {therapy.sessions}
                                  </td>

                                  <td className="py-4 text-sm text-[#65736B]">
                                    {therapy.completed}
                                  </td>

                                  <td className="py-4 text-right">
                                    <span className="rounded-full bg-[#EEF4EE] px-3 py-1 text-xs font-semibold text-[#315C46]">
                                      {rate}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </section>

                  {/* Clinical Outcomes */}
                  <section className="rounded-2xl border border-[#E5E1D7] bg-white p-6 shadow-[0_5px_20px_rgba(48,64,55,0.035)]">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-[#304139]">
                          Clinical Outcomes
                        </h2>

                        <p className="mt-1 text-sm text-[#849089]">
                          Based on recorded assessments
                        </p>
                      </div>

                      <TrendingUp
                        size={20}
                        className="text-[#315C46]"
                      />
                    </div>

                    <div className="mt-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8A958F]">
                        Average Improvement
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-5xl font-semibold tracking-tight text-[#315C46]">
                          {averageImprovement}%
                        </span>

                        <span className="pb-2 text-sm text-[#829087]">
                          clinical improvement
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <OutcomeBox
                        label="Assessments"
                        value={
                          patientProgress.filter((progress) =>
                            isWithinSelectedRange(
                              progress.assessmentDate,
                              dateFilter,
                            ),
                          ).length
                        }
                      />

                      <OutcomeBox
                        label="Patients Assessed"
                        value={
                          new Set(
                            patientProgress
                              .filter((progress) =>
                                isWithinSelectedRange(
                                  progress.assessmentDate,
                                  dateFilter,
                                ),
                              )
                              .map((progress) => progress.patientId)
                              .filter(Boolean),
                          ).size
                        }
                      />
                    </div>
                  </section>
                </div>

                {/* Staff performance */}
                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <PerformanceSection
                    title="Therapist Performance"
                    subtitle="Treatment sessions handled by therapists"
                    icon={<Stethoscope size={19} />}
                    emptyText="No therapist activity found."
                    rows={therapistPerformance}
                    type="therapist"
                  />

                  <PerformanceSection
                    title="Doctor Activity"
                    subtitle="Therapy plans created and completed"
                    icon={<ClipboardList size={19} />}
                    emptyText="No doctor activity found."
                    rows={doctorPerformance}
                    type="doctor"
                  />
                </div>

                {/* Footer note */}
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E5E1D7] bg-[#FBFAF6] px-5 py-4">
                  <Activity
                    size={17}
                    className="mt-0.5 shrink-0 text-[#315C46]"
                  />

                  <p className="text-xs leading-5 text-[#758178]">
                    Reports are read-only analytics generated from therapy
                    plans, therapy sessions, and clinical assessments. Treatment
                    completion and clinical improvement are tracked separately.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI Components                                                        */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E1D7] bg-white p-5 shadow-[0_5px_20px_rgba(48,64,55,0.035)]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4EE] text-[#315C46]">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A958F]">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-[#2F3E36]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#89938E]">
        {description}
      </p>
    </div>
  );
}

function ActivityItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#ECE9E1] bg-[#FBFAF7] px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A958F]">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-[#3B4B43]">
        {value}
      </p>
    </div>
  );
}

function OutcomeBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-[#F7F6F0] px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A958F]">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-[#3B4B43]">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DDD9CE] px-5 py-10 text-center">
      <p className="text-sm text-[#89938E]">{text}</p>
    </div>
  );
}

function PerformanceSection({
  title,
  subtitle,
  icon,
  emptyText,
  rows,
  type,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  emptyText: string;
  rows: Array<{
    id: string;
    name: string;
    sessions?: number;
    completed?: number;
    plans?: number;
  }>;
  type: "therapist" | "doctor";
}) {
  return (
    <section className="rounded-2xl border border-[#E5E1D7] bg-white p-6 shadow-[0_5px_20px_rgba(48,64,55,0.035)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#304139]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#849089]">
            {subtitle}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4EE] text-[#315C46]">
          {icon}
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState text={emptyText} />
        ) : (
          <div className="space-y-2">
            {rows.map((row) => {
              const total =
                type === "doctor"
                  ? row.plans ?? 0
                  : row.sessions ?? 0;

              const completed = row.completed ?? 0;

              const rate = total
                ? Math.round((completed / total) * 100)
                : 0;

              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-xl border border-[#F0EEE8] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#405047]">
                      {row.name}
                    </p>

                    <p className="mt-0.5 text-xs text-[#8A958F]">
                      {total} {type === "doctor" ? "plans" : "sessions"} ·{" "}
                      {completed} completed
                    </p>
                  </div>

                  <span
                    className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      rate === 100 ? "COMPLETED" : "IN_PROGRESS",
                    )}`}
                  >
                    {rate}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}