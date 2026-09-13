import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Loader2,
  MapPin,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";

import apiClient from "../../services/api/client";
import {
  getMyTherapistProfile,
  getSessionsByTherapist,
  updateTherapySession,
} from "../../services/therapist/therapistService";

import type {
  TherapySession,
  TherapySessionStatus,
} from "../../services/therapist/therapistService";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AssignedPatient {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  medicalHistory: string | null;
}

const STATUS_OPTIONS: TherapySessionStatus[] = [
  "PLANNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "SKIPPED",
];

function formatStatus(status: TherapySessionStatus) {
  switch (status) {
    case "PLANNED":
      return "Planned";
    case "SCHEDULED":
      return "Scheduled";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "SKIPPED":
      return "Skipped";
    default:
      return status;
  }
}

function formatTime(time: string | null) {
  if (!time) {
    return "Time not set";
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusClasses(status: TherapySessionStatus) {
  switch (status) {
    case "PLANNED":
      return "border-[#E8E2D4] bg-[#F7F4EC] text-[#8A6A32]";

    case "SCHEDULED":
      return "border-[#DCE9DF] bg-[#EEF5EF] text-[#356B4B]";

    case "IN_PROGRESS":
      return "border-[#DCE8EE] bg-[#EEF5F8] text-[#315D73]";

    case "COMPLETED":
      return "border-[#D7E9DC] bg-[#EAF5ED] text-[#2F7048]";

    case "CANCELLED":
      return "border-[#EBD8D8] bg-[#FAEEEE] text-[#9A4545]";

    case "SKIPPED":
      return "border-[#E3E0E0] bg-[#F3F1F1] text-[#6F6B6B]";

    default:
      return "border-[#E5E5E5] bg-white text-[#4B5563]";
  }
}

function getStatusIcon(status: TherapySessionStatus) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 size={15} />;

    case "CANCELLED":
      return <XCircle size={15} />;

    case "IN_PROGRESS":
      return <HeartPulse size={15} />;

    default:
      return <Clock3 size={15} />;
  }
}

function TherapistSessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [roomNumbers, setRoomNumbers] = useState<Record<string, string>>({});

  const [therapistName, setTherapistName] = useState(
    localStorage.getItem("userFullName") || "Therapist"
  );

  const [loading, setLoading] = useState(true);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  const today = getTodayString();

  const patientMap = useMemo(() => {
    const map = new Map<string, AssignedPatient>();

    patients.forEach((patient) => {
      map.set(patient.id, patient);
    });

    return map;
  }, [patients]);

  const todaysSessions = useMemo(() => {
    return sessions
      .filter((session) => session.sessionDate === today)
      .sort((a, b) => {
        const timeA = a.startTime || "99:99:99";
        const timeB = b.startTime || "99:99:99";

        return timeA.localeCompare(timeB);
      });
  }, [sessions, today]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const therapist = await getMyTherapistProfile();

      setTherapistName(therapist.fullName);

      const therapistSessions = await getSessionsByTherapist(therapist.id);

      setSessions(therapistSessions);

      /*
       * Sessions only contain roomId.
       * Fetch the actual room number for each unique room.
       */
      const roomIds = [
        ...new Set(
          therapistSessions
            .map((session) => session.roomId)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      if (roomIds.length > 0) {
        try {
          const roomResponses = await Promise.all(
            roomIds.map(async (roomId) => {
              const response = await apiClient.get<
                ApiResponse<{
                  id: string;
                  roomNumber: string;
                }>
              >(`/rooms/${roomId}`);

              return response.data.data;
            })
          );

          const roomNumberMap: Record<string, string> = {};

          roomResponses.forEach((room) => {
            if (room?.id && room.roomNumber) {
              roomNumberMap[room.id] = room.roomNumber;
            }
          });

          setRoomNumbers(roomNumberMap);
        } catch (err) {
          console.error("Failed to load room details:", err);
          setRoomNumbers({});
        }
      } else {
        setRoomNumbers({});
      }

      /*
       * Therapist-scoped patient endpoint.
       *
       * This does NOT request all patients.
       * It only returns patients assigned to the logged-in therapist.
       */
      try {
        const patientResponse = await apiClient.get<
          ApiResponse<AssignedPatient[]>
        >("/therapists/me/patients");

        setPatients(patientResponse.data.data);
      } catch {
        /*
         * Patient names are supplementary.
         * Sessions themselves should still load if this request fails.
         */
        setPatients([]);
      }
    } catch (err) {
      console.error("Failed to load therapist sessions:", err);
      setError("Unable to load your therapy sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (
    session: TherapySession,
    newStatus: TherapySessionStatus
  ) => {
    if (session.status === newStatus) {
      return;
    }

    setUpdatingSessionId(session.id);
    setError("");

    try {
      const updatedSession = await updateTherapySession(session.id, {
        therapyPlanId: session.therapyPlanId,
        patientId: session.patientId,
        therapistId: session.therapistId || undefined,
        roomId: session.roomId || undefined,
        therapyId: session.therapyId,
        therapyName: session.therapyName,
        dayNumber: session.dayNumber,
        sequenceOrder: session.sequenceOrder,
        sessionDate: session.sessionDate,
        startTime: session.startTime || undefined,
        endTime: session.endTime || undefined,
        plannedDurationMinutes: session.plannedDurationMinutes,
        actualDurationMinutes:
          session.actualDurationMinutes === null
            ? undefined
            : session.actualDurationMinutes,
        status: newStatus,
        notes: session.notes || undefined,
      });

      setSessions((currentSessions) =>
        currentSessions.map((currentSession) =>
          currentSession.id === session.id
            ? updatedSession
            : currentSession
        )
      );
    } catch (err) {
      console.error("Failed to update session status:", err);
      setError("Unable to update the session status.");
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const completedCount = todaysSessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const inProgressCount = todaysSessions.filter(
    (session) => session.status === "IN_PROGRESS"
  ).length;

  const scheduledCount = todaysSessions.filter(
    (session) =>
      session.status === "PLANNED" || session.status === "SCHEDULED"
  ).length;

  const dateLabel = new Date(`${today}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="min-h-full bg-[#F7F6F0] px-6 py-7 lg:px-9">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#9A7337]">
              Therapy Care
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#173F31]">
              Today's Sessions
            </h1>

            <p className="mt-2 text-sm text-[#72796F]">
              Manage and update your therapy sessions for today.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-sm font-medium text-[#294F3E] shadow-sm transition hover:bg-[#FAFAF6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            {/* Refresh */}
          </button>
        </div>

        {/* =====================================================
            DATE CARD
            ===================================================== */}

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#E2E1D7] bg-white px-5 py-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF4EA] text-[#3E7055]">
            <CalendarDays size={21} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8E85]">
              Today
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#244A3A]">
              {dateLabel}
            </p>
          </div>

          <div className="ml-auto hidden text-right sm:block">
            <p className="text-xs text-[#8A8E85]">
              Therapist
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#244A3A]">
              {therapistName}
            </p>
          </div>
        </div>

        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-[#E8CFCF] bg-[#FFF5F5] px-4 py-3 text-sm text-[#934848]">
            {error}
          </div>
        )}

        {/* =====================================================
            SUMMARY
            ===================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  Today's Sessions
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {todaysSessions.length}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Sessions assigned today
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF4EA] text-[#3E7055]">
                <CalendarDays size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  Scheduled
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {scheduledCount}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Planned or scheduled
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F0E5] text-[#947139]">
                <Clock3 size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {inProgressCount}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Sessions currently active
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5F8] text-[#315D73]">
                <HeartPulse size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {completedCount}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Completed today
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5ED] text-[#2F7048]">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SESSION LIST
            ===================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#173F31]">
              Today's Schedule
            </h2>

            <p className="mt-1 text-sm text-[#777D74]">
              View and update the status of each therapy session.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#E2E1D7] bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm text-[#6F776F]">
                <Loader2 size={20} className="animate-spin" />
                Loading today's sessions...
              </div>
            </div>
          ) : todaysSessions.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E1D7] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF4EA] text-[#47745A]">
                <CalendarDays size={24} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#244A3A]">
                No sessions today
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#7B8179]">
                You don't have any therapy sessions assigned for today.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysSessions.map((session) => {
                const patient = patientMap.get(session.patientId);

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    {/* TOP ROW */}
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EDF4EA] text-[#3E7055]">
                          <HeartPulse size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-[#173F31]">
                            {session.therapyName}
                          </h3>

                          <p className="mt-1 text-sm text-[#777D74]">
                            Day {session.dayNumber} · Session{" "}
                            {session.sequenceOrder}
                          </p>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="flex flex-col items-start gap-2 xl:items-end">
                        <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8E85]">
                          Session Status
                        </label>

                        <div className="relative">
                          <select
                            value={session.status}
                            disabled={updatingSessionId === session.id}
                            onChange={(event) =>
                              handleStatusChange(
                                session,
                                event.target.value as TherapySessionStatus
                              )
                            }
                            className={`appearance-none rounded-full border py-2 pl-4 pr-10 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#B9CDBD] disabled:cursor-wait disabled:opacity-60 ${getStatusClasses(
                              session.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>

                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            {updatingSessionId === session.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              getStatusIcon(session.status)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#ECEBE4] pt-5 md:grid-cols-2 xl:grid-cols-4">

                      <div className="flex items-center gap-3">
                        <CalendarDays
                          size={17}
                          className="shrink-0 text-[#96743D]"
                        />

                        <div>
                          <p className="text-xs text-[#8B9088]">
                            Date
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-[#294F3E]">
                            {formatDate(session.sessionDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock3
                          size={17}
                          className="shrink-0 text-[#96743D]"
                        />

                        <div>
                          <p className="text-xs text-[#8B9088]">
                            Time
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-[#294F3E]">
                            {formatTime(session.startTime)}{" "}
                            {session.endTime
                              ? `– ${formatTime(session.endTime)}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <UserRound
                          size={17}
                          className="shrink-0 text-[#96743D]"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-[#8B9088]">
                            Patient
                          </p>

                          <p className="mt-0.5 truncate text-sm font-medium text-[#294F3E]">
                            {patient?.fullName || "Patient"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin
                          size={17}
                          className="shrink-0 text-[#96743D]"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-[#8B9088]">
                            Room
                          </p>

                          <p className="mt-0.5 truncate text-sm font-medium text-[#294F3E]">
                            {session.roomId
                              ? roomNumbers[session.roomId] || "Room assigned"
                              : "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-5 flex flex-col gap-2 border-t border-[#ECEBE4] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-[#858B83]">
                        Planned duration:{" "}
                        <span className="font-medium text-[#5C655D]">
                          {session.plannedDurationMinutes} minutes
                        </span>
                      </p>

                      {session.notes && (
                        <p className="max-w-xl text-right text-xs text-[#858B83]">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default TherapistSessionsPage;