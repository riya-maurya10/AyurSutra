import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import apiClient from "../../services/api/client";

import {
  getMyTherapistProfile,
  getSessionsByTherapist,
  updateTherapySession,
} from "../../services/therapist/therapistService";

import type {
  TherapySession,
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

interface RoomResponse {
  id: string;
  roomNumber: string;
}

function TherapistUpcomingSessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [roomNumbers, setRoomNumbers] = useState<
    Record<string, string>
  >({});

  const [therapistName, setTherapistName] = useState(
    localStorage.getItem("userFullName") || "Therapist"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingSessionId, setUpdatingSessionId] =
    useState<string | null>(null);

  // =========================================================
  // TODAY
  // =========================================================

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // Therapist
      // -------------------------------------------------------

      const therapist = await getMyTherapistProfile();

      setTherapistName(therapist.fullName);

      // -------------------------------------------------------
      // Therapist sessions
      // -------------------------------------------------------

      const therapistSessions =
        await getSessionsByTherapist(therapist.id);

      setSessions(therapistSessions ?? []);

      // -------------------------------------------------------
      // Assigned patients
      // -------------------------------------------------------

      try {
        const patientResponse = await apiClient.get<
          ApiResponse<AssignedPatient[]>
        >("/therapists/me/patients");

        setPatients(patientResponse.data.data ?? []);
      } catch (patientError) {
        console.error(
          "Failed to load assigned patients:",
          patientError
        );

        setPatients([]);
      }

      // -------------------------------------------------------
      // Room details
      // -------------------------------------------------------

      const roomIds = [
        ...new Set(
          (therapistSessions ?? [])
            .map((session) => session.roomId)
            .filter(
              (id): id is string => Boolean(id)
            )
        ),
      ];

      if (roomIds.length > 0) {
        try {
          const roomResponses = await Promise.all(
            roomIds.map(async (roomId) => {
              const response = await apiClient.get<
                ApiResponse<RoomResponse>
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
        } catch (roomError) {
          console.error(
            "Failed to load room details:",
            roomError
          );

          setRoomNumbers({});
        }
      } else {
        setRoomNumbers({});
      }
    } catch (err) {
      console.error(
        "Failed to load upcoming therapist sessions:",
        err
      );

      setError(
        "Unable to load your upcoming sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // UPDATE SESSION STATUS
  // =========================================================

  const handleStatusChange = async (
    session: TherapySession,
    newStatus: TherapySession["status"]
  ) => {
    try {
      setUpdatingSessionId(session.id);
      setError("");

      const updatedSession =
        await updateTherapySession(
          session.id,
          {
            therapyPlanId:
              session.therapyPlanId,

            patientId:
              session.patientId,

            therapistId:
              session.therapistId ??
              undefined,

            roomId:
              session.roomId ??
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
              session.startTime ??
              undefined,

            endTime:
              session.endTime ??
              undefined,

            plannedDurationMinutes:
              session.plannedDurationMinutes,

            actualDurationMinutes:
              session.actualDurationMinutes ??
              undefined,

            status:
              newStatus,

            notes:
              session.notes ??
              undefined,
          }
        );

      setSessions((currentSessions) =>
        currentSessions.map(
          (currentSession) =>
            currentSession.id === session.id
              ? updatedSession
              : currentSession
        )
      );
    } catch (err) {
      console.error(
        "Failed to update session status:",
        err
      );

      setError(
        `Unable to update ${session.therapyName} status. Please try again.`
      );
    } finally {
      setUpdatingSessionId(null);
    }
  };

  // =========================================================
  // PATIENT MAP
  // =========================================================

  const patientMap = useMemo(() => {
    const map = new Map<
      string,
      AssignedPatient
    >();

    patients.forEach((patient) => {
      map.set(patient.id, patient);
    });

    return map;
  }, [patients]);

  // =========================================================
  // UPCOMING SESSIONS
  // =========================================================

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        // Only future sessions.
        if (session.sessionDate <= today) {
          return false;
        }

        // Do not show sessions that are already closed.
        if (
          session.status === "COMPLETED" ||
          session.status === "CANCELLED" ||
          session.status === "SKIPPED"
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateCompare =
          a.sessionDate.localeCompare(
            b.sessionDate
          );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (
          (a.startTime ?? "").localeCompare(
            b.startTime ?? ""
          )
        );
      });
  }, [sessions, today]);

  // =========================================================
  // COUNTS
  // =========================================================

  const upcomingCount =
    upcomingSessions.length;

  const scheduledCount = useMemo(() => {
    return upcomingSessions.filter(
      (session) =>
        session.status === "SCHEDULED"
    ).length;
  }, [upcomingSessions]);

  const plannedCount = useMemo(() => {
    return upcomingSessions.filter(
      (session) =>
        session.status === "PLANNED"
    ).length;
  }, [upcomingSessions]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "Date not available";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // SHORT DATE
  // =========================================================

  const formatShortDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // TIME
  // =========================================================

  const formatTime = (
    time: string | null
  ) => {
    if (!time) {
      return "Time not set";
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
      }
    );
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
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

      case "PLANNED":
      default:
        return "Planned";
    }
  };

  // =========================================================
  // STATUS CLASSES
  // =========================================================

  const getStatusClasses = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
      case "SCHEDULED":
        return "border-[#D7E7DA] bg-[#EEF5EF] text-[#356B4B]";

      case "IN_PROGRESS":
        return "border-[#D7E4DD] bg-[#EAF2ED] text-[#245B43]";

      case "COMPLETED":
        return "border-[#DCE8D5] bg-[#EDF4E9] text-[#526B3D]";

      case "CANCELLED":
        return "border-[#EBD9D5] bg-[#F8ECE9] text-[#9A5145]";

      case "SKIPPED":
        return "border-[#E5E0D7] bg-[#F3F0EA] text-[#817766]";

      case "PLANNED":
      default:
        return "border-[#E8E2D4] bg-[#F7F4EC] text-[#8A6A32]";
    }
  };

  // =========================================================
  // GROUP BY DATE
  // =========================================================

  const groupedSessions = useMemo(() => {
    const groups: Record<
      string,
      TherapySession[]
    > = {};

    upcomingSessions.forEach(
      (session) => {
        if (
          !groups[session.sessionDate]
        ) {
          groups[session.sessionDate] = [];
        }

        groups[session.sessionDate].push(
          session
        );
      }
    );

    return groups;
  }, [upcomingSessions]);

  const groupedDates =
    Object.keys(groupedSessions);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#F7F6F0] p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1E7]">
                <RefreshCw
                  className="animate-spin text-[#356B4B]"
                  size={22}
                />
              </div>

              <p className="mt-4 text-sm text-[#7A806F]">
                Loading your upcoming sessions...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F6F0] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#9A6D32]">
              Therapy Care
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#173F32]">
              Upcoming Sessions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766F63]">
              Your upcoming therapy sessions and
              assignments, so you can prepare in
              advance.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8D2C3] bg-white px-4 py-2.5 text-sm font-medium text-[#355B48] shadow-sm transition hover:border-[#BFCDBF] hover:bg-[#FBFCF9]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#766F63]">
                  Upcoming Sessions
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F32]">
                  {upcomingCount}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Future sessions assigned to you
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1E7] text-[#356B4B]">
                <CalendarDays size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#766F63]">
                  Scheduled
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F32]">
                  {scheduledCount}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Confirmed upcoming sessions
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F0E5] text-[#9A6D32]">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#766F63]">
                  Needs Scheduling
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#173F32]">
                  {plannedCount}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Sessions ready to be scheduled
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F0E5] text-[#9A6D32]">
                <ClipboardList size={20} />
              </div>
            </div>
          </div>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#E7D2CD] bg-[#FFF8F6] p-5">
            <p className="text-sm font-medium text-[#8E4F45]">
              {error}
            </p>

            <button
              type="button"
              onClick={loadData}
              className="mt-3 text-sm font-medium text-[#356B4B] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* ===================================================
            NO UPCOMING SESSIONS
        =================================================== */}

        {!error &&
          upcomingSessions.length === 0 && (
            <section className="mt-7 rounded-2xl border border-[#DDD8CC] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">
                <ClipboardList size={28} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#173D2D]">
                No upcoming sessions
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#778078]">
                You currently have no active therapy
                sessions scheduled after today.
              </p>
            </section>
          )}

        {/* ===================================================
            UPCOMING SCHEDULE
        =================================================== */}

        {!error &&
          upcomingSessions.length > 0 && (
            <section className="mt-7">

              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#173F32]">
                  Your Schedule
                </h2>

                <p className="mt-1 text-sm text-[#766F63]">
                  Sessions assigned to you from tomorrow
                  onward.
                </p>
              </div>

              <div className="space-y-7">

                {groupedDates.map(
                  (date) => (
                    <div key={date}>

                      {/* DATE HEADER */}

                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1E7] text-[#356B4B]">
                          <CalendarDays size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#173F32]">
                            {formatDate(date)}
                          </p>

                          <p className="text-xs text-[#8B8478]">
                            {
                              groupedSessions[
                                date
                              ].length
                            }{" "}
                            {groupedSessions[
                              date
                            ].length === 1
                              ? "session"
                              : "sessions"}
                          </p>
                        </div>
                      </div>

                      {/* SESSION CARDS */}

                      <div className="space-y-4">

                        {groupedSessions[
                          date
                        ].map(
                          (session) => {
                            const patient =
                              patientMap.get(
                                session.patientId
                              );

                            const isUpdating =
                              updatingSessionId ===
                              session.id;

                            return (
                              <div
                                key={
                                  session.id
                                }
                                className="overflow-hidden rounded-2xl border border-[#DDD8CC] bg-white shadow-sm transition hover:border-[#C5D1C6] hover:shadow-md"
                              >
                                <div className="p-5 md:p-6">

                                  {/* TOP */}

                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                    <div className="flex items-start gap-4">

                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">
                                        <ClipboardList
                                          size={
                                            21
                                          }
                                        />
                                      </div>

                                      <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                                          Day{" "}
                                          {
                                            session.dayNumber
                                          }
                                          {" · "}
                                          Session{" "}
                                          {
                                            session.sequenceOrder
                                          }
                                        </p>

                                        <h3 className="mt-1 text-xl font-semibold text-[#173D2D]">
                                          {
                                            session.therapyName
                                          }
                                        </h3>

                                        <p className="mt-1 text-sm text-[#778078]">
                                          {session.status ===
                                          "PLANNED"
                                            ? "This session is ready to be scheduled."
                                            : "Prepare for this scheduled therapy session."}
                                        </p>
                                      </div>

                                    </div>

                                    {/* STATUS DROPDOWN */}

                                    <div className="flex flex-col items-start gap-1 lg:items-end">

                                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8B8478]">
                                        Session Status
                                      </p>

                                      <div className="relative">

                                        <select
                                          value={
                                            session.status
                                          }
                                          disabled={
                                            isUpdating
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            handleStatusChange(
                                              session,
                                              event
                                                .target
                                                .value as TherapySession["status"]
                                            )
                                          }
                                          className={`appearance-none rounded-full border py-2 pl-4 pr-9 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#BFD1C2] disabled:cursor-not-allowed disabled:opacity-60 ${getStatusClasses(
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

                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-current">
                                          {isUpdating ? (
                                            <RefreshCw
                                              size={
                                                14
                                              }
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <CheckCircle2
                                              size={
                                                14
                                              }
                                            />
                                          )}
                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                  {/* DETAILS */}

                                  <div className="mt-6 grid gap-4 border-t border-[#ECE8DF] pt-5 md:grid-cols-3">

                                    {/* DATE */}

                                    <div className="flex items-start gap-3">
                                      <CalendarDays
                                        size={
                                          18
                                        }
                                        className="mt-0.5 shrink-0 text-[#9A6D32]"
                                      />

                                      <div>
                                        <p className="text-xs text-[#8B8478]">
                                          Date
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#31483B]">
                                          {formatShortDate(
                                            session.sessionDate
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* TIME */}

                                    <div className="flex items-start gap-3">
                                      <Clock3
                                        size={
                                          18
                                        }
                                        className="mt-0.5 shrink-0 text-[#9A6D32]"
                                      />

                                      <div>
                                        <p className="text-xs text-[#8B8478]">
                                          Time
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#31483B]">
                                          {formatTime(
                                            session.startTime
                                          )}
                                          {" – "}
                                          {formatTime(
                                            session.endTime
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* ROOM */}

                                    <div className="flex items-start gap-3">
                                      <MapPin
                                        size={
                                          18
                                        }
                                        className="mt-0.5 shrink-0 text-[#9A6D32]"
                                      />

                                      <div>
                                        <p className="text-xs text-[#8B8478]">
                                          Room
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#31483B]">
                                          {session.roomId
                                            ? roomNumbers[
                                                session.roomId
                                              ] ||
                                              "Room assigned"
                                            : "Not assigned"}
                                        </p>
                                      </div>
                                    </div>

                                  </div>

                                  {/* PATIENT + DURATION */}

                                  <div className="mt-5 flex flex-col gap-4 border-t border-[#ECE8DF] pt-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-2">
                                      <UserRound
                                        size={
                                          16
                                        }
                                        className="text-[#526B3D]"
                                      />

                                      <span className="text-sm text-[#766F63]">
                                        Patient:
                                      </span>

                                      <span className="text-sm font-medium text-[#31483B]">
                                        {patient?.fullName ||
                                          "Patient"}
                                      </span>
                                    </div>

                                    <p className="text-xs text-[#858B83]">
                                      Planned duration:{" "}
                                      <span className="font-medium text-[#5C655D]">
                                        {
                                          session.plannedDurationMinutes
                                        }{" "}
                                        minutes
                                      </span>
                                    </p>

                                  </div>

                                  {/* NOTES */}

                                  {session.notes && (
                                    <div className="mt-4 rounded-xl border border-[#E5E1D8] bg-[#F8F6F0] px-4 py-3">
                                      <p className="text-xs font-medium text-[#766F63]">
                                        Session notes
                                      </p>

                                      <p className="mt-1 text-sm leading-6 text-[#4E463D]">
                                        {
                                          session.notes
                                        }
                                      </p>
                                    </div>
                                  )}

                                </div>
                              </div>
                            );
                          }
                        )}

                      </div>
                    </div>
                  )
                )}

              </div>
            </section>
          )}

      </div>
    </div>
  );
}

export default TherapistUpcomingSessionsPage;