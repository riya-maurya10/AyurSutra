import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  HeartPulse,
  Clock3,
  CheckCircle2,
  CircleDot,
  XCircle,
  PlayCircle,
  ChevronDown,
} from "lucide-react";

import {
  getMyPatients,
  getSessionsByPatient,
  updateTherapySession,
  type PatientResponse,
  type TherapySession,
  type TherapySessionStatus,
} from "../../services/therapist/therapistService";

function TherapistPatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);

  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [error, setError] = useState("");
  const [sessionsError, setSessionsError] = useState("");

  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(
    null
  );

  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const patients = await getMyPatients();

        const matchedPatient = patients.find(
          (item) => item.id === id
        );

        if (!matchedPatient) {
          setError("Patient not found in your assigned patients.");
          return;
        }

        setPatient(matchedPatient);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        setError("Unable to load patient details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchSessions = async () => {
    if (!id) {
      return;
    }

    try {
      setSessionsLoading(true);
      setSessionsError("");

      const data = await getSessionsByPatient(id);

      const sortedSessions = [...data].sort((a, b) => {
        const dateA = `${a.sessionDate}T${
          a.startTime || "00:00:00"
        }`;

        const dateB = `${b.sessionDate}T${
          b.startTime || "00:00:00"
        }`;

        return (
          new Date(dateA).getTime() -
          new Date(dateB).getTime()
        );
      });

      setSessions(sortedSessions);
    } catch (err) {
      console.error("Failed to fetch patient sessions:", err);

      setSessionsError(
        "Unable to load therapy sessions for this patient."
      );
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [id]);

  const formatDate = (date: string) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) {
      return "Time not scheduled";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusLabel = (status: TherapySessionStatus) => {
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

  const getStatusClasses = (status: TherapySessionStatus) => {
    switch (status) {
      case "PLANNED":
        return "bg-[#F5F1E8] text-[#8A6A3B]";

      case "SCHEDULED":
        return "bg-[#EEF3EA] text-[#3F684F]";

      case "IN_PROGRESS":
        return "bg-[#EAF1F4] text-[#426579]";

      case "COMPLETED":
        return "bg-[#E8F4EC] text-[#2F6B46]";

      case "CANCELLED":
        return "bg-[#F8ECEC] text-[#8A3F3F]";

      case "SKIPPED":
        return "bg-[#F2F0F0] text-[#716B6B]";

      default:
        return "bg-[#EEF3EA] text-[#3F684F]";
    }
  };

  const getStatusIcon = (status: TherapySessionStatus) => {
    switch (status) {
      case "PLANNED":
        return <CircleDot size={15} />;

      case "SCHEDULED":
        return <CalendarDays size={15} />;

      case "IN_PROGRESS":
        return <PlayCircle size={15} />;

      case "COMPLETED":
        return <CheckCircle2 size={15} />;

      case "CANCELLED":
      case "SKIPPED":
        return <XCircle size={15} />;

      default:
        return <CircleDot size={15} />;
    }
  };

  const handleStatusChange = async (
    session: TherapySession,
    newStatus: TherapySessionStatus
  ) => {
    if (session.status === newStatus) {
      return;
    }

    try {
      setUpdatingSessionId(session.id);
      setStatusError("");

      const updatedSession = await updateTherapySession(
        session.id,
        {
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
          plannedDurationMinutes:
            session.plannedDurationMinutes,
          actualDurationMinutes:
            session.actualDurationMinutes ?? undefined,
          status: newStatus,
          notes: session.notes || undefined,
        }
      );

      setSessions((currentSessions) =>
        currentSessions.map((item) =>
          item.id === session.id
            ? updatedSession
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update session status:", err);

      setStatusError(
        "Unable to update the session status. Please try again."
      );
    } finally {
      setUpdatingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded bg-[#E8EBE3]" />

            <div className="h-48 rounded-2xl bg-white" />

            <div className="h-56 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              navigate("/therapist/patients")
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#3F684F] hover:text-[#1F3D2E]"
          >
            <ArrowLeft size={17} />
            Back to Assigned Patients
          </button>

          <div className="rounded-2xl border border-[#E1E4DA] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EAEA] text-[#8A3F3F]">
              <UserRound size={24} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#1F3D2E]">
              Patient unavailable
            </h2>

            <p className="mt-2 text-sm text-[#7A806F]">
              {error ||
                "The requested patient could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const completedSessions = sessions.filter(
    (session) =>
      session.status === "COMPLETED"
  ).length;

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "PLANNED" ||
      session.status === "SCHEDULED"
  ).length;

  const inProgressSessions = sessions.filter(
    (session) =>
      session.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            BACK BUTTON
            ===================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/therapist/patients")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-[#3F684F] transition hover:text-[#1F3D2E]"
        >
          <ArrowLeft size={17} />
          {/* Back to Assigned Patients */}
        </button>

        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <div>
          <p className="text-sm font-medium text-[#8A6A3B]">
            Patient Care
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F3D2E] md:text-3xl">
            Patient Details
          </h1>

          <p className="mt-2 text-sm text-[#7A806F]">
            Review patient information and therapy care
            details.
          </p>
        </div>

        {/* =====================================================
            PATIENT PROFILE
            ===================================================== */}

        <div className="rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EEF3EA] text-[#3F684F]">
                <UserRound size={28} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#1F3D2E]">
                  {patient.fullName}
                </h2>

                <p className="mt-1 text-sm text-[#8A8F82]">
                  Patient ID: {patient.id}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EEF3EA] px-3 py-1.5 text-xs font-medium text-[#3F684F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3F684F]" />
              Assigned Patient
            </span>
          </div>
        </div>

        {/* =====================================================
            PATIENT INFORMATION
            ===================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* PERSONAL INFORMATION */}

          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#3F684F]">
                <UserRound size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-[#1F3D2E]">
                  Personal Information
                </h3>

                <p className="mt-0.5 text-xs text-[#8A8F82]">
                  Basic patient details
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between border-b border-[#EEF0EA] pb-3">
                <span className="text-sm text-[#7A806F]">
                  Age
                </span>

                <span className="text-sm font-medium text-[#1F3D2E]">
                  {patient.age !== null
                    ? `${patient.age} years`
                    : "Not recorded"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#EEF0EA] pb-3">
                <span className="text-sm text-[#7A806F]">
                  Gender
                </span>

                <span className="text-sm font-medium text-[#1F3D2E]">
                  {patient.gender ||
                    "Not recorded"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-[#7A806F]">
                  Address
                </span>

                <span className="max-w-xs text-right text-sm font-medium text-[#1F3D2E]">
                  {patient.address ||
                    "Not recorded"}
                </span>
              </div>

            </div>
          </div>

          {/* CONTACT INFORMATION */}

          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8A6A3B]">
                <Phone size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-[#1F3D2E]">
                  Contact Information
                </h3>

                <p className="mt-0.5 text-xs text-[#8A8F82]">
                  Patient contact details
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">

              <div className="flex items-center gap-3 border-b border-[#EEF0EA] pb-4">
                <Phone
                  size={17}
                  className="shrink-0 text-[#8A6A3B]"
                />

                <div>
                  <p className="text-xs text-[#8A8F82]">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#1F3D2E]">
                    {patient.phone ||
                      "Not recorded"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-[#EEF0EA] pb-4">
                <Mail
                  size={17}
                  className="shrink-0 text-[#8A6A3B]"
                />

                <div className="min-w-0">
                  <p className="text-xs text-[#8A8F82]">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-[#1F3D2E]">
                    {patient.email ||
                      "Not recorded"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin
                  size={17}
                  className="shrink-0 text-[#8A6A3B]"
                />

                <div>
                  <p className="text-xs text-[#8A8F82]">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#1F3D2E]">
                    {patient.address ||
                      "Not recorded"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            MEDICAL HISTORY
            ===================================================== */}

        <div className="rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#3F684F]">
              <HeartPulse size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-[#1F3D2E]">
                Medical History
              </h3>

              <p className="mt-0.5 text-xs text-[#8A8F82]">
                Current medical information available for
                care
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#FAFBF7] p-5">
            <p className="text-sm leading-6 text-[#5F665B]">
              {patient.medicalHistory ||
                "No medical history has been recorded."}
            </p>
          </div>
        </div>

        {/* =====================================================
            THERAPY OVERVIEW
            ===================================================== */}

        <div>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#1F3D2E]">
              Therapy Overview
            </h3>

            <p className="mt-1 text-sm text-[#7A806F]">
              Summary of this patient's therapy sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7A806F]">
                    Total Sessions
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                    {sessionsLoading
                      ? "—"
                      : sessions.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#3F684F]">
                  <CalendarDays size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7A806F]">
                    Scheduled
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                    {sessionsLoading
                      ? "—"
                      : upcomingSessions}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#8A6A3B]">
                  <Clock3 size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7A806F]">
                    Completed
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                    {sessionsLoading
                      ? "—"
                      : completedSessions}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#3F684F]">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            THERAPY SESSIONS
            ===================================================== */}

        <div className="rounded-2xl border border-[#E1E4DA] bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-semibold text-[#1F3D2E]">
                Therapy Sessions
              </h3>

              <p className="mt-1 text-sm text-[#7A806F]">
                Scheduled and recorded therapy sessions for
                this patient.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EEF3EA] px-3 py-1.5 text-xs font-medium text-[#3F684F]">
              <CalendarDays size={14} />

              {sessionsLoading
                ? "Loading..."
                : `${sessions.length} sessions`}
            </div>
          </div>

          {/* STATUS ERROR */}

          {statusError && (
            <div className="mt-5 rounded-xl border border-[#E6C9C9] bg-[#FFF8F8] p-4">
              <p className="text-sm font-medium text-[#8A3F3F]">
                {statusError}
              </p>
            </div>
          )}

          {/* SESSION ERROR */}

          {sessionsError && (
            <div className="mt-5 rounded-xl border border-[#E6C9C9] bg-[#FFF8F8] p-4">
              <p className="text-sm font-medium text-[#8A3F3F]">
                {sessionsError}
              </p>
            </div>
          )}

          {/* SESSION LOADING */}

          {sessionsLoading && (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-[#EEF0EA] p-5"
                >
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#E8EBE3]" />

                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-[#E8EBE3]" />

                      <div className="mt-3 h-3 w-48 rounded bg-[#EEF0EA]" />

                      <div className="mt-2 h-3 w-40 rounded bg-[#EEF0EA]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SESSION LIST */}

          {!sessionsLoading &&
            !sessionsError &&
            sessions.length > 0 && (
              <div className="mt-6 space-y-3">

                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-[#EEF0EA] bg-[#FCFCF9] p-5 transition hover:border-[#D9DDCF]"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* THERAPY */}

                      <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#3F684F]">
                          <HeartPulse size={20} />
                        </div>

                        <div>
                          <h4 className="font-semibold text-[#1F3D2E]">
                            {session.therapyName}
                          </h4>

                          <p className="mt-1 text-xs text-[#8A8F82]">
                            Day {session.dayNumber}
                            {" • "}
                            Session{" "}
                            {session.sequenceOrder}
                          </p>
                        </div>

                      </div>

                      {/* DATE / TIME */}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[330px]">

                        <div className="flex items-center gap-3">
                          <CalendarDays
                            size={16}
                            className="shrink-0 text-[#8A6A3B]"
                          />

                          <div>
                            <p className="text-xs text-[#8A8F82]">
                              Date
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-[#1F3D2E]">
                              {formatDate(
                                session.sessionDate
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock3
                            size={16}
                            className="shrink-0 text-[#8A6A3B]"
                          />

                          <div>
                            <p className="text-xs text-[#8A8F82]">
                              Time
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-[#1F3D2E]">
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
                        </div>

                      </div>

                      {/* STATUS CONTROL */}

                      <div className="flex flex-col items-start gap-1.5 lg:items-end">

                        <span className="text-[11px] font-medium uppercase tracking-wide text-[#8A8F82]">
                          Status
                        </span>

                        <div className="relative">

                          <select
                            value={session.status}
                            disabled={
                              updatingSessionId ===
                              session.id
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                session,
                                event.target
                                  .value as TherapySessionStatus
                              )
                            }
                            className={`appearance-none rounded-full border-0 py-2 pl-9 pr-9 text-xs font-medium outline-none transition focus:ring-2 focus:ring-[#C8D8C4] disabled:cursor-wait disabled:opacity-60 ${getStatusClasses(
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

                          <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center">
                            {updatingSessionId ===
                            session.id ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              getStatusIcon(
                                session.status
                              )
                            )}
                          </div>

                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                          />

                        </div>

                      </div>

                    </div>

                    {/* DURATION / NOTES */}

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#EEF0EA] pt-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-2 text-xs text-[#7A806F]">
                        <Clock3 size={14} />

                        Planned duration:

                        <span className="font-medium text-[#5F665B]">
                          {session.plannedDurationMinutes}{" "}
                          minutes
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-[#8A8F82] sm:max-w-[55%] sm:text-right">
                          {session.notes}
                        </p>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}

          {/* EMPTY STATE */}

          {!sessionsLoading &&
            !sessionsError &&
            sessions.length === 0 && (
              <div className="mt-6 rounded-xl bg-[#FAFBF7] px-6 py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3EA] text-[#3F684F]">
                  <CalendarDays size={21} />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-[#1F3D2E]">
                  No therapy sessions
                </h4>

                <p className="mt-2 text-sm text-[#7A806F]">
                  No therapy sessions are currently
                  recorded for this patient.
                </p>

              </div>
            )}

        </div>

        {/* =====================================================
            CARE STATUS
            ===================================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={18}
                className="text-[#3F684F]"
              />

              <div>
                <p className="text-xs text-[#8A8F82]">
                  Care Status
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                  Active Assignment
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <UserRound
                size={18}
                className="text-[#8A6A3B]"
              />

              <div>
                <p className="text-xs text-[#8A8F82]">
                  Patient
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                  {patient.fullName}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1E4DA] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <HeartPulse
                size={18}
                className="text-[#3F684F]"
              />

              <div>
                <p className="text-xs text-[#8A8F82]">
                  Active Sessions
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                  {sessionsLoading
                    ? "—"
                    : inProgressSessions > 0
                    ? `${inProgressSessions} in progress`
                    : `${upcomingSessions} scheduled`}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default TherapistPatientDetailsPage;