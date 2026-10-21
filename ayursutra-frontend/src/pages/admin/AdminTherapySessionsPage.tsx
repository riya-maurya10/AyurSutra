import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Eye,
  Search,
  Stethoscope,
  UserRound,
  X,
  AlertCircle,
} from "lucide-react";

import apiClient from "../../services/api/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

interface TherapySession {
  id: string;
  therapyPlanId?: string;
  patientId?: string;
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
  status?: string;
  notes?: string;
}

interface Patient {
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

interface Room {
  id: string;
  roomNumber?: string;
  name?: string;
}

type FilterStatus = "ALL" | "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SKIPPED";

const getPatientName = (patient?: Patient) => {
  if (!patient) return "Unknown Patient";
  if (patient.fullName) return patient.fullName;
  if (patient.name) return patient.name;

  return [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Unknown Patient";
};

const getTherapistName = (therapist?: Therapist) => {
  if (!therapist) return "Unassigned";
  if (therapist.fullName) return therapist.fullName;
  if (therapist.name) return therapist.name;

  return (
    [therapist.firstName, therapist.lastName].filter(Boolean).join(" ") ||
    "Unassigned"
  );
};

const getRoomName = (room?: Room) => {
  if (!room) return "Unassigned";
  return room.roomNumber || room.name || "Unassigned";
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time?: string) => {
  if (!time) return "—";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "SKIPPED":
      return "Skipped";
    case "PLANNED":
      return "Planned";
    default:
      return status || "Unknown";
  }
};

const getStatusClasses = (status?: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";

    case "SKIPPED":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "PLANNED":
      return "bg-gray-50 text-gray-700 border-gray-200";

    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const getResponseData = <T,>(response: any): T[] => {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.result)) return data.result;

  return [];
};

export default function AdminTherapySessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedSession, setSelectedSession] =
    useState<TherapySession | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [sessionsResponse, patientsResponse, therapistsResponse, roomsResponse] =
        await Promise.all([
          apiClient.get("/therapy-sessions"),
          apiClient.get("/patients"),
          apiClient.get("/therapists"),
          apiClient.get("/rooms"),
        ]);

      setSessions(getResponseData<TherapySession>(sessionsResponse));
      setPatients(getResponseData<Patient>(patientsResponse));
      setTherapists(getResponseData<Therapist>(therapistsResponse));
      setRooms(getResponseData<Room>(roomsResponse));
    } catch (error) {
      console.error("Failed to fetch therapy session data:", error);
    } finally {
      setLoading(false);
    }
  };

  const patientMap = useMemo(() => {
    return new Map(patients.map((patient) => [patient.id, patient]));
  }, [patients]);

  const therapistMap = useMemo(() => {
    return new Map(therapists.map((therapist) => [therapist.id, therapist]));
  }, [therapists]);

  const roomMap = useMemo(() => {
    return new Map(rooms.map((room) => [room.id, room]));
  }, [rooms]);

  const getSessionPatient = (session: TherapySession) =>
    getPatientName(patientMap.get(session.patientId || ""));

  const getSessionTherapist = (session: TherapySession) =>
    getTherapistName(therapistMap.get(session.therapistId || ""));

  const getSessionRoom = (session: TherapySession) =>
    getRoomName(roomMap.get(session.roomId || ""));

  const filteredSessions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return sessions
      .filter((session) => {
        if (
          statusFilter !== "ALL" &&
          session.status !== statusFilter
        ) {
          return false;
        }

        if (
          dateFilter &&
          session.sessionDate !== dateFilter
        ) {
          return false;
        }

        if (!searchValue) return true;

        const searchableText = [
          getSessionPatient(session),
          getSessionTherapist(session),
          getSessionRoom(session),
          session.therapyName,
          session.status,
          session.therapyPlanId,
          session.therapyId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchValue);
      })
      .sort((a, b) => {
        const dateA = `${a.sessionDate || ""} ${a.startTime || ""}`;
        const dateB = `${b.sessionDate || ""} ${b.startTime || ""}`;

        return dateA.localeCompare(dateB);
      });
  }, [
    sessions,
    search,
    statusFilter,
    dateFilter,
    patientMap,
    therapistMap,
    roomMap,
  ]);

  const statistics = useMemo(() => {
    return {
      total: sessions.length,
      planned: sessions.filter((s) => s.status === "PLANNED").length,
      inProgress: sessions.filter((s) => s.status === "IN_PROGRESS").length,
      completed: sessions.filter((s) => s.status === "COMPLETED").length,
      cancelled: sessions.filter((s) => s.status === "CANCELLED").length,
    };
  }, [sessions]);

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
          {/* Header */}
          <div className="mb-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-[#71806F]">
                  Treatment Management
                </p>

                <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#2F3A32]">
                  Therapy Sessions
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Monitor individual therapy sessions, schedules and treatment status.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#E6E1D7] bg-white px-4 py-2.5 text-sm text-[#667164] shadow-sm">
                <CalendarDays size={17} />
                <span>{sessions.length} total sessions</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={<CalendarDays size={19} />}
              label="Total Sessions"
              value={statistics.total}
            />

            <StatCard
              icon={<Clock3 size={19} />}
              label="Planned"
              value={statistics.planned}
            />

            <StatCard
              icon={<AlertCircle size={19} />}
              label="In Progress"
              value={statistics.inProgress}
            />

            <StatCard
              icon={<CheckCircle2 size={19} />}
              label="Completed"
              value={statistics.completed}
            />

            <StatCard
              icon={<X size={19} />}
              label="Cancelled"
              value={statistics.cancelled}
            />
          </div>

          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Filters */}
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search patient, therapy, therapist, room..."
                    className="h-11 w-full rounded-xl border border-gray-200 bg-[#FCFBF8] pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#81917D] focus:ring-2 focus:ring-[#81917D]/10"
                  />
                </div>

                {/* Date */}
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-11 rounded-xl border border-gray-200 bg-[#FCFBF8] pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#81917D] focus:ring-2 focus:ring-[#81917D]/10"
                  />
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as FilterStatus)
                  }
                  className="h-11 rounded-xl border border-gray-200 bg-[#FCFBF8] px-4 text-sm text-gray-700 outline-none focus:border-[#81917D] focus:ring-2 focus:ring-[#81917D]/10"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="SKIPPED">Skipped</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FCFBF8] text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Patient
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Therapy
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Therapist
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Room
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Date / Time
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-16 text-center text-sm text-gray-500"
                      >
                        Loading therapy sessions...
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-16 text-center"
                      >
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F3ED] text-[#71806F]">
                            <CalendarDays size={22} />
                          </div>

                          <p className="text-sm font-medium text-gray-700">
                            No therapy sessions found
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-50 transition hover:bg-[#FCFBF8]"
                      >
                        {/* Patient */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2EC] text-[#647360]">
                              <UserRound size={16} />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#354038]">
                                {getSessionPatient(session)}
                              </p>

                              {session.patientId && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  Patient ID: {session.patientId.slice(-8)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Therapy */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#3E493F]">
                            {session.therapyName || "Unnamed Therapy"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {session.dayNumber
                              ? `Day ${session.dayNumber}`
                              : "Session"}
                            {session.sequenceOrder
                              ? ` • #${session.sequenceOrder}`
                              : ""}
                          </p>
                        </td>

                        {/* Therapist */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Stethoscope
                              size={16}
                              className="text-[#82907D]"
                            />

                            {getSessionTherapist(session)}
                          </div>
                        </td>

                        {/* Room */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DoorOpen
                              size={16}
                              className="text-[#82907D]"
                            />

                            {getSessionRoom(session)}
                          </div>
                        </td>

                        {/* Date / Time */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#3E493F]">
                            {formatDate(session.sessionDate)}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {formatTime(session.startTime)}
                            {session.endTime
                              ? ` – ${formatTime(session.endTime)}`
                              : ""}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              session.status
                            )}`}
                          >
                            {getStatusLabel(session.status)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSession(session)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-[#536052] transition hover:border-[#B6C1B0] hover:bg-[#F5F7F3]"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && filteredSessions.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-600">
                    {filteredSessions.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-600">
                    {sessions.length}
                  </span>{" "}
                  therapy sessions
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Session Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#82907D]">
                  Therapy Session
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#2F3A32]">
                  Session Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Status */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                <div>
                  <p className="text-xs text-gray-400">Current Status</p>

                  <p className="mt-1 text-sm font-medium text-[#3E493F]">
                    {getStatusLabel(selectedSession.status)}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                    selectedSession.status
                  )}`}
                >
                  {getStatusLabel(selectedSession.status)}
                </span>
              </div>

              {/* Patient / Therapy */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#465047]">
                  Session Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Patient"
                    value={getSessionPatient(selectedSession)}
                    icon={<UserRound size={16} />}
                  />

                  <InfoItem
                    label="Therapy"
                    value={selectedSession.therapyName || "—"}
                    icon={<Stethoscope size={16} />}
                  />

                  <InfoItem
                    label="Therapist"
                    value={getSessionTherapist(selectedSession)}
                    icon={<UserRound size={16} />}
                  />

                  <InfoItem
                    label="Room"
                    value={getSessionRoom(selectedSession)}
                    icon={<DoorOpen size={16} />}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#465047]">
                  Schedule
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Session Date"
                    value={formatDate(selectedSession.sessionDate)}
                    icon={<CalendarDays size={16} />}
                  />

                  <InfoItem
                    label="Time"
                    value={`${formatTime(selectedSession.startTime)}${
                      selectedSession.endTime
                        ? ` – ${formatTime(selectedSession.endTime)}`
                        : ""
                    }`}
                    icon={<Clock3 size={16} />}
                  />

                  <InfoItem
                    label="Day Number"
                    value={
                      selectedSession.dayNumber
                        ? `Day ${selectedSession.dayNumber}`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="Sequence"
                    value={
                      selectedSession.sequenceOrder
                        ? `Session #${selectedSession.sequenceOrder}`
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#465047]">
                  Duration
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Planned Duration"
                    value={
                      selectedSession.plannedDurationMinutes
                        ? `${selectedSession.plannedDurationMinutes} minutes`
                        : "—"
                    }
                    icon={<Clock3 size={16} />}
                  />

                  <InfoItem
                    label="Actual Duration"
                    value={
                      selectedSession.actualDurationMinutes
                        ? `${selectedSession.actualDurationMinutes} minutes`
                        : "—"
                    }
                    icon={<Clock3 size={16} />}
                  />
                </div>
              </div>

              {/* IDs */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#465047]">
                  References
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ReferenceItem
                    label="Session ID"
                    value={selectedSession.id}
                  />

                  <ReferenceItem
                    label="Therapy Plan ID"
                    value={selectedSession.therapyPlanId}
                  />

                  <ReferenceItem
                    label="Patient ID"
                    value={selectedSession.patientId}
                  />

                  <ReferenceItem
                    label="Therapy ID"
                    value={selectedSession.therapyId}
                  />
                </div>
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[#465047]">
                    Notes
                  </h3>

                  <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {selectedSession.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 bg-[#FCFBF8] px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F3ED] text-[#687765]">
          {icon}
        </div>

        <span className="text-2xl font-semibold text-[#344037]">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-gray-500">
        {label}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-4">
      <p className="text-xs text-gray-400">{label}</p>

      <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-[#3E493F]">
        {icon && (
          <span className="text-[#82907D]">
            {icon}
          </span>
        )}

        <span>{value}</span>
      </div>
    </div>
  );
}

function ReferenceItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#FCFBF8] p-3">
      <p className="text-[11px] text-gray-400">{label}</p>

      <p className="mt-1 break-all font-mono text-xs text-gray-600">
        {value || "—"}
      </p>
    </div>
  );
}