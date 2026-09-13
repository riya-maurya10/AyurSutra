import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Search,
  UserRound,
  BedDouble,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  getReceptionistSessions,
  getReceptionistPatients,
  getReceptionistTherapists,
  getReceptionistRooms,
  updateReceptionistSession,
  type TherapySession,
} from "../../services/receptionist/receptionistService";

import type {
  PatientResponse,
  TherapistResponse,
  RoomResponse,
} from "../../services/doctor/doctorService";

function ReceptionistTherapySessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [therapists, setTherapists] = useState<TherapistResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedSession, setSelectedSession] =
    useState<TherapySession | null>(null);

  const [updatingSessionId, setUpdatingSessionId] =
    useState<string | null>(null);

  const loadSessions = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        sessionsData,
        patientsData,
        therapistsData,
        roomsData,
      ] = await Promise.all([
        getReceptionistSessions(),
        getReceptionistPatients(),
        getReceptionistTherapists(),
        getReceptionistRooms(),
      ]);

      setSessions(sessionsData);
      setPatients(patientsData);
      setTherapists(therapistsData);
      setRooms(roomsData);
    } catch (err) {
      console.error(
        "Failed to load therapy sessions:",
        err
      );

      setError(
        "Unable to load therapy session information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const patientMap = useMemo(() => {
    return new Map(
      patients.map((patient) => [
        patient.id,
        patient,
      ])
    );
  }, [patients]);

  const therapistMap = useMemo(() => {
    return new Map(
      therapists.map((therapist) => [
        therapist.id,
        therapist,
      ])
    );
  }, [therapists]);

  const roomMap = useMemo(() => {
    return new Map(
      rooms.map((room) => [
        room.id,
        room,
      ])
    );
  }, [rooms]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = sessions.filter((session) => {
      const patient = patientMap.get(
        session.patientId
      );

      const therapist = session.therapistId
        ? therapistMap.get(session.therapistId)
        : undefined;

      const room = session.roomId
        ? roomMap.get(session.roomId)
        : undefined;

      const matchesSearch =
        !query ||
        session.therapyName
          .toLowerCase()
          .includes(query) ||
        patient?.fullName
          ?.toLowerCase()
          .includes(query) ||
        therapist?.fullName
          ?.toLowerCase()
          .includes(query) ||
        room?.roomNumber
          ?.toLowerCase()
          .includes(query);

      const matchesDate =
        !dateFilter ||
        session.sessionDate === dateFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        session.status === statusFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesStatus
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = `${a.sessionDate} ${
        a.startTime || "23:59:59"
      }`;

      const dateB = `${b.sessionDate} ${
        b.startTime || "23:59:59"
      }`;

      return dateA.localeCompare(dateB);
    });
  }, [
    sessions,
    patients,
    therapists,
    rooms,
    patientMap,
    therapistMap,
    roomMap,
    search,
    dateFilter,
    statusFilter,
  ]);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todaySessions = sessions.filter(
    (session) => session.sessionDate === today
  );

  const completedCount = sessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const activeCount = sessions.filter(
    (session) =>
      session.status === "PLANNED" ||
      session.status === "SCHEDULED" ||
      session.status === "IN_PROGRESS"
  ).length;

  const cancelledCount = sessions.filter(
    (session) =>
      session.status === "CANCELLED" ||
      session.status === "SKIPPED"
  ).length;

  const formatTime = (time: string | null) => {
    if (!time) {
      return "Time not set";
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getPatientName = (
    patientId: string
  ) => {
    return (
      patientMap.get(patientId)?.fullName ||
      "Unknown patient"
    );
  };

  const getTherapistName = (
    therapistId: string | null
  ) => {
    if (!therapistId) {
      return "Not assigned";
    }

    return (
      therapistMap.get(therapistId)?.fullName ||
      "Unknown therapist"
    );
  };

  const getRoomName = (
    roomId: string | null
  ) => {
    if (!roomId) {
      return "Not assigned";
    }

    const room = roomMap.get(roomId);

    if (!room) {
      return "Unknown room";
    }

    return `Room ${room.roomNumber}`;
  };

  const getStatusLabel = (
    status: TherapySession["status"]
  ) => {
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
  };

  const getStatusClass = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#E8F2E8] text-[#3F6B45]";

      case "IN_PROGRESS":
        return "bg-[#FFF1D8] text-[#9A6A20]";

      case "CANCELLED":
      case "SKIPPED":
        return "bg-[#F9E6E2] text-[#9A4F43]";

      case "SCHEDULED":
        return "bg-[#EEF1E6] text-[#53683D]";

      default:
        return "bg-[#F1EBDD] text-[#8A6A3F]";
    }
  };

  const handleStatusChange = async (
    session: TherapySession,
    newStatus: TherapySession["status"]
  ) => {
    try {
      setUpdatingSessionId(session.id);
      setError("");

      const updatedSession =
        await updateReceptionistSession(
          session.id,
          {
            therapyPlanId:
              session.therapyPlanId,

            patientId:
              session.patientId,

            therapistId:
              session.therapistId ||
              undefined,

            roomId:
              session.roomId ||
              undefined,

            therapyId:
              session.therapyId,

            therapyName:
              session.therapyName,

            dayNumber:
              session.dayNumber,

            sequenceOrder:
              session.sequenceOrder,

            sessionDate:
              session.sessionDate,

            startTime:
              session.startTime ||
              undefined,

            endTime:
              session.endTime ||
              undefined,

            plannedDurationMinutes:
              session.plannedDurationMinutes,

            actualDurationMinutes:
              session.actualDurationMinutes ??
              undefined,

            status: newStatus,

            notes:
              session.notes ||
              undefined,
          }
        );

      setSessions((current) =>
        current.map((item) =>
          item.id === session.id
            ? updatedSession
            : item
        )
      );

      setSelectedSession((current) =>
        current?.id === session.id
          ? updatedSession
          : current
      );
    } catch (err) {
      console.error(
        "Failed to update session:",
        err
      );

      setError(
        "Unable to update the session status."
      );
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDateFilter("");
    setStatusFilter("ALL");
  };

  const hasFilters =
    search.trim() !== "" ||
    dateFilter !== "" ||
    statusFilter !== "ALL";

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-5 md:p-7">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
            AyurSutra
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F3D2E]">
            Therapy Sessions
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6A6258] md:text-base">
            Monitor scheduled therapies, patient appointments,
            therapists and treatment rooms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadSessions(true)}
          disabled={loading || refreshing}
          title="Refresh"
          aria-label="Refresh"
          className="flex w-fit items-center justify-center rounded-xl border border-[#DCC8A3] bg-white p-3 text-[#1F3D2E] transition hover:bg-[#F4F0E7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-6 rounded-xl border border-[#E6C7C1] bg-[#FDF0ED] px-4 py-3 text-sm text-[#914D43]">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#E8E2D5] bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Today's Sessions
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : todaySessions.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <CalendarDays
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E2D5] bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Active Sessions
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : activeCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <Clock3
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E2D5] bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Completed
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : completedCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <CheckCircle2
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E2D5] bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Cancelled / Skipped
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : cancelledCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#F1EBDD] p-3">
              <X
                size={20}
                className="text-[#8A6A3F]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mt-5 rounded-xl border border-[#E8E2D5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8174]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search patient, therapy, therapist or room..."
              className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A39B8E] focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
            />
          </div>

          {/* DATE */}

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
          />

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="PLANNED">
              Planned
            </option>

            <option value="SCHEDULED">
              Scheduled
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="SKIPPED">
              Skipped
            </option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#DED8CB] px-4 py-3 text-sm font-medium text-[#6A6258] transition hover:bg-[#F4F0E7]"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          SESSION TABLE
      ===================================================== */}

      <div className="mt-5 overflow-hidden rounded-xl border border-[#E8E2D5] bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-[#6B7F4E]"
            />

            <p className="mt-4 text-sm text-[#7A806F]">
              Loading therapy sessions...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays
              size={30}
              className="mx-auto text-[#9AA08D]"
            />

            <h2 className="mt-4 text-base font-semibold text-[#1F3D2E]">
              No therapy sessions found
            </h2>

            <p className="mt-1 text-sm text-[#8A8174]">
              Try changing your search or filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-[#1F3D2E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-[#EEE9DE] bg-[#FCFBF8] text-left">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Therapy
                    </th>

                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Patient
                    </th>

                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Therapist
                    </th>

                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Room
                    </th>

                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Date & Time
                    </th>

                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8174]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSessions.map(
                    (session) => (
                      <tr
                        key={session.id}
                        className="border-b border-[#F0ECE3] last:border-b-0 hover:bg-[#FCFBF8]"
                      >
                        {/* THERAPY */}

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-[#1F3D2E]">
                              {session.therapyName}
                            </p>

                            <p className="mt-1 text-xs text-[#8A8174]">
                              Day{" "}
                              {
                                session.dayNumber
                              }{" "}
                              · Session{" "}
                              {
                                session.sequenceOrder
                              }
                            </p>
                          </div>
                        </td>

                        {/* PATIENT */}

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserRound
                              size={16}
                              className="text-[#6B7F4E]"
                            />

                            <span className="text-sm text-[#5F584F]">
                              {getPatientName(
                                session.patientId
                              )}
                            </span>
                          </div>
                        </td>

                        {/* THERAPIST */}

                        <td className="px-4 py-3">
                          <span className="text-sm text-[#5F584F]">
                            {getTherapistName(
                              session.therapistId
                            )}
                          </span>
                        </td>

                        {/* ROOM */}

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <BedDouble
                              size={16}
                              className="text-[#8A6A3F]"
                            />

                            <span className="text-sm text-[#5F584F]">
                              {getRoomName(
                                session.roomId
                              )}
                            </span>
                          </div>
                        </td>

                        {/* DATE / TIME */}

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#1F3D2E]">
                            {formatDate(
                              session.sessionDate
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#8A8174]">
                            {formatTime(
                              session.startTime
                            )}

                            {session.endTime
                              ? ` – ${formatTime(
                                  session.endTime
                                )}`
                              : ""}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3">
                          <select
                            value={
                              session.status
                            }
                            disabled={
                              updatingSessionId ===
                              session.id
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                session,
                                event.target
                                  .value as TherapySession["status"]
                              )
                            }
                            className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${getStatusClass(
                              session.status
                            )} disabled:opacity-60`}
                          >
                            <option value="PLANNED">
                              Planned
                            </option>

                            <option value="SCHEDULED">
                              Scheduled
                            </option>

                            <option value="IN_PROGRESS">
                              In Progress
                            </option>

                            <option value="COMPLETED">
                              Completed
                            </option>

                            <option value="CANCELLED">
                              Cancelled
                            </option>

                            <option value="SKIPPED">
                              Skipped
                            </option>
                          </select>
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSession(
                                session
                              )
                            }
                            className="inline-flex items-center rounded-lg border border-[#DCC8A3] bg-white px-3 py-1.5 text-xs font-medium text-[#53683D] transition hover:bg-[#EEF1E6] hover:text-[#1F3D2E]"
                          >
                            View details →
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}

            <div className="grid gap-3 p-3 lg:hidden">
              {filteredSessions.map(
                (session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-[#ECE7DB] bg-white p-4 shadow-sm transition hover:border-[#DCC8A3] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1F3D2E]">
                          {session.therapyName}
                        </p>

                        <p className="mt-1 text-xs text-[#8A8174]">
                          Day{" "}
                          {session.dayNumber}{" "}
                          · Session{" "}
                          {
                            session.sequenceOrder
                          }
                        </p>
                      </div>

                      <select
                        value={
                          session.status
                        }
                        disabled={
                          updatingSessionId ===
                          session.id
                        }
                        onChange={(
                          event
                        ) =>
                          handleStatusChange(
                            session,
                            event.target
                              .value as TherapySession["status"]
                          )
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${getStatusClass(
                          session.status
                        )}`}
                      >
                        <option value="PLANNED">
                          Planned
                        </option>

                        <option value="SCHEDULED">
                          Scheduled
                        </option>

                        <option value="IN_PROGRESS">
                          In Progress
                        </option>

                        <option value="COMPLETED">
                          Completed
                        </option>

                        <option value="CANCELLED">
                          Cancelled
                        </option>

                        <option value="SKIPPED">
                          Skipped
                        </option>
                      </select>
                    </div>

                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <UserRound
                          size={16}
                          className="text-[#6B7F4E]"
                        />

                        <div>
                          <p className="text-[11px] text-[#8A8174]">
                            Patient
                          </p>

                          <p className="text-sm text-[#5F584F]">
                            {getPatientName(
                              session.patientId
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <BedDouble
                          size={16}
                          className="text-[#8A6A3F]"
                        />

                        <div>
                          <p className="text-[11px] text-[#8A8174]">
                            Room
                          </p>

                          <p className="text-sm text-[#5F584F]">
                            {getRoomName(
                              session.roomId
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#EEE9DE] pt-3">
                      <div>
                        <p className="text-xs font-medium text-[#1F3D2E]">
                          {formatDate(
                            session.sessionDate
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#8A8174]">
                          {formatTime(
                            session.startTime
                          )}

                          {session.endTime
                            ? ` – ${formatTime(
                                session.endTime
                              )}`
                            : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSession(
                            session
                          )
                        }
                        className="inline-flex items-center rounded-lg border border-[#DCC8A3] bg-white px-3 py-1.5 text-xs font-medium text-[#53683D] transition hover:bg-[#EEF1E6]"
                      >
                        View details →
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() =>
            setSelectedSession(null)
          }
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between border-b border-[#EEE9DE] bg-[#FCFBF8] px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#6B7F4E]">
                  Session Details
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#1F3D2E]">
                  {
                    selectedSession.therapyName
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSession(null)
                }
                className="rounded-lg p-2 text-[#7A806F] transition hover:bg-[#F4F0E7] hover:text-[#1F3D2E]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClass(
                    selectedSession.status
                  )}`}
                >
                  {getStatusLabel(
                    selectedSession.status
                  )}
                </span>

                <span className="rounded-full bg-[#F1EBDD] px-3 py-1.5 text-xs font-medium text-[#8A6A3F]">
                  Day{" "}
                  {
                    selectedSession.dayNumber
                  }
                </span>

                <span className="rounded-full bg-[#EEF1E6] px-3 py-1.5 text-xs font-medium text-[#53683D]">
                  Session{" "}
                  {
                    selectedSession.sequenceOrder
                  }
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#EEE9DE] bg-[#FCFBF8] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Patient
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {getPatientName(
                      selectedSession.patientId
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEE9DE] bg-[#FCFBF8] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Therapist
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {getTherapistName(
                      selectedSession.therapistId
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEE9DE] bg-[#FCFBF8] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Room
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {getRoomName(
                      selectedSession.roomId
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEE9DE] bg-[#FCFBF8] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {formatDate(
                      selectedSession.sessionDate
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#EEE9DE] px-4 py-4">
                <div className="flex items-center gap-2">
                  <Clock3
                    size={17}
                    className="text-[#6B7F4E]"
                  />

                  <p className="text-sm font-medium text-[#1F3D2E]">
                    Session Timing
                  </p>
                </div>

                <p className="mt-2 text-sm text-[#6A6258]">
                  {formatTime(
                    selectedSession.startTime
                  )}

                  {selectedSession.endTime
                    ? ` – ${formatTime(
                        selectedSession.endTime
                      )}`
                    : ""}
                </p>

                <p className="mt-1 text-xs text-[#8A8174]">
                  Planned duration:{" "}
                  {
                    selectedSession.plannedDurationMinutes
                  }{" "}
                  minutes
                </p>

                {selectedSession.actualDurationMinutes !==
                  null && (
                  <p className="mt-1 text-xs text-[#8A8174]">
                    Actual duration:{" "}
                    {
                      selectedSession.actualDurationMinutes
                    }{" "}
                    minutes
                  </p>
                )}
              </div>

              {selectedSession.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8174]">
                    Notes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#5F584F]">
                    {selectedSession.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[#EEE9DE] bg-[#FCFBF8] px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedSession(null)
                }
                className="w-full rounded-xl bg-[#1F3D2E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistTherapySessionsPage;