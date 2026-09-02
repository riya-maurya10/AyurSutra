import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import apiClient from "../../services/api/client";
import {
  getAllPatients,
  getAllRooms,
  getAllTherapists,
  type PatientResponse,
  type RoomResponse,
  type TherapistResponse,
} from "../../services/doctor/doctorService";

interface TherapyPlan {
  id: string;
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis: string | null;
  startDate: string;
  endDate: string;
  status: string;
  therapies: {
    day: number;
    therapyId: string;
    therapyName: string;
    durationMinutes: number;
    sequenceOrder: number;
  }[];
}

interface TherapySession {
  id: string;
  therapyPlanId: string;
  patientId: string;
  therapistId: string | null;
  roomId: string | null;
  therapyId: string;
  therapyName: string;
  dayNumber: number;
  sequenceOrder: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  status: string;
  notes: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

type StatusFilter =
  | "ALL"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

function DoctorTherapySessionsPage() {
  const [sessions, setSessions] = useState<
    TherapySession[]
  >([]);

  const [patients, setPatients] = useState<
    PatientResponse[]
  >([]);

  const [therapists, setTherapists] = useState<
    TherapistResponse[]
  >([]);

  const [rooms, setRooms] = useState<
    RoomResponse[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Load:
         *
         * 1. Doctor's therapy plans
         * 2. Patients
         * 3. Therapists
         * 4. Rooms
         *
         * in parallel.
         */
        const [
          plansResponse,
          patientsResponse,
          therapistsResponse,
          roomsResponse,
        ] = await Promise.all([
          apiClient.get<
            ApiResponse<TherapyPlan[]>
          >("/therapy-plans/doctor/my"),

          getAllPatients(),

          getAllTherapists(),

          getAllRooms(),
        ]);

        const doctorPlans =
          plansResponse.data.data ?? [];

        setPatients(
          patientsResponse ?? []
        );

        setTherapists(
          therapistsResponse ?? []
        );

        setRooms(roomsResponse ?? []);

        /*
         * Get sessions for every therapy plan.
         */
        const sessionResponses =
          await Promise.all(
            doctorPlans.map(async (plan) => {
              try {
                const response =
                  await apiClient.get<
                    ApiResponse<TherapySession[]>
                  >(
                    `/therapy-sessions/plan/${plan.id}`
                  );

                return (
                  response.data.data ?? []
                );
              } catch (sessionError) {
                console.error(
                  `Failed to load sessions for plan ${plan.id}:`,
                  sessionError
                );

                return [];
              }
            })
          );

        const allSessions =
          sessionResponses.flat();

        /*
         * Sort by date → time → sequence.
         */
        allSessions.sort((a, b) => {
          const dateA =
            `${a.sessionDate ?? ""} ${
              a.startTime ?? ""
            }`;

          const dateB =
            `${b.sessionDate ?? ""} ${
              b.startTime ?? ""
            }`;

          if (dateA !== dateB) {
            return dateA.localeCompare(
              dateB
            );
          }

          return (
            (a.sequenceOrder ?? 0) -
            (b.sequenceOrder ?? 0)
          );
        });

        setSessions(allSessions);
      } catch (err) {
        console.error(
          "Failed to load doctor therapy sessions:",
          err
        );

        setError(
          "Unable to load therapy sessions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  /*
   * ============================================================
   * PATIENT LOOKUP
   * ============================================================
   */
  const getPatient = (
    patientId: string
  ) => {
    return patients.find(
      (patient) =>
        patient.id === patientId
    );
  };

  /*
   * ============================================================
   * THERAPIST LOOKUP
   * ============================================================
   */
  const getTherapist = (
    therapistId: string | null
  ) => {
    if (!therapistId) {
      return undefined;
    }

    return therapists.find(
      (therapist) =>
        therapist.id === therapistId
    );
  };

  /*
   * ============================================================
   * ROOM LOOKUP
   * ============================================================
   */
  const getRoom = (
    roomId: string | null
  ) => {
    if (!roomId) {
      return undefined;
    }

    return rooms.find(
      (room) => room.id === roomId
    );
  };

  /*
   * ============================================================
   * SUMMARY COUNTS
   *
   * IMPORTANT:
   *
   * PLANNED session status is displayed as
   * "Scheduled" in the doctor UI.
   * ============================================================
   */
  const totalSessions = sessions.length;

  const scheduledSessions =
    sessions.filter((session) => {
      const status =
        session.status?.toUpperCase();

      return (
        status === "PLANNED" ||
        status === "SCHEDULED"
      );
    }).length;

  const inProgressSessions =
    sessions.filter(
      (session) =>
        session.status?.toUpperCase() ===
        "IN_PROGRESS"
    ).length;

  const completedSessions =
    sessions.filter(
      (session) =>
        session.status?.toUpperCase() ===
        "COMPLETED"
    ).length;

  /*
   * ============================================================
   * FILTERED SESSIONS
   * ============================================================
   */
  const filteredSessions = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return sessions.filter((session) => {
      const patient = getPatient(
        session.patientId
      );

      const therapist = getTherapist(
        session.therapistId
      );

      const room = getRoom(
        session.roomId
      );

      const patientName =
        patient?.fullName?.toLowerCase() ??
        "";

      const therapyName =
        session.therapyName?.toLowerCase() ??
        "";

      const therapistName =
        therapist?.fullName?.toLowerCase() ??
        "";

      const roomNumber =
        room?.roomNumber?.toLowerCase() ??
        "";

      const roomName =
        room?.name?.toLowerCase() ?? "";

      const status =
        session.status?.toLowerCase() ??
        "";

      const notes =
        session.notes?.toLowerCase() ??
        "";

      const matchesSearch =
        search === "" ||
        patientName.includes(search) ||
        therapyName.includes(search) ||
        therapistName.includes(search) ||
        roomNumber.includes(search) ||
        roomName.includes(search) ||
        status.includes(search) ||
        notes.includes(search);

      const normalizedStatus =
        session.status?.toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SCHEDULED" &&
          (normalizedStatus ===
            "PLANNED" ||
            normalizedStatus ===
              "SCHEDULED")) ||
        normalizedStatus === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    sessions,
    patients,
    therapists,
    rooms,
    searchTerm,
    statusFilter,
  ]);

  /*
   * ============================================================
   * GROUP BY DATE
   * ============================================================
   */
  const groupedSessions = useMemo(() => {
    const groups: Record<
      string,
      TherapySession[]
    > = {};

    filteredSessions.forEach(
      (session) => {
        const date =
          session.sessionDate ||
          "UNKNOWN";

        if (!groups[date]) {
          groups[date] = [];
        }

        groups[date].push(session);
      }
    );

    return Object.entries(groups).sort(
      ([dateA], [dateB]) =>
        dateA.localeCompare(dateB)
    );
  }, [filteredSessions]);

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */
  const formatDate = (date: string) => {
    if (!date || date === "UNKNOWN") {
      return "Unknown date";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */
  const formatTime = (time: string) => {
    if (!time) {
      return "—";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  /*
   * ============================================================
   * UI STATUS
   * ============================================================
   */
  const getDisplayStatus = (
    status: string
  ) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
      case "SCHEDULED":
        return "Scheduled";

      case "IN_PROGRESS":
        return "In Progress";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return "Unknown";
    }
  };

  /*
   * ============================================================
   * STATUS CLASSES
   * ============================================================
   */
  const getStatusClasses = (
    status: string
  ) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
      case "SCHEDULED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "IN_PROGRESS":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

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
  const getStatusDot = (
    status: string
  ) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
      case "SCHEDULED":
        return "bg-blue-500";

      case "IN_PROGRESS":
        return "bg-amber-500";

      case "COMPLETED":
        return "bg-emerald-500";

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
            Loading therapy sessions...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Fetching your scheduled treatments
          </p>
        </div>
      </div>
    );
  }

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
          SUMMARY
      ========================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Sessions
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {totalSessions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                All therapy sessions
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
            </div>
          </div>
        </div>

        {/* Scheduled */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Scheduled
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {scheduledSessions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Upcoming treatment
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Clock3 className="h-5 w-5 text-blue-600" />
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
                {inProgressSessions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Currently underway
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
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
                {completedSessions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Finished treatments
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH + FILTERS
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
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search patient, therapy, therapist or room..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setStatusFilter("ALL")
              }
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "ALL"
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter("SCHEDULED")
              }
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "SCHEDULED"
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Scheduled
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "IN_PROGRESS"
                )
              }
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "IN_PROGRESS"
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              In Progress
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter("COMPLETED")
              }
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                statusFilter === "COMPLETED"
                  ? "border-emerald-700 bg-emerald-700 text-white"
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
              {filteredSessions.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {sessions.length}
            </span>{" "}
            sessions
          </p>

          {(searchTerm ||
            statusFilter !== "ALL") && (
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
          EMPTY
      ========================================================= */}

      {!error &&
        filteredSessions.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <CalendarDays className="h-6 w-6 text-gray-400" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              {searchTerm ||
              statusFilter !== "ALL"
                ? "No matching sessions"
                : "No therapy sessions yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {searchTerm ||
              statusFilter !== "ALL"
                ? "Try a different search term or clear the filters to view all sessions."
                : "Scheduled therapy sessions will appear here once treatments are scheduled for your patients."}
            </p>

            {(searchTerm ||
              statusFilter !== "ALL") && (
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
          SESSION LIST
      ========================================================= */}

      {!error &&
        groupedSessions.length > 0 && (
          <div className="space-y-6">
            {groupedSessions.map(
              ([date, dateSessions]) => (
                <section key={date}>
                  {/* Date heading */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <CalendarDays className="h-4 w-4 text-emerald-700" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        {formatDate(date)}
                      </h2>

                      <p className="text-xs text-gray-400">
                        {dateSessions.length}{" "}
                        {dateSessions.length ===
                        1
                          ? "session"
                          : "sessions"}
                      </p>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-3">
                    {dateSessions.map(
                      (session) => {
                        const patient =
                          getPatient(
                            session.patientId
                          );

                        const therapist =
                          getTherapist(
                            session.therapistId
                          );

                        const room =
                          getRoom(
                            session.roomId
                          );

                        return (
                          <div
                            key={session.id}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-100 hover:shadow-md"
                          >
                            {/* ==================================================
                                SESSION HEADER
                            =================================================== */}

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {
                                      session.therapyName
                                    }
                                  </h3>

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                      session.status
                                    )}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                        session.status
                                      )}`}
                                    />

                                    {getDisplayStatus(
                                      session.status
                                    )}
                                  </span>
                                </div>

                                {/* Patient */}
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                  <UserRound className="h-4 w-4 text-gray-400" />

                                  <span className="font-medium text-gray-800">
                                    {patient?.fullName ??
                                      "Unknown Patient"}
                                  </span>
                                </div>
                              </div>

                              {/* Time */}
                              <div className="flex shrink-0 items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                                <Clock3 className="h-5 w-5 text-emerald-700" />

                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatTime(
                                      session.startTime
                                    )}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    to{" "}
                                    {formatTime(
                                      session.endTime
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="my-5 h-px bg-gray-100" />

                            {/* ==================================================
                                SESSION DETAILS
                            =================================================== */}

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {/* Treatment Day */}
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                  Treatment Day
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-800">
                                  Day{" "}
                                  {
                                    session.dayNumber
                                  }
                                </p>
                              </div>

                              {/* Duration */}
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                  Duration
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-800">
                                  {
                                    session.plannedDurationMinutes
                                  }{" "}
                                  minutes
                                </p>
                              </div>

                              {/* Therapist */}
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <div className="flex items-center gap-2">
                                  <UsersRound className="h-4 w-4 text-gray-400" />

                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Therapist
                                  </p>
                                </div>

                                <p className="mt-1 truncate text-sm font-medium text-gray-800">
                                  {therapist?.fullName ??
                                    "Not assigned"}
                                </p>

                                {therapist?.therapistType && (
                                  <p className="mt-0.5 truncate text-xs text-gray-400">
                                    {
                                      therapist.therapistType
                                    }
                                  </p>
                                )}
                              </div>

                              {/* Room */}
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <div className="flex items-center gap-2">
                                  <DoorOpen className="h-4 w-4 text-gray-400" />

                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Room
                                  </p>
                                </div>

                                <p className="mt-1 truncate text-sm font-medium text-gray-800">
                                  {room?.roomNumber ??
                                    "Not assigned"}
                                </p>

                                {room?.name && (
                                  <p className="mt-0.5 truncate text-xs text-gray-400">
                                    {room.name}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* ==================================================
                                NOTES
                            =================================================== */}

                            {session.notes && (
                              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                  Session Notes
                                </p>

                                <p className="mt-1 text-sm leading-6 text-gray-700">
                                  {
                                    session.notes
                                  }
                                </p>
                              </div>
                            )}

                            {/* ==================================================
                                FOOTER
                            =================================================== */}

                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                              <p className="text-xs text-gray-400">
                                Sequence{" "}
                                {
                                  session.sequenceOrder
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                Session ID:{" "}
                                {session.id.slice(
                                  -8
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        )}
    </div>
  );
}

export default DoctorTherapySessionsPage;