import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  CheckCircle2,
  Circle,
  XCircle,
  PlayCircle,
  ClipboardList,
} from "lucide-react";

import apiClient from "../../services/api/client";

interface PatientProfile {
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
  startTime: string | null;
  endTime: string | null;

  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;

  status:
    | "PLANNED"
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "SKIPPED";

  notes: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
 * Therapy Plan contains the doctor.
 *
 * therapy_sessions does NOT contain doctorId.
 *
 * Relationship:
 *
 * TherapySession.therapyPlanId
 *          ↓
 * TherapyPlan.id
 *          ↓
 * TherapyPlan.doctorId
 */
interface TherapyPlanSummary {
  id: string;
  doctorId: string;
}

interface PersonSummary {
  id: string;
  fullName: string;
}

interface RoomSummary {
  id: string;
  roomNumber: string;
}

type SessionFilter = "ALL" | "UPCOMING" | "COMPLETED";

function PatientSessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);

  /*
   * doctorId -> doctor name
   */
  const [doctorNames, setDoctorNames] = useState<
    Record<string, string>
  >({});

  /*
   * therapyPlanId -> doctorId
   *
   * Example:
   *
   * {
   *   "6a7ebbfe912384b62b591b0a":
   *       "6a828acd2a48755986cc192d"
   * }
   */
  const [planDoctorIds, setPlanDoctorIds] = useState<
    Record<string, string>
  >({});

  /*
   * therapistId -> therapist name
   */
  const [therapistNames, setTherapistNames] = useState<
    Record<string, string>
  >({});

  /*
   * roomId -> room number
   */
  const [roomNumbers, setRoomNumbers] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<SessionFilter>("ALL");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * =====================================================
         * 1. GET LOGGED-IN PATIENT
         * =====================================================
         */

        const profileResponse =
          await apiClient.get<
            ApiResponse<PatientProfile>
          >("/patients/me");

        const patientId =
          profileResponse.data.data.id;

        if (!patientId) {
          throw new Error("Patient ID not found");
        }

        /*
         * =====================================================
         * 2. GET PATIENT THERAPY SESSIONS
         * =====================================================
         */

        const sessionsResponse =
          await apiClient.get<
            ApiResponse<TherapySession[]>
          >(
            `/therapy-sessions/patient/${patientId}`
          );

        const fetchedSessions =
          sessionsResponse.data.data || [];

        setSessions(fetchedSessions);

        /*
         * =====================================================
         * 3. GET UNIQUE THERAPY PLAN IDs
         * =====================================================
         *
         * IMPORTANT:
         *
         * therapy_sessions DOES NOT contain doctorId.
         *
         * It contains:
         *
         * therapyPlanId
         *
         * Therefore we first get the therapy plans.
         */

        const therapyPlanIds = [
          ...new Set(
            fetchedSessions
              .map(
                (session) =>
                  session.therapyPlanId
              )
              .filter(
                (id): id is string =>
                  Boolean(id)
              )
          ),
        ];

        /*
         * =====================================================
         * 4. GET THERAPY PLANS
         * =====================================================
         */

        const planResponses =
          await Promise.all(
            therapyPlanIds.map(
              async (planId) => {
                try {
                  console.log(
                    "Fetching therapy plan:",
                    planId
                  );

                  const response =
                    await apiClient.get<
                      ApiResponse<TherapyPlanSummary>
                    >(
                      `/therapy-plans/${planId}`
                    );

                  console.log(
                    "Therapy plan response:",
                    response.data
                  );

                  return response.data.data;
                } catch (error) {
                  console.error(
                    `Unable to fetch therapy plan ${planId}:`,
                    error
                  );

                  return null;
                }
              }
            )
          );

        /*
         * =====================================================
         * 5. CREATE THERAPY PLAN -> DOCTOR MAP
         * =====================================================
         *
         * Example:
         *
         * therapyPlanId:
         * 6a7ebbfe912384b62b591b0a
         *
         * doctorId:
         * 6a828acd2a48755986cc192d
         */

        const planDoctorMap: Record<
          string,
          string
        > = {};

        planResponses.forEach(
          (plan) => {
            if (
              plan &&
              plan.id &&
              plan.doctorId
            ) {
              planDoctorMap[plan.id] =
                plan.doctorId;
            }
          }
        );

        setPlanDoctorIds(
          planDoctorMap
        );

        console.log(
          "Therapy Plan -> Doctor map:",
          planDoctorMap
        );

        /*
         * =====================================================
         * 6. GET UNIQUE DOCTOR IDs
         * =====================================================
         */

        const doctorIds = [
          ...new Set(
            Object.values(
              planDoctorMap
            ).filter(Boolean)
          ),
        ];

        console.log(
          "Doctor IDs:",
          doctorIds
        );

        /*
         * =====================================================
         * 7. GET DOCTORS
         * =====================================================
         *
         * ONLY doctor IDs obtained from therapy plans
         * are sent to /doctors/{id}.
         *
         * We NEVER use therapySession.doctorId.
         */

        const doctorResponses =
          await Promise.all(
            doctorIds.map(
              async (doctorId) => {
                try {
                  if (!doctorId) {
                    return null;
                  }

                  console.log(
                    "Fetching doctor:",
                    doctorId
                  );

                  const response =
                    await apiClient.get<
                      ApiResponse<PersonSummary>
                    >(
                      `/doctors/${doctorId}`
                    );

                  console.log(
                    "Doctor API response:",
                    response.data
                  );

                  return response.data.data;
                } catch (error) {
                  console.error(
                    `Unable to fetch doctor ${doctorId}:`,
                    error
                  );

                  return null;
                }
              }
            )
          );

        /*
         * =====================================================
         * 8. CREATE DOCTOR NAME MAP
         * =====================================================
         *
         * doctorId -> fullName
         */

        const doctorNameMap: Record<
          string,
          string
        > = {};

        doctorResponses.forEach(
          (doctor) => {
            if (
              doctor &&
              doctor.id &&
              doctor.fullName
            ) {
              doctorNameMap[
                doctor.id
              ] = doctor.fullName;
            }
          }
        );

        setDoctorNames(
          doctorNameMap
        );

        /*
         * =====================================================
         * 9. GET THERAPISTS
         * =====================================================
         */

        const therapistIds = [
          ...new Set(
            fetchedSessions
              .map(
                (session) =>
                  session.therapistId
              )
              .filter(
                (
                  id
                ): id is string =>
                  Boolean(id)
              )
          ),
        ];

        const therapistResponses =
          await Promise.all(
            therapistIds.map(
              async (therapistId) => {
                try {
                  const response =
                    await apiClient.get<
                      ApiResponse<PersonSummary>
                    >(
                      `/therapists/${therapistId}`
                    );

                  return response.data.data;
                } catch (error) {
                  console.error(
                    `Unable to fetch therapist ${therapistId}:`,
                    error
                  );

                  return null;
                }
              }
            )
          );

        /*
         * =====================================================
         * 10. CREATE THERAPIST NAME MAP
         * =====================================================
         */

        const therapistNameMap: Record<
          string,
          string
        > = {};

        therapistResponses.forEach(
          (therapist) => {
            if (
              therapist &&
              therapist.id &&
              therapist.fullName
            ) {
              therapistNameMap[
                therapist.id
              ] =
                therapist.fullName;
            }
          }
        );

        setTherapistNames(
          therapistNameMap
        );

        /*
         * =====================================================
         * 11. GET ROOMS
         * =====================================================
         */

        const roomIds = [
          ...new Set(
            fetchedSessions
              .map(
                (session) =>
                  session.roomId
              )
              .filter(
                (
                  id
                ): id is string =>
                  Boolean(id)
              )
          ),
        ];

        const roomResponses =
          await Promise.all(
            roomIds.map(
              async (roomId) => {
                try {
                  const response =
                    await apiClient.get<
                      ApiResponse<RoomSummary>
                    >(
                      `/rooms/${roomId}`
                    );

                  return response.data.data;
                } catch (error) {
                  console.error(
                    `Unable to fetch room ${roomId}:`,
                    error
                  );

                  return null;
                }
              }
            )
          );

        /*
         * =====================================================
         * 12. CREATE ROOM NUMBER MAP
         * =====================================================
         */

        const roomNumberMap: Record<
          string,
          string
        > = {};

        roomResponses.forEach(
          (room) => {
            if (
              room &&
              room.id &&
              room.roomNumber
            ) {
              roomNumberMap[
                room.id
              ] =
                room.roomNumber;
            }
          }
        );

        setRoomNumbers(
          roomNumberMap
        );
      } catch (error: any) {
        console.error(
          "Unable to fetch patient therapy sessions:",
          error
        );

        if (
          error.response?.status === 404
        ) {
          setSessions([]);
        } else {
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load your therapy sessions."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  /*
   * =====================================================
   * FORMAT DATE
   * =====================================================
   */

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "Date not available";
    }

    /*
     * Handles both:
     *
     * 2026-08-14
     *
     * and
     *
     * 2026-08-14T00:00:00
     */

    const dateOnly =
      dateString.includes("T")
        ? dateString.split("T")[0]
        : dateString;

    const date = new Date(
      `${dateOnly}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * =====================================================
   * FORMAT TIME
   * =====================================================
   */

  const formatTime = (
    time: string | null
  ) => {
    if (!time) {
      return null;
    }

    /*
     * Handles:
     *
     * 08:00
     *
     * 08:00:00
     *
     * 2026-08-14T08:00:00
     */

    if (time.includes("T")) {
      const date = new Date(time);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return null;
      }

      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }

    const [
      hours,
      minutes,
    ] = time
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(
      hours,
      minutes,
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

  /*
   * =====================================================
   * STATUS LABEL
   * =====================================================
   */

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

  /*
   * =====================================================
   * STATUS COLORS
   * =====================================================
   */

  const getStatusClasses = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-[#EAF1E7] text-[#4F7041]";

      case "IN_PROGRESS":
        return "bg-[#E8F0EC] text-[#245B43]";

      case "COMPLETED":
        return "bg-[#E8EFE4] text-[#526B3D]";

      case "CANCELLED":
        return "bg-[#F5E8E5] text-[#9A5145]";

      case "SKIPPED":
        return "bg-[#F1EEE8] text-[#817766]";

      case "PLANNED":
      default:
        return "bg-[#F2F3ED] text-[#7A806F]";
    }
  };

  /*
   * =====================================================
   * STATUS ICON
   * =====================================================
   */

  const getStatusIcon = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
      case "COMPLETED":
        return (
          <CheckCircle2 size={16} />
        );

      case "IN_PROGRESS":
        return (
          <PlayCircle size={16} />
        );

      case "CANCELLED":
        return (
          <XCircle size={16} />
        );

      case "SCHEDULED":
        return (
          <CalendarDays size={16} />
        );

      default:
        return <Circle size={16} />;
    }
  };

  /*
   * =====================================================
   * FILTER SESSIONS
   * =====================================================
   */

  const filteredSessions =
    useMemo(() => {
      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      return [...sessions]
        .filter((session) => {
          const sessionDate =
            new Date(
              `${
                session.sessionDate.includes(
                  "T"
                )
                  ? session.sessionDate.split(
                      "T"
                    )[0]
                  : session.sessionDate
              }T00:00:00`
            );

          if (
            activeFilter ===
            "COMPLETED"
          ) {
            return (
              session.status ===
              "COMPLETED"
            );
          }

          if (
            activeFilter ===
            "UPCOMING"
          ) {
            return (
              sessionDate >=
                today &&
              session.status !==
                "COMPLETED" &&
              session.status !==
                "CANCELLED" &&
              session.status !==
                "SKIPPED"
            );
          }

          return true;
        })
        .sort((a, b) => {
          const dateA =
            new Date(
              `${
                a.sessionDate.includes(
                  "T"
                )
                  ? a.sessionDate.split(
                      "T"
                    )[0]
                  : a.sessionDate
              }T00:00:00`
            ).getTime();

          const dateB =
            new Date(
              `${
                b.sessionDate.includes(
                  "T"
                )
                  ? b.sessionDate.split(
                      "T"
                    )[0]
                  : b.sessionDate
              }T00:00:00`
            ).getTime();

          if (
            dateA !== dateB
          ) {
            return dateA - dateB;
          }

          return (
            a.sequenceOrder -
            b.sequenceOrder
          );
        });
    }, [
      sessions,
      activeFilter,
    ]);

  /*
   * =====================================================
   * UPCOMING COUNT
   * =====================================================
   */

  const upcomingCount =
    sessions.filter(
      (session) => {
        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const dateOnly =
          session.sessionDate.includes(
            "T"
          )
            ? session.sessionDate.split(
                "T"
              )[0]
            : session.sessionDate;

        const sessionDate =
          new Date(
            `${dateOnly}T00:00:00`
          );

        return (
          sessionDate >=
            today &&
          session.status !==
            "COMPLETED" &&
          session.status !==
            "CANCELLED" &&
          session.status !==
            "SKIPPED"
        );
      }
    ).length;

  /*
   * =====================================================
   * COMPLETED COUNT
   * =====================================================
   */

  const completedCount =
    sessions.filter(
      (session) =>
        session.status ===
        "COMPLETED"
    ).length;

  /*
   * =====================================================
   * MAIN UI
   * =====================================================
   */

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <section className="mb-8">

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#71834F]">
            Your Ayurvedic Care
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#173D2D] sm:text-4xl">
            My Sessions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736C] sm:text-base">
            View your upcoming therapy
            sessions, treatment schedule,
            and completed care.
          </p>

        </section>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2">

          {/* Upcoming */}

          <div className="rounded-3xl border border-[#DDDCD3] bg-white p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">

                <CalendarDays
                  size={21}
                />

              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71834F]">
                  Upcoming
                </p>

                <p className="mt-1 text-2xl font-semibold text-[#173D2D]">
                  {loading
                    ? "—"
                    : upcomingCount}
                </p>

              </div>

            </div>

          </div>

          {/* Completed */}

          <div className="rounded-3xl border border-[#DDDCD3] bg-white p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEB] text-[#526B3D]">

                <CheckCircle2
                  size={21}
                />

              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71834F]">
                  Completed
                </p>

                <p className="mt-1 text-2xl font-semibold text-[#173D2D]">
                  {loading
                    ? "—"
                    : completedCount}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <section className="mb-6">

          <div className="flex flex-wrap gap-2">

            {(
              [
                [
                  "ALL",
                  "All Sessions",
                ],
                [
                  "UPCOMING",
                  "Upcoming",
                ],
                [
                  "COMPLETED",
                  "Completed",
                ],
              ] as [
                SessionFilter,
                string
              ][]
            ).map(
              ([
                filter,
                label,
              ]) => (

                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter
                    )
                  }
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    activeFilter ===
                    filter
                      ? "bg-[#173D2D] text-white"
                      : "border border-[#D9DDCE] bg-white text-[#526056] hover:bg-[#EEF1E8]"
                  }`}
                >
                  {label}
                </button>

              )
            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* SESSIONS */}
        {/* ================================================= */}

        <section>

          {/* Loading */}

          {loading ? (

            <div className="rounded-3xl border border-[#DDDCD3] bg-white p-10 text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D9DDCE] border-t-[#173D2D]" />

              <p className="text-sm text-[#718078]">
                Loading your therapy
                sessions...
              </p>

            </div>

          ) : errorMessage ? (

            <div className="rounded-3xl border border-[#E5D1CC] bg-[#FFF8F6] p-8 text-center">

              <XCircle
                size={28}
                className="mx-auto mb-3 text-[#9A5145]"
              />

              <h2 className="text-lg font-semibold text-[#173D2D]">
                Unable to load
                sessions
              </h2>

              <p className="mt-2 text-sm text-[#7A6E69]">
                {errorMessage}
              </p>

            </div>

          ) : filteredSessions.length ===
            0 ? (

            <div className="rounded-3xl border border-[#DDDCD3] bg-white p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">

                <ClipboardList
                  size={25}
                />

              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#173D2D]">
                No therapy sessions
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#778078]">

                {activeFilter ===
                "UPCOMING"
                  ? "You don't have any upcoming therapy sessions at the moment."
                  : activeFilter ===
                    "COMPLETED"
                  ? "You don't have any completed therapy sessions yet."
                  : "Your therapy sessions will appear here once they are scheduled."}

              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredSessions.map(
                (session) => {

                  /*
                   * =================================================
                   * FIND DOCTOR THROUGH THERAPY PLAN
                   * =================================================
                   *
                   * session.therapyPlanId
                   *       ↓
                   * planDoctorIds[therapyPlanId]
                   *       ↓
                   * doctorId
                   *       ↓
                   * doctorNames[doctorId]
                   */

                  const doctorId =
                    planDoctorIds[
                      session
                        .therapyPlanId
                    ];

                  const doctorName =
                    doctorId
                      ? doctorNames[
                          doctorId
                        ]
                      : null;

                  const therapistName =
                    session.therapistId
                      ? therapistNames[
                          session
                            .therapistId
                        ]
                      : null;

                  const roomNumber =
                    session.roomId
                      ? roomNumbers[
                          session.roomId
                        ]
                      : null;

                  return (

                    <div
                      key={
                        session.id
                      }
                      className="overflow-hidden rounded-3xl border border-[#DDDCD3] bg-white transition hover:border-[#BEC8B6] hover:shadow-sm"
                    >

                      {/* ================================================= */}
                      {/* SESSION HEADER */}
                      {/* ================================================= */}

                      <div className="p-6 sm:p-7">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">

                              <CalendarDays
                                size={22}
                              />

                            </div>

                            <div>

                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71834F]">
                                Day{" "}
                                {
                                  session.dayNumber
                                }
                              </p>

                              <h2 className="mt-1 text-xl font-semibold text-[#173D2D]">
                                {
                                  session.therapyName
                                }
                              </h2>

                              <p className="mt-1 text-sm text-[#778078]">
                                Sequence{" "}
                                {
                                  session.sequenceOrder
                                }
                              </p>

                            </div>

                          </div>

                          {/* Status */}

                          <span
                            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                              session.status
                            )}`}
                          >

                            {getStatusIcon(
                              session.status
                            )}

                            {getStatusLabel(
                              session.status
                            )}

                          </span>

                        </div>

                        {/* ================================================= */}
                        {/* SESSION DETAILS */}
                        {/* ================================================= */}

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                          {/* Date */}

                          <div className="rounded-2xl bg-[#F7F6F0] px-4 py-3">

                            <div className="flex items-center gap-3">

                              <CalendarDays
                                size={18}
                                className="text-[#71834F]"
                              />

                              <div>

                                <p className="text-xs text-[#7A827C]">
                                  Session Date
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-[#173D2D]">
                                  {formatDate(
                                    session.sessionDate
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* Duration */}

                          <div className="rounded-2xl bg-[#F7F6F0] px-4 py-3">

                            <div className="flex items-center gap-3">

                              <Clock3
                                size={18}
                                className="text-[#71834F]"
                              />

                              <div>

                                <p className="text-xs text-[#7A827C]">
                                  Duration
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-[#173D2D]">
                                  {
                                    session.plannedDurationMinutes
                                  }{" "}
                                  minutes
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* Time */}

                          <div className="rounded-2xl bg-[#F7F6F0] px-4 py-3">

                            <div className="flex items-center gap-3">

                              <Clock3
                                size={18}
                                className="text-[#71834F]"
                              />

                              <div>

                                <p className="text-xs text-[#7A827C]">
                                  Time
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-[#173D2D]">

                                  {session.startTime
                                    ? formatTime(
                                        session.startTime
                                      )
                                    : "Not scheduled"}

                                  {session.endTime &&
                                    ` – ${formatTime(
                                      session.endTime
                                    )}`}

                                </p>

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* ================================================= */}
                        {/* DOCTOR / THERAPIST / ROOM */}
                        {/* ================================================= */}

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                          {/* Doctor */}

                          <div className="flex items-center gap-3 rounded-2xl bg-[#F2F3ED] px-4 py-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#526B3D]">

                              <UserRound
                                size={17}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-xs text-[#7A827C]">
                                Doctor
                              </p>

                              <p className="mt-0.5 truncate text-sm font-medium text-[#173D2D]">

                                {doctorName ||
                                  (doctorId
                                    ? "Loading..."
                                    : "Not assigned")}

                              </p>

                            </div>

                          </div>

                          {/* Therapist */}

                          <div className="flex items-center gap-3 rounded-2xl bg-[#F2F3ED] px-4 py-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#526B3D]">

                              <UserRound
                                size={17}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-xs text-[#7A827C]">
                                Therapist
                              </p>

                              <p className="mt-0.5 truncate text-sm font-medium text-[#173D2D]">

                                {therapistName ||
                                  (session.therapistId
                                    ? "Loading..."
                                    : "Not assigned")}

                              </p>

                            </div>

                          </div>

                          {/* Room */}

                          <div className="flex items-center gap-3 rounded-2xl bg-[#F2F3ED] px-4 py-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#526B3D]">

                              <MapPin
                                size={17}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-xs text-[#7A827C]">
                                Room
                              </p>

                              <p className="mt-0.5 truncate text-sm font-medium text-[#173D2D]">

                                {roomNumber ||
                                  (session.roomId
                                    ? "Loading..."
                                    : "Not assigned")}

                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* ================================================= */}
                      {/* NOTES */}
                      {/* ================================================= */}

                      {session.notes && (

                        <div className="border-t border-[#ECECE5] bg-[#FAFAF7] px-6 py-4 sm:px-7">

                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71834F]">
                            Session Notes
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[#68736C]">
                            {
                              session.notes
                            }
                          </p>

                        </div>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default PatientSessionsPage;