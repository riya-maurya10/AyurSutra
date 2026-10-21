import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  FileClock,
  Filter,
  Loader2,
  Search,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import apiClient from "../../services/api/client";

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

interface AuditLog {
  id: string;

  userId?: string;
  userName?: string;
  username?: string;
  userEmail?: string;
  userRole?: string;

  action?: string;
  entityType?: string;
  entityId?: string;
  description?: string;

  createdAt?: string;
  timestamp?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
}

type ActionFilter =
  | "ALL"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "STATUS_CHANGE"
  | "READ"
  | "LOGIN"
  | "LOGOUT";

const getArray = <T,>(
  response: ApiResponse<T[]> | T[] | undefined,
): T[] => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
};

const normalize = (value?: string) =>
  (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const formatEntityType = (value?: string) => {
  if (!value) return "System";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
};

const formatAction = (value?: string) => {
  if (!value) return "Activity";

  const labels: Record<string, string> = {
    CREATE: "Created",
    UPDATE: "Updated",
    DELETE: "Deleted",
    ACTIVATE: "Activated",
    DEACTIVATE: "Deactivated",
    STATUS_CHANGE: "Status Changed",
    READ: "Viewed",
    LOGIN: "Logged in",
    LOGOUT: "Logged out",
  };

  return (
    labels[normalize(value)] ??
    formatEntityType(value)
  );
};

const getActionClasses = (action?: string) => {
  switch (normalize(action)) {
    case "CREATE":
      return "bg-[#EAF3EC] text-[#315C46]";

    case "UPDATE":
      return "bg-[#EEF2E8] text-[#63744D]";

    case "DELETE":
      return "bg-[#F9ECE9] text-[#A45B4E]";

    case "ACTIVATE":
      return "bg-[#E8F3EA] text-[#315C46]";

    case "DEACTIVATE":
      return "bg-[#F4ECE8] text-[#9A6254]";

    case "STATUS_CHANGE":
      return "bg-[#EEF2E8] text-[#63744D]";

    case "LOGIN":
      return "bg-[#EDF3F1] text-[#46685A]";

    case "LOGOUT":
      return "bg-[#F2EFE8] text-[#766F62]";

    case "READ":
      return "bg-[#EEF1F3] text-[#65747C]";

    default:
      return "bg-[#F2EFE8] text-[#766F62]";
  }
};

const getTimestamp = (audit: AuditLog) =>
  audit.timestamp ||
  audit.createdAt ||
  audit.updatedAt ||
  "";

const formatDateTime = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

/*
 * IMPORTANT:
 * Resolve the actual user's name from /users using userId.
 *
 * Priority:
 * 1. users.fullName
 * 2. audit.userName
 * 3. audit.username
 * 4. users.email
 * 5. audit.userEmail
 * 6. userId
 */
const getUserName = (
  audit: AuditLog,
  users: User[],
) => {
  const user = audit.userId
    ? users.find(
        (item) => item.id === audit.userId,
      )
    : undefined;

  if (user?.fullName?.trim()) {
    return user.fullName;
  }

  if (audit.userName?.trim()) {
    return audit.userName;
  }

  if (audit.username?.trim()) {
    return audit.username;
  }

  if (user?.email?.trim()) {
    return user.email;
  }

  if (audit.userEmail?.trim()) {
    return audit.userEmail;
  }

  return audit.userId || "System";
};

const getUserEmail = (
  audit: AuditLog,
  users: User[],
) => {
  const user = audit.userId
    ? users.find(
        (item) => item.id === audit.userId,
      )
    : undefined;

  return (
    user?.email ||
    audit.userEmail ||
    ""
  );
};

const getUserRole = (
  audit: AuditLog,
  users: User[],
) => {
  const user = audit.userId
    ? users.find(
        (item) => item.id === audit.userId,
      )
    : undefined;

  return (
    user?.role ||
    audit.userRole ||
    ""
  );
};

export default function AdminAuditHistoryPage() {
  const [auditLogs, setAuditLogs] =
    useState<AuditLog[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [search, setSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState<ActionFilter>("ALL");

  const [entityFilter, setEntityFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("");

  const [selectedAudit, setSelectedAudit] =
    useState<AuditLog | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchAuditHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          auditResponse,
          usersResponse,
        ] = await Promise.all([
          apiClient.get<
            ApiResponse<AuditLog[]> | AuditLog[]
          >("/audit-logs"),

          apiClient.get<
            ApiResponse<User[]> | User[]
          >("/users"),
        ]);

        setAuditLogs(
          getArray(auditResponse.data),
        );

        setUsers(
          getArray(usersResponse.data),
        );
      } catch (err) {
        console.error(
          "Failed to load audit history:",
          err,
        );

        setError(
          "Unable to load audit history. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuditHistory();
  }, []);

  const entityTypes = useMemo(() => {
    const values = new Set<string>();

    auditLogs.forEach((log) => {
      if (log.entityType) {
        values.add(log.entityType);
      }
    });

    return Array.from(values).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return auditLogs
      .filter((log) => {
        // Action filter
        if (
          actionFilter !== "ALL" &&
          normalize(log.action) !==
            actionFilter
        ) {
          return false;
        }

        // Module filter
        if (
          entityFilter !== "ALL" &&
          normalize(log.entityType) !==
            normalize(entityFilter)
        ) {
          return false;
        }

        // Date filter
        if (dateFilter) {
          const logDate =
            formatDateOnly(
              getTimestamp(log),
            );

          if (logDate !== dateFilter) {
            return false;
          }
        }

        // Search
        if (!query) {
          return true;
        }

        const userName =
          getUserName(log, users);

        const userEmail =
          getUserEmail(log, users);

        const userRole =
          getUserRole(log, users);

        const searchableText = [
          userName,
          userEmail,
          userRole,
          log.action,
          log.entityType,
          log.entityId,
          log.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query,
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          getTimestamp(a),
        ).getTime();

        const dateB = new Date(
          getTimestamp(b),
        ).getTime();

        return dateB - dateA;
      });
  }, [
    auditLogs,
    users,
    search,
    actionFilter,
    entityFilter,
    dateFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setEntityFilter("ALL");
    setDateFilter("");
  };

  const hasFilters =
    search.trim() !== "" ||
    actionFilter !== "ALL" ||
    entityFilter !== "ALL" ||
    dateFilter !== "";

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
          <div className="mx-auto max-w-[1450px]">

            {/* Header */}
            <div className="mb-7">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C8B82]">
                Governance & Traceability
              </p>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-[#26362E]">
                    Audit & History
                  </h1>

                  <p className="mt-2 text-sm text-[#718078]">
                    Track important activities and changes across the clinic
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#7D8983]">
                  <FileClock size={16} />

                  <span>
                    {filteredLogs.length} record
                    {filteredLogs.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <section className="mb-6 rounded-2xl border border-[#E5E1D7] bg-white p-4 shadow-[0_5px_20px_rgba(48,64,55,0.035)]">
              <div className="flex flex-col gap-3 xl:flex-row">

                {/* Search */}
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87928C]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search user, email, action, module, entity or description..."
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#FCFBF8] pl-10 pr-4 text-sm text-[#3E4C45] outline-none transition placeholder:text-[#A0A8A3] focus:border-[#315C46] focus:bg-white"
                  />
                </div>

                {/* Action */}
                <div className="relative">
                  <Activity
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#87928C]"
                  />

                  <select
                    value={actionFilter}
                    onChange={(e) =>
                      setActionFilter(
                        e.target.value as ActionFilter,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-[#E3E0D6] bg-[#FCFBF8] pl-9 pr-9 text-sm font-medium text-[#46544D] outline-none focus:border-[#315C46] xl:w-[170px]"
                  >
                    <option value="ALL">
                      All Actions
                    </option>

                    <option value="CREATE">
                      Created
                    </option>

                    <option value="UPDATE">
                      Updated
                    </option>

                    <option value="DELETE">
                      Deleted
                    </option>

                    <option value="ACTIVATE">
                      Activated
                    </option>

                    <option value="DEACTIVATE">
                      Deactivated
                    </option>

                    <option value="STATUS_CHANGE">
                      Status Changed
                    </option>

                    <option value="READ">
                      Viewed
                    </option>

                    <option value="LOGIN">
                      Login
                    </option>

                    <option value="LOGOUT">
                      Logout
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#87928C]"
                  />
                </div>

                {/* Module */}
                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#87928C]"
                  />

                  <select
                    value={entityFilter}
                    onChange={(e) =>
                      setEntityFilter(
                        e.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-[#E3E0D6] bg-[#FCFBF8] pl-9 pr-9 text-sm font-medium text-[#46544D] outline-none focus:border-[#315C46] xl:w-[180px]"
                  >
                    <option value="ALL">
                      All Modules
                    </option>

                    {entityTypes.map(
                      (entity) => (
                        <option
                          key={entity}
                          value={entity}
                        >
                          {formatEntityType(
                            entity,
                          )}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#87928C]"
                  />
                </div>

                {/* Date */}
                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#87928C]"
                  />

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(
                        e.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#FCFBF8] pl-9 pr-3 text-sm font-medium text-[#46544D] outline-none focus:border-[#315C46] xl:w-[165px]"
                  />
                </div>

                {/* Clear */}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E3E0D6] bg-white px-4 text-sm font-medium text-[#69766F] transition hover:border-[#315C46] hover:text-[#315C46]"
                  >
                    <X size={15} />
                    Clear
                  </button>
                )}
              </div>
            </section>

            {/* Content */}
            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-[#E5E1D7] bg-white">
                <div className="flex flex-col items-center gap-3 text-[#718078]">
                  <Loader2
                    size={28}
                    className="animate-spin text-[#315C46]"
                  />

                  <p className="text-sm">
                    Loading audit history...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[#E8D4D0] bg-white p-10 text-center">
                <p className="text-sm font-medium text-[#A45B4E]">
                  {error}
                </p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E1D7] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4EE] text-[#315C46]">
                  <FileClock size={22} />
                </div>

                <h2 className="mt-4 text-base font-semibold text-[#34443C]">
                  No audit records found
                </h2>

                <p className="mx-auto mt-1 max-w-md text-sm text-[#849089]">
                  {hasFilters
                    ? "Try changing or clearing the filters."
                    : "No audit activity has been recorded yet."}
                </p>
              </div>
            ) : (
              <section className="overflow-hidden rounded-2xl border border-[#E5E1D7] bg-white shadow-[0_5px_20px_rgba(48,64,55,0.035)]">

                {/* Desktop header */}
                <div className="hidden grid-cols-[1.25fr_1fr_1fr_1.7fr_180px] gap-5 border-b border-[#ECE9E1] bg-[#FBFAF7] px-6 py-4 lg:grid">
                  <HeaderCell>
                    USER
                  </HeaderCell>

                  <HeaderCell>
                    ACTION
                  </HeaderCell>

                  <HeaderCell>
                    MODULE
                  </HeaderCell>

                  <HeaderCell>
                    DESCRIPTION
                  </HeaderCell>

                  <HeaderCell align="right">
                    DATE & TIME
                  </HeaderCell>
                </div>

                <div>
                  {filteredLogs.map(
                    (log) => {
                      const userName =
                        getUserName(
                          log,
                          users,
                        );

                      const userEmail =
                        getUserEmail(
                          log,
                          users,
                        );

                      const role =
                        getUserRole(
                          log,
                          users,
                        );

                      return (
                        <button
                          key={log.id}
                          type="button"
                          onClick={() =>
                            setSelectedAudit(
                              log,
                            )
                          }
                          className="group block w-full border-b border-[#F0EEE8] px-5 py-5 text-left transition last:border-0 hover:bg-[#FCFBF8] lg:px-6"
                        >
                          {/* Desktop */}
                          <div className="hidden grid-cols-[1.25fr_1fr_1fr_1.7fr_180px] items-center gap-5 lg:grid">

                            {/* USER */}
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4EE] text-[#315C46]">
                                <UserRound
                                  size={16}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#3D4C44]">
                                  {userName}
                                </p>

                                {userEmail && (
                                  <p className="mt-0.5 truncate text-[11px] text-[#8B958F]">
                                    {userEmail}
                                  </p>
                                )}

                                {role && (
                                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#929B96]">
                                    {role}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* ACTION */}
                            <div>
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getActionClasses(
                                  log.action,
                                )}`}
                              >
                                {formatAction(
                                  log.action,
                                )}
                              </span>
                            </div>

                            {/* MODULE */}
                            <div>
                              <p className="text-sm font-medium text-[#46554D]">
                                {formatEntityType(
                                  log.entityType,
                                )}
                              </p>

                              {log.entityId && (
                                <p className="mt-0.5 truncate font-mono text-[10px] text-[#98A09B]">
                                  {log.entityId}
                                </p>
                              )}
                            </div>

                            {/* DESCRIPTION */}
                            <div className="min-w-0">
                              <p className="truncate text-sm text-[#68766E]">
                                {log.description ||
                                  "—"}
                              </p>
                            </div>

                            {/* DATE */}
                            <div className="flex items-center justify-end gap-3">
                              <div className="text-right">
                                <p className="text-xs font-medium text-[#56645D]">
                                  {formatDateTime(
                                    getTimestamp(
                                      log,
                                    ),
                                  )}
                                </p>
                              </div>

                              <Eye
                                size={16}
                                className="text-[#9BA49F] transition group-hover:text-[#315C46]"
                              />
                            </div>
                          </div>

                          {/* Mobile */}
                          <div className="lg:hidden">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4EE] text-[#315C46]">
                                  <UserRound
                                    size={16}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#3D4C44]">
                                    {userName}
                                  </p>

                                  {userEmail && (
                                    <p className="mt-0.5 truncate text-[11px] text-[#8B958F]">
                                      {userEmail}
                                    </p>
                                  )}

                                  {role && (
                                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#929B96]">
                                      {role}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${getActionClasses(
                                  log.action,
                                )}`}
                              >
                                {formatAction(
                                  log.action,
                                )}
                              </span>
                            </div>

                            <div className="mt-4">
                              <p className="text-sm font-medium text-[#46554D]">
                                {formatEntityType(
                                  log.entityType,
                                )}
                              </p>

                              <p className="mt-1 text-sm leading-5 text-[#68766E]">
                                {log.description ||
                                  "—"}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-[#F0EEE8] pt-3">
                              <span className="flex items-center gap-1.5 text-xs text-[#89938E]">
                                <Clock3
                                  size={13}
                                />

                                {formatDateTime(
                                  getTimestamp(
                                    log,
                                  ),
                                )}
                              </span>

                              <span className="flex items-center gap-1 text-xs font-medium text-[#315C46]">
                                View details
                                <Eye
                                  size={14}
                                />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D2B24]/35 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2DED4] bg-white shadow-[0_25px_80px_rgba(30,45,37,0.18)]">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#ECE9E1] px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A958F]">
                  Audit Record
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#304139]">
                  {formatAction(
                    selectedAudit.action,
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAudit(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7E8983] transition hover:bg-[#F3F1EA] hover:text-[#315C46]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">

              {/* User */}
              <div className="rounded-xl bg-[#F7F7F1] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2EB] text-[#315C46]">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3D4C44]">
                      {getUserName(
                        selectedAudit,
                        users,
                      )}
                    </p>

                    {getUserEmail(
                      selectedAudit,
                      users,
                    ) && (
                      <p className="mt-0.5 truncate text-xs text-[#718078]">
                        {getUserEmail(
                          selectedAudit,
                          users,
                        )}
                      </p>
                    )}

                    {getUserRole(
                      selectedAudit,
                      users,
                    ) && (
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8B958F]">
                        {getUserRole(
                          selectedAudit,
                          users,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Action"
                  value={formatAction(
                    selectedAudit.action,
                  )}
                  badge={
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionClasses(
                        selectedAudit.action,
                      )}`}
                    >
                      {formatAction(
                        selectedAudit.action,
                      )}
                    </span>
                  }
                />

                <DetailItem
                  label="Module"
                  value={formatEntityType(
                    selectedAudit.entityType,
                  )}
                />

                <DetailItem
                  label="Entity ID"
                  value={
                    selectedAudit.entityId ||
                    "—"
                  }
                  mono
                />

                <DetailItem
                  label="Date & Time"
                  value={formatDateTime(
                    getTimestamp(
                      selectedAudit,
                    ),
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A958F]">
                  Description
                </p>

                <div className="rounded-xl border border-[#E9E6DE] bg-[#FBFAF7] px-4 py-4">
                  <p className="text-sm leading-6 text-[#59675F]">
                    {selectedAudit.description ||
                      "No description available."}
                  </p>
                </div>
              </div>

              {/* User ID */}
              {selectedAudit.userId && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A958F]">
                    User ID
                  </p>

                  <p className="rounded-xl bg-[#F7F6F0] px-4 py-3 font-mono text-xs text-[#68766E]">
                    {selectedAudit.userId}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#ECE9E1] px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedAudit(null)
                }
                className="ml-auto block rounded-xl bg-[#315C46] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#274B39]"
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

function HeaderCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <p
      className={`text-[10px] font-semibold tracking-[0.14em] text-[#8A958F] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function DetailItem({
  label,
  value,
  badge,
  mono = false,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#E9E6DE] bg-[#FBFAF7] px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8A958F]">
        {label}
      </p>

      {badge ? (
        <div className="mt-2">
          {badge}
        </div>
      ) : (
        <p
          className={`mt-1.5 text-sm font-medium text-[#45534B] ${
            mono
              ? "font-mono text-xs"
              : ""
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}