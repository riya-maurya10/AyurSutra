import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import apiClient from "../../services/api/client";

import {
  getMyTherapistProfile,
  getSessionsByTherapist,
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

/*
 * Room details returned by:
 * GET /api/rooms/{roomId}
 */
interface RoomSummary {
  id: string;
  roomNumber: string;
}

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
    case "COMPLETED":
      return "border-[#D7E9DC] bg-[#EAF5ED] text-[#2F7048]";

    case "CANCELLED":
      return "border-[#EBD8D8] bg-[#FAEEEE] text-[#9A4545]";

    case "SKIPPED":
      return "border-[#E3E0E0] bg-[#F3F1F1] text-[#6F6B6B]";

    case "IN_PROGRESS":
      return "border-[#DCE8EE] bg-[#EEF5F8] text-[#315D73]";

    case "SCHEDULED":
      return "border-[#DCE9DF] bg-[#EEF5EF] text-[#356B4B]";

    case "PLANNED":
      return "border-[#E8E2D4] bg-[#F7F4EC] text-[#8A6A32]";

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

function TherapistSessionHistoryPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);

  const [patients, setPatients] = useState<AssignedPatient[]>([]);

  /*
   * Room details:
   *
   * roomId -> roomNumber
   */
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  const [therapistName, setTherapistName] = useState(
    localStorage.getItem("userFullName") || "Therapist"
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const today = getTodayString();

  /*
   * ============================================================
   * PATIENT MAP
   * ============================================================
   */

  const patientMap = useMemo(() => {
    const map = new Map<string, AssignedPatient>();

    patients.forEach((patient) => {
      map.set(patient.id, patient);
    });

    return map;
  }, [patients]);

  /*
   * ============================================================
   * ROOM MAP
   * ============================================================
   *
   * Converts:
   *
   * roomId -> Room object
   *
   * Example:
   *
   * "6a7..." -> {
   *   id: "6a7...",
   *   roomNumber: "Room 101"
   * }
   */

  const roomMap = useMemo(() => {
    const map = new Map<string, RoomSummary>();

    rooms.forEach((room) => {
      map.set(room.id, room);
    });

    return map;
  }, [rooms]);

  /*
   * ============================================================
   * HISTORY SESSIONS
   * ============================================================
   *
   * History contains:
   *
   * 1. Sessions whose date has already passed
   * 2. Completed sessions
   * 3. Cancelled sessions
   * 4. Skipped sessions
   */

  const historySessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const isPastDate = session.sessionDate < today;

        const isClosedStatus =
          session.status === "COMPLETED" ||
          session.status === "CANCELLED" ||
          session.status === "SKIPPED";

        return isPastDate || isClosedStatus;
      })
      .sort((a, b) => {
        const dateCompare = b.sessionDate.localeCompare(a.sessionDate);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        const timeA = a.startTime || "00:00:00";

        const timeB = b.startTime || "00:00:00";

        return timeB.localeCompare(timeA);
      });
  }, [sessions, today]);

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredSessions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return historySessions;
    }

    return historySessions.filter((session) => {
      const patient = patientMap.get(session.patientId);

      return (
        session.therapyName.toLowerCase().includes(query) ||
        formatStatus(session.status).toLowerCase().includes(query) ||
        patient?.fullName?.toLowerCase().includes(query) ||
        patient?.email?.toLowerCase().includes(query) ||
        patient?.phone?.toLowerCase().includes(query)
      );
    });
  }, [historySessions, patientMap, searchTerm]);

  /*
   * ============================================================
   * COUNTS
   * ============================================================
   */

  const completedCount = useMemo(() => {
    return historySessions.filter(
      (session) => session.status === "COMPLETED"
    ).length;
  }, [historySessions]);

  const cancelledCount = useMemo(() => {
    return historySessions.filter(
      (session) => session.status === "CANCELLED"
    ).length;
  }, [historySessions]);

  const skippedCount = useMemo(() => {
    return historySessions.filter(
      (session) => session.status === "SKIPPED"
    ).length;
  }, [historySessions]);

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * 1. Get logged-in therapist
       */
      const therapist = await getMyTherapistProfile();

      setTherapistName(therapist.fullName);

      /*
       * 2. Get this therapist's sessions
       */
      const therapistSessions =
        await getSessionsByTherapist(therapist.id);

      setSessions(therapistSessions);

      /*
       * ========================================================
       * 3. Get patient details
       * ========================================================
       *
       * This is supplementary.
       *
       * If the therapist-scoped patient endpoint is unavailable,
       * the session history itself will still work.
       */

      try {
        const patientResponse = await apiClient.get<
          ApiResponse<AssignedPatient[]>
        >("/therapists/me/patients");

        setPatients(patientResponse.data.data);
      } catch (patientError) {
        console.error(
          "Failed to load assigned patients:",
          patientError
        );

        setPatients([]);
      }

      /*
       * ========================================================
       * 4. GET ROOM DETAILS
       * ========================================================
       *
       * Sessions only contain:
       *
       * roomId
       *
       * We need the Room document to get:
       *
       * roomNumber
       *
       * So we:
       *
       * session
       *    ↓
       * roomId
       *    ↓
       * GET /rooms/{roomId}
       *    ↓
       * roomNumber
       */

      const roomIds = Array.from(
        new Set(
          therapistSessions
            .map((session) => session.roomId)
            .filter(
              (roomId): roomId is string =>
                Boolean(roomId)
            )
        )
      );

      /*
       * Fetch every unique room only once.
       */
      const roomResponses = await Promise.all(
        roomIds.map(async (roomId) => {
          try {
            const response = await apiClient.get<
              ApiResponse<RoomSummary>
            >(`/rooms/${roomId}`);

            return response.data.data;
          } catch (roomError) {
            console.error(
              `Failed to load room ${roomId}:`,
              roomError
            );

            return null;
          }
        })
      );

      /*
       * Remove failed room requests.
       */
      setRooms(
        roomResponses.filter(
          (room): room is RoomSummary =>
            room !== null
        )
      );
    } catch (err) {
      console.error(
        "Failed to load therapist session history:",
        err
      );

      setError(
        "Unable to load your session history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    loadData();
  }, [loadData]);

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
              Session History
            </h1>

            <p className="mt-2 text-sm text-[#72796F]">
              Review your completed and past therapy sessions.
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
            HISTORY / THERAPIST CARD
            ===================================================== */}

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#E2E1D7] bg-white px-5 py-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF4EA] text-[#3E7055]">
            <CalendarDays size={21} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8E85]">
              History
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#244A3A]">
              Previous therapy sessions
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

          {/* TOTAL */}

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  Total History
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {historySessions.length}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Previous sessions
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF4EA] text-[#3E7055]">
                <CalendarDays size={20} />
              </div>
            </div>
          </div>

          {/* COMPLETED */}

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
                  Successfully completed
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5ED] text-[#2F7048]">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* CANCELLED */}

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  Cancelled
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {cancelledCount}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Cancelled sessions
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAEEEE] text-[#9A4545]">
                <XCircle size={20} />
              </div>
            </div>
          </div>

          {/* SKIPPED */}

          <div className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#777D74]">
                  Skipped
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F31]">
                  {skippedCount}
                </p>

                <p className="mt-1 text-xs text-[#92968E]">
                  Skipped sessions
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F1F1] text-[#6F6B6B]">
                <Clock3 size={20} />
              </div>
            </div>
          </div>

        </div>

        {/* =====================================================
            SEARCH
            ===================================================== */}

        <div className="mb-7 rounded-2xl border border-[#E2E1D7] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9189]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by patient, therapy, email, phone or status..."
              className="w-full rounded-xl border border-[#DDDCCF] bg-[#FCFCF9] py-3 pl-11 pr-4 text-sm text-[#294F3E] outline-none transition placeholder:text-[#A0A59E] focus:border-[#B8CDBB] focus:ring-2 focus:ring-[#E5EEE6]"
            />
          </div>
        </div>

        {/* =====================================================
            SESSION HISTORY
            ===================================================== */}

        <section>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#173F31]">
              Previous Sessions
            </h2>

            <p className="mt-1 text-sm text-[#777D74]">
              Completed, cancelled and skipped therapy sessions.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#E2E1D7] bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm text-[#6F776F]">
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Loading session history...
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E1D7] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF4EA] text-[#47745A]">
                <CalendarDays size={24} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#244A3A]">
                No session history found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#7B8179]">
                {searchTerm
                  ? "No previous sessions match your search."
                  : "You don't have any previous therapy sessions yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {filteredSessions.map((session) => {
                const patient = patientMap.get(
                  session.patientId
                );

                const room = session.roomId
                  ? roomMap.get(session.roomId)
                  : undefined;

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-[#E2E1D7] bg-white p-5 shadow-sm transition hover:shadow-md"
                  >

                    {/* =================================================
                        TOP ROW
                        ================================================= */}

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
                          Status
                        </label>

                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${getStatusClasses(
                            session.status
                          )}`}
                        >
                          {getStatusIcon(session.status)}

                          {formatStatus(session.status)}
                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        DETAILS
                        ================================================= */}

                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#ECEBE4] pt-5 md:grid-cols-2 xl:grid-cols-4">

                      {/* DATE */}

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
                            {formatDate(
                              session.sessionDate
                            )}
                          </p>

                        </div>

                      </div>

                      {/* TIME */}

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
                            {formatTime(
                              session.startTime
                            )}{" "}
                            {session.endTime
                              ? `– ${formatTime(
                                  session.endTime
                                )}`
                              : ""}
                          </p>

                        </div>

                      </div>

                      {/* PATIENT */}

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
                            {patient?.fullName ||
                              "Patient"}
                          </p>

                        </div>

                      </div>

                      {/* ROOM */}

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
                              ? room?.roomNumber ||
                                "Room not found"
                              : "Not assigned"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        FOOTER
                        ================================================= */}

                    <div className="mt-5 flex flex-col gap-2 border-t border-[#ECEBE4] pt-4 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-xs text-[#858B83]">

                        Planned duration:{" "}

                        <span className="font-medium text-[#5C655D]">
                          {
                            session.plannedDurationMinutes
                          }{" "}
                          minutes
                        </span>

                      </p>

                      {session.actualDurationMinutes !==
                        null && (
                        <p className="text-xs text-[#858B83]">

                          Actual duration:{" "}

                          <span className="font-medium text-[#5C655D]">
                            {
                              session.actualDurationMinutes
                            }{" "}
                            minutes
                          </span>

                        </p>
                      )}

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

export default TherapistSessionHistoryPage;