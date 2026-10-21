import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DoorOpen,
  Eye,
  Search,
  Stethoscope,
  UserRound,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
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
  fullName?: string;
  name?: string;
  email?: string;
}

interface Therapist {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

interface Room {
  id: string;
  roomNumber?: string;
  name?: string;
  roomName?: string;
  type?: string;
  capacity?: number;
  description?: string;
  status?: string;
  active?: boolean;
}

type ViewMode = "day" | "week";

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
};

const getToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value?: string) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: string) => {
  const date = parseDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLongDate = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortDay = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
  });
};

const formatDayNumber = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
  });
};

const formatMonthDay = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const formatTime = (time?: string) => {
  if (!time) return "—";

  const parts = time.split(":");

  if (parts.length < 2) return time;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const timeToMinutes = (time?: string) => {
  if (!time) return 0;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours)) return 0;

  return hours * 60 + (minutes || 0);
};

const getPatientName = (
  patientId: string | undefined,
  patients: Patient[],
) => {
  const patient = patients.find((item) => item.id === patientId);

  return patient?.fullName || patient?.name || "Unknown Patient";
};

const getTherapistName = (
  therapistId: string | undefined,
  therapists: Therapist[],
) => {
  const therapist = therapists.find((item) => item.id === therapistId);

  return therapist?.fullName || therapist?.name || "Unassigned";
};

const getRoomName = (roomId: string | undefined, rooms: Room[]) => {
  const room = rooms.find((item) => item.id === roomId);

  return room?.roomNumber || room?.roomName || room?.name || "Unassigned";
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "PLANNED":
      return "Scheduled";
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
    case "NO_SHOW":
      return "No Show";
    default:
      return status || "Scheduled";
  }
};

const getStatusClass = (status?: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "SKIPPED":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-700 border-orange-200";

    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusDot = (status?: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500";

    case "IN_PROGRESS":
      return "bg-blue-500";

    case "CANCELLED":
      return "bg-red-500";

    case "SKIPPED":
      return "bg-amber-500";

    case "NO_SHOW":
      return "bg-orange-500";

    default:
      return "bg-slate-400";
  }
};

const getWeekStart = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
};

const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);

  return result;
};

const isSameDate = (dateA: Date, dateB: Date) => {
  return toDateString(dateA) === toDateString(dateB);
};

const getSessionDuration = (session: TherapySession) => {
  if (session.plannedDurationMinutes) {
    return session.plannedDurationMinutes;
  }

  if (session.startTime && session.endTime) {
    const duration =
      timeToMinutes(session.endTime) - timeToMinutes(session.startTime);

    return duration > 0 ? duration : 30;
  }

  return 30;
};

const getSessionDateTime = (session: TherapySession) => {
  if (!session.sessionDate) return null;

  const time = session.startTime || "00:00:00";

  return new Date(`${session.sessionDate}T${time}`);
};

const sessionOverlaps = (
  first: TherapySession,
  second: TherapySession,
) => {
  if (!first.sessionDate || !second.sessionDate) return false;

  if (first.sessionDate !== second.sessionDate) return false;

  const firstStart = timeToMinutes(first.startTime);
  const firstEnd =
    timeToMinutes(first.endTime) ||
    firstStart + getSessionDuration(first);

  const secondStart = timeToMinutes(second.startTime);
  const secondEnd =
    timeToMinutes(second.endTime) ||
    secondStart + getSessionDuration(second);

  return firstStart < secondEnd && secondStart < firstEnd;
};

export default function AdminSchedulesPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(getToday());

  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const [searchQuery, setSearchQuery] = useState("");
  const [therapistFilter, setTherapistFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedSession, setSelectedSession] =
    useState<TherapySession | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          sessionsResponse,
          patientsResponse,
          therapistsResponse,
          roomsResponse,
        ] = await Promise.all([
          apiClient.get("/therapy-sessions"),
          apiClient.get("/patients"),
          apiClient.get("/therapists"),
          apiClient.get("/rooms"),
        ]);

        setSessions(normalizeList<TherapySession>(sessionsResponse.data));
        setPatients(normalizeList<Patient>(patientsResponse.data));
        setTherapists(normalizeList<Therapist>(therapistsResponse.data));
        setRooms(normalizeList<Room>(roomsResponse.data));
      } catch (error) {
        console.error("Failed to fetch schedule data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = useMemo(() => getToday(), []);

  const weekStart = useMemo(
    () => getWeekStart(selectedDate),
    [selectedDate],
  );

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index),
    );
  }, [weekStart]);

  const goPrevious = () => {
    setSelectedDate((current) =>
      addDays(current, viewMode === "day" ? -1 : -7),
    );
  };

  const goNext = () => {
    setSelectedDate((current) =>
      addDays(current, viewMode === "day" ? 1 : 7),
    );
  };

  const goToday = () => {
    setSelectedDate(getToday());
  };

  const matchesFilters = (session: TherapySession) => {
    const query = searchQuery.trim().toLowerCase();

    const patientName = getPatientName(session.patientId, patients);
    const therapistName = getTherapistName(
      session.therapistId,
      therapists,
    );
    const roomName = getRoomName(session.roomId, rooms);

    const searchMatch =
      !query ||
      patientName.toLowerCase().includes(query) ||
      therapistName.toLowerCase().includes(query) ||
      roomName.toLowerCase().includes(query) ||
      (session.therapyName || "").toLowerCase().includes(query);

    const therapistMatch =
      !therapistFilter ||
      session.therapistId === therapistFilter;

    const roomMatch =
      !roomFilter || session.roomId === roomFilter;

    const statusMatch =
      !statusFilter || session.status === statusFilter;

    return (
      searchMatch &&
      therapistMatch &&
      roomMatch &&
      statusMatch
    );
  };

  const filteredSessions = useMemo(() => {
    return sessions
      .filter(matchesFilters)
      .sort((a, b) => {
        const dateA = `${a.sessionDate || ""} ${a.startTime || ""
          }`;

        const dateB = `${b.sessionDate || ""} ${b.startTime || ""
          }`;

        return dateA.localeCompare(dateB);
      });
  }, [
    sessions,
    patients,
    therapists,
    rooms,
    searchQuery,
    therapistFilter,
    roomFilter,
    statusFilter,
  ]);

  const daySessions = useMemo(() => {
    const selectedDateString = toDateString(selectedDate);

    return filteredSessions.filter(
      (session) => session.sessionDate === selectedDateString,
    );
  }, [filteredSessions, selectedDate]);

  const weekSessions = useMemo(() => {
    const start = toDateString(weekStart);
    const end = toDateString(addDays(weekStart, 6));

    return filteredSessions.filter((session) => {
      if (!session.sessionDate) return false;

      return (
        session.sessionDate >= start &&
        session.sessionDate <= end
      );
    });
  }, [filteredSessions, weekStart]);

  const getConflicts = (session: TherapySession) => {
    const overlappingSessions = sessions.filter((other) => {
      if (other.id === session.id) return false;

      return sessionOverlaps(session, other);
    });

    // ---------------------------------------------------------
    // 1. Therapist conflict
    // Same therapist cannot handle two sessions simultaneously.
    // ---------------------------------------------------------
    const therapistConflicts = overlappingSessions.filter(
      (other) =>
        Boolean(session.therapistId) &&
        Boolean(other.therapistId) &&
        session.therapistId === other.therapistId,
    );

    // ---------------------------------------------------------
    // 2. Room capacity conflict
    // A room can have multiple simultaneous sessions depending
    // on its number of beds/capacity.
    //
    // Example:
    // Capacity = 3
    // 2 other overlapping sessions + current session = 3
    // => Allowed
    //
    // Capacity = 3
    // 3 other overlapping sessions + current session = 4
    // => Conflict
    // ---------------------------------------------------------
    const roomOverlaps = overlappingSessions.filter(
      (other) =>
        Boolean(session.roomId) &&
        Boolean(other.roomId) &&
        session.roomId === other.roomId,
    );

    const room = rooms.find((item) => item.id === session.roomId);

    // If capacity is missing, safely fall back to 1.
    const roomCapacity = Math.max(1, room?.capacity ?? 1);

    const roomCapacityExceeded =
      Boolean(session.roomId) &&
      roomOverlaps.length + 1 > roomCapacity;

    // Return the sessions responsible for the conflict.
    // Therapist conflicts are always conflicts.
    // Room sessions are conflicts only when room capacity is exceeded.
    if (roomCapacityExceeded) {
      return Array.from(
        new Map(
          [...therapistConflicts, ...roomOverlaps].map((item) => [
            item.id,
            item,
          ]),
        ).values(),
      );
    }

    return therapistConflicts;
  };

  const getConflictDetails = (session: TherapySession) => {
    const overlappingSessions = sessions.filter((other) => {
      if (other.id === session.id) return false;

      return sessionOverlaps(session, other);
    });

    const therapistConflicts = overlappingSessions.filter(
      (other) =>
        Boolean(session.therapistId) &&
        Boolean(other.therapistId) &&
        session.therapistId === other.therapistId,
    );

    const roomOverlaps = overlappingSessions.filter(
      (other) =>
        Boolean(session.roomId) &&
        Boolean(other.roomId) &&
        session.roomId === other.roomId,
    );

    const room = rooms.find((item) => item.id === session.roomId);

    const roomCapacity = Math.max(1, room?.capacity ?? 1);

    const roomCapacityExceeded =
      Boolean(session.roomId) &&
      roomOverlaps.length + 1 > roomCapacity;

    return {
      therapistConflicts,
      roomOverlaps,
      roomCapacity: room?.capacity ?? 1,
      roomCapacityExceeded,
    };
  };

  const totalToday = useMemo(() => {
    const date = toDateString(today);

    return sessions.filter(
      (session) => session.sessionDate === date,
    ).length;
  }, [sessions, today]);

  const completedToday = useMemo(() => {
    const date = toDateString(today);

    return sessions.filter(
      (session) =>
        session.sessionDate === date &&
        session.status === "COMPLETED",
    ).length;
  }, [sessions, today]);

  const inProgressToday = useMemo(() => {
    const date = toDateString(today);

    return sessions.filter(
      (session) =>
        session.sessionDate === date &&
        session.status === "IN_PROGRESS",
    ).length;
  }, [sessions, today]);

  const availableRooms = useMemo(() => {
    return rooms.filter(
      (room) =>
        !room.status ||
        room.status === "AVAILABLE" ||
        room.status === "ACTIVE",
    ).length;
  }, [rooms]);

  const scheduleTitle =
    viewMode === "day"
      ? formatLongDate(selectedDate)
      : `${formatMonthDay(weekStart)} – ${formatMonthDay(
        addDays(weekStart, 6),
      )}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <Topbar
          title="Admin Portal"
          userName="Riya Maurya"
          role="ADMIN"
        />

        <main className="flex-1 p-5 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <CalendarDays className="h-6 w-6 text-emerald-700" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Schedules
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    View the clinic timetable, room usage and
                    therapist schedules.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={goToday}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <CalendarDays className="h-4 w-4" />
              Today
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Today&apos;s Sessions
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {totalToday}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-3">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Completed Today
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {completedToday}
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    In Progress
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {inProgressToday}
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 p-3">
                  <Clock3 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Available Rooms
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {availableRooms}
                  </p>
                </div>

                <div className="rounded-lg bg-purple-50 p-3">
                  <DoorOpen className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search patient, therapy, therapist or room..."
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* Therapist */}
                <select
                  value={therapistFilter}
                  onChange={(event) =>
                    setTherapistFilter(event.target.value)
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">All Therapists</option>

                  {therapists.map((therapist) => (
                    <option
                      key={therapist.id}
                      value={therapist.id}
                    >
                      {therapist.fullName ||
                        therapist.name ||
                        "Unknown"}
                    </option>
                  ))}
                </select>

                {/* Room */}
                <select
                  value={roomFilter}
                  onChange={(event) =>
                    setRoomFilter(event.target.value)
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">All Rooms</option>

                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber ||
                        room.roomName ||
                        room.name ||
                        "Room"}
                    </option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">All Statuses</option>
                  <option value="PLANNED">Scheduled</option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="SKIPPED">Skipped</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => setViewMode("day")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${viewMode === "day"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <List className="h-4 w-4" />
                  Day
                </button>

                <button
                  onClick={() => setViewMode("week")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${viewMode === "week"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Week
                </button>
              </div>
            </div>
          </div>

          {/* Calendar navigation */}
          <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={goPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {scheduleTitle}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {viewMode === "day"
                  ? `${daySessions.length} scheduled session${daySessions.length === 1 ? "" : "s"
                  }`
                  : `${weekSessions.length} scheduled session${weekSessions.length === 1 ? "" : "s"
                  }`}
              </p>
            </div>

            <button
              onClick={goNext}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                <p className="text-sm text-slate-500">
                  Loading schedule...
                </p>
              </div>
            </div>
          ) : viewMode === "day" ? (
            /* ==================== DAY VIEW ==================== */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Daily Timeline
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Clinic activities scheduled for this day
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                    {daySessions.length} sessions
                  </span>
                </div>
              </div>

              {daySessions.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 rounded-full bg-slate-100 p-4">
                    <CalendarDays className="h-7 w-7 text-slate-400" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-800">
                    No sessions scheduled
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    There are no therapy sessions matching the
                    selected filters for this date.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {daySessions.map((session) => {
                    const conflicts = getConflicts(session);

                    return (
                      <div
                        key={session.id}
                        className="flex gap-4 px-5 py-4 transition hover:bg-slate-50"
                      >
                        {/* Time */}
                        <div className="w-24 shrink-0 pt-1 text-right">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatTime(session.startTime)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(session.endTime)}
                          </p>
                        </div>

                        {/* Timeline */}
                        <div className="relative flex w-5 shrink-0 justify-center">
                          <div className="absolute bottom-0 top-0 w-px bg-slate-200" />

                          <div
                            className={`relative z-10 mt-1 h-3 w-3 rounded-full ring-4 ring-white ${getStatusDot(
                              session.status,
                            )}`}
                          />
                        </div>

                        {/* Schedule card */}
                        <div className="min-w-0 flex-1">
                          <div
                            className={`rounded-xl border p-4 ${conflicts.length > 0
                                ? "border-amber-300 bg-amber-50/40"
                                : "border-slate-200 bg-white"
                              }`}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-slate-900">
                                    {session.therapyName ||
                                      "Therapy Session"}
                                  </h3>

                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                      session.status,
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      session.status,
                                    )}
                                  </span>

                                  {conflicts.length > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                      <AlertTriangle className="h-3 w-3" />
                                      Conflict
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                  <div className="flex items-center gap-2">
                                    <UserRound className="h-4 w-4 text-slate-400" />

                                    <div>
                                      <p className="text-[11px] text-slate-400">
                                        Patient
                                      </p>

                                      <p className="text-sm font-medium text-slate-700">
                                        {getPatientName(
                                          session.patientId,
                                          patients,
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-slate-400" />

                                    <div>
                                      <p className="text-[11px] text-slate-400">
                                        Therapist
                                      </p>

                                      <p className="text-sm font-medium text-slate-700">
                                        {getTherapistName(
                                          session.therapistId,
                                          therapists,
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <DoorOpen className="h-4 w-4 text-slate-400" />

                                    <div>
                                      <p className="text-[11px] text-slate-400">
                                        Room
                                      </p>

                                      <p className="text-sm font-medium text-slate-700">
                                        {getRoomName(
                                          session.roomId,
                                          rooms,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  setSelectedSession(session)
                                }
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ==================== WEEK VIEW ==================== */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-7 border-b border-slate-200">
                {weekDates.map((date) => {
                  const dateString = toDateString(date);

                  const dateSessions = weekSessions.filter(
                    (session) =>
                      session.sessionDate === dateString,
                  );

                  const selected = isSameDate(date, selectedDate);
                  const current = isSameDate(date, today);

                  return (
                    <button
                      key={dateString}
                      onClick={() => {
                        setSelectedDate(date);
                        setViewMode("day");
                      }}
                      className={`min-w-0 border-r border-slate-200 p-3 text-center transition last:border-r-0 ${selected
                          ? "bg-emerald-50"
                          : "hover:bg-slate-50"
                        }`}
                    >
                      <p className="text-xs font-medium uppercase text-slate-400">
                        {formatShortDay(date)}
                      </p>

                      <div
                        className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${current
                            ? "bg-emerald-600 text-white"
                            : selected
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-slate-800"
                          }`}
                      >
                        {formatDayNumber(date)}
                      </div>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {dateSessions.length} session
                        {dateSessions.length === 1 ? "" : "s"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-7 divide-x divide-slate-200">
                {weekDates.map((date) => {
                  const dateString = toDateString(date);

                  const dateSessions = weekSessions.filter(
                    (session) =>
                      session.sessionDate === dateString,
                  );

                  return (
                    <div
                      key={dateString}
                      className="min-h-[500px] bg-white p-2"
                    >
                      {dateSessions.length === 0 ? (
                        <div className="flex h-full min-h-[480px] items-center justify-center">
                          <span className="text-xs text-slate-300">
                            No sessions
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dateSessions.map((session) => {
                            const conflicts =
                              getConflicts(session);

                            return (
                              <button
                                key={session.id}
                                onClick={() =>
                                  setSelectedSession(session)
                                }
                                className={`w-full rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${conflicts.length > 0
                                    ? "border-amber-300 bg-amber-50"
                                    : "border-slate-200 bg-slate-50 hover:bg-white"
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {formatTime(
                                      session.startTime,
                                    )}
                                  </span>

                                  <span
                                    className={`h-2 w-2 rounded-full ${getStatusDot(
                                      session.status,
                                    )}`}
                                  />
                                </div>

                                <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">
                                  {session.therapyName ||
                                    "Therapy Session"}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {getPatientName(
                                    session.patientId,
                                    patients,
                                  )}
                                </p>

                                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                                  <DoorOpen className="h-3 w-3" />

                                  {getRoomName(
                                    session.roomId,
                                    rooms,
                                  )}
                                </div>

                                {conflicts.length > 0 && (
                                  <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-700">
                                    <AlertTriangle className="h-3 w-3" />
                                    Scheduling conflict
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-600">
              Status:
            </span>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              Scheduled
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              In Progress
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Completed
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Cancelled
            </div>

            <div className="ml-auto flex items-center gap-2 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              Scheduling conflict
            </div>
          </div>
        </main>
      </div>

      {/* ==================== VIEW SCHEDULE MODAL ==================== */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Schedule Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedSession.therapyName ||
                    "Therapy Session"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                    selectedSession.status,
                  )}`}
                >
                  {getStatusLabel(selectedSession.status)}
                </span>

                {getConflicts(selectedSession).length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Scheduling Conflict
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserRound className="h-4 w-4" />

                    <span className="text-xs">
                      Patient
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {getPatientName(
                      selectedSession.patientId,
                      patients,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Stethoscope className="h-4 w-4" />

                    <span className="text-xs">
                      Therapist
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {getTherapistName(
                      selectedSession.therapistId,
                      therapists,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <DoorOpen className="h-4 w-4" />

                    <span className="text-xs">
                      Room
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {getRoomName(
                      selectedSession.roomId,
                      rooms,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock3 className="h-4 w-4" />

                    <span className="text-xs">
                      Time
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatTime(selectedSession.startTime)}
                    {" – "}
                    {formatTime(selectedSession.endTime)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Scheduled Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(selectedSession.sessionDate)}
                </p>
              </div>

              {getConflicts(selectedSession).length > 0 && (
                (() => {
                  const conflictDetails = getConflictDetails(selectedSession);

                  return (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-amber-800">
                            Scheduling conflict detected
                          </p>

                          {conflictDetails.therapistConflicts.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-amber-800">
                                Therapist conflict
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-700">
                                {getTherapistName(
                                  selectedSession.therapistId,
                                  therapists,
                                )}{" "}
                                is already assigned to another session during this time.
                              </p>
                            </div>
                          )}

                          {conflictDetails.roomCapacityExceeded && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-amber-800">
                                Room capacity exceeded
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-700">
                                {getRoomName(selectedSession.roomId, rooms)} has{" "}
                                {conflictDetails.roomCapacity} beds, but{" "}
                                {conflictDetails.roomOverlaps.length + 1} sessions
                                overlap during this time.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}