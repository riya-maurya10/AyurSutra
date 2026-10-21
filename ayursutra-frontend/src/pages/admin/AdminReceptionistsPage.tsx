import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Mail,
  Phone,
  Plus,
  Power,
  PowerOff,
  Search,
  UserRound,
  X,
} from "lucide-react";

import apiClient from "../../services/api/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
}

interface ReceptionistForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const emptyForm: ReceptionistForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
};

const getInitials = (name: string) => {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R"
  );
};

const getUsersFromResponse = (response: any): User[] => {
  return response?.data?.data ?? response?.data ?? [];
};

const AdminReceptionistsPage = () => {
  const [receptionists, setReceptionists] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedReceptionist, setSelectedReceptionist] =
    useState<User | null>(null);

  const [form, setForm] = useState<ReceptionistForm>(emptyForm);

  /* =========================================================
     FETCH RECEPTIONISTS
  ========================================================= */

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/users");

      const users = getUsersFromResponse(response);

      const receptionistUsers = users.filter(
        (user: User) =>
          user.role?.toUpperCase() === "RECEPTIONIST"
      );

      setReceptionists(receptionistUsers);
    } catch (err: any) {
      console.error("Failed to fetch receptionists:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load receptionists."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredReceptionists = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return receptionists;
    }

    return receptionists.filter((receptionist) => {
      return (
        receptionist.fullName
          ?.toLowerCase()
          .includes(query) ||
        receptionist.email
          ?.toLowerCase()
          .includes(query) ||
        receptionist.phone
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [receptionists, search]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalReceptionists = receptionists.length;

  const activeReceptionists = receptionists.filter(
    (receptionist) => receptionist.enabled !== false
  ).length;

  const inactiveReceptionists = receptionists.filter(
    (receptionist) => receptionist.enabled === false
  ).length;

  /* =========================================================
     FORM
  ========================================================= */

  const openAddForm = () => {
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setForm(emptyForm);
  };

  const handleFormChange = (
    field: keyof ReceptionistForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =========================================================
     ADD RECEPTIONIST
  ========================================================= */

  const handleAddReceptionist = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);

      await apiClient.post("/users/register", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "RECEPTIONIST",
      });

      setSuccess("Receptionist added successfully.");

      setShowForm(false);
      setForm(emptyForm);

      await fetchReceptionists();
    } catch (err: any) {
      console.error("Failed to add receptionist:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to add receptionist."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  const handleAccountStatus = async (
    receptionist: User
  ) => {
    try {
      setError("");
      setSuccess("");

      const action =
        receptionist.enabled === false
          ? "activate"
          : "deactivate";

      await apiClient.put(
        `/users/${receptionist.id}/${action}`
      );

      setSuccess(
        receptionist.enabled === false
          ? "Receptionist account activated successfully."
          : "Receptionist account deactivated successfully."
      );

      if (
        selectedReceptionist &&
        selectedReceptionist.id === receptionist.id
      ) {
        setSelectedReceptionist({
          ...receptionist,
          enabled: receptionist.enabled === false,
        });
      }

      await fetchReceptionists();
    } catch (err: any) {
      console.error(
        "Failed to update receptionist account:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update account status."
      );
    }
  };

  /* =========================================================
     STATUS HELPERS
  ========================================================= */

  const getAccountStatus = (receptionist: User) => {
    return receptionist.enabled === false
      ? "Inactive"
      : "Active";
  };

  const getAccountStatusClasses = (receptionist: User) => {
    return receptionist.enabled === false
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  /* =========================================================
     VIEW
  ========================================================= */

  const openView = (receptionist: User) => {
    setSelectedReceptionist(receptionist);
    setError("");
    setSuccess("");
    setShowView(true);
  };

  const closeView = () => {
    setShowView(false);
    setSelectedReceptionist(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <Sidebar role="ADMIN" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <Topbar
          title="Admin Portal"
          userName={
            localStorage.getItem("userFullName") || "User"
          }
          role={
            localStorage.getItem("userRole") || "ADMIN"
          }
        />

        <main className="flex-1 p-5 md:p-8">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#2F3A32] md:text-4xl">
                Receptionists
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage receptionist accounts and access.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#557A5A] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#47694C]"
            >
              <Plus className="h-4 w-4" />
              Add Receptionist
            </button>
          </div>

          {/* =================================================
              SUCCESS / ERROR
          ================================================= */}

          {success && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="rounded-lg p-1 text-emerald-600 transition hover:bg-emerald-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 text-red-600 transition hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Receptionists
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {totalReceptionists}
                  </p>
                </div>

                <div className="rounded-xl bg-[#EAF2EA] p-3 text-[#557A5A]">
                  <UsersIcon />
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Active Accounts
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {activeReceptionists}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Power className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Inactive */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Inactive Accounts
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {inactiveReceptionists}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <PowerOff className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search receptionists..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
              />
            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center px-6 py-16">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#557A5A]" />
                  Loading receptionists...
                </div>
              </div>
            ) : filteredReceptionists.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 rounded-full bg-[#EAF2EA] p-4 text-[#557A5A]">
                  <UserRound className="h-7 w-7" />
                </div>

                <h3 className="text-base font-semibold text-[#2F3A32]">
                  {search
                    ? "No receptionists found"
                    : "No receptionists yet"}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  {search
                    ? "Try changing your search term."
                    : "Add a receptionist to manage front-desk access."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#557A5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#47694C]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Receptionist
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FBFAF7] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Receptionist
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Account Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReceptionists.map(
                      (receptionist) => (
                        <tr
                          key={receptionist.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-[#FCFBF8]"
                        >
                          {/* Receptionist */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF2EA] text-sm font-semibold text-[#557A5A]">
                                {getInitials(
                                  receptionist.fullName
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-[#2F3A32]">
                                  {receptionist.fullName}
                                </p>

                                <p className="truncate text-xs text-gray-500">
                                  ID: {receptionist.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                {receptionist.email}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                {receptionist.phone}
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-[#EAF2EA] px-3 py-1 text-xs font-medium text-[#557A5A]">
                              Receptionist
                            </span>
                          </td>

                          {/* Account Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAccountStatusClasses(
                                receptionist
                              )}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  receptionist.enabled === false
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                }`}
                              />

                              {getAccountStatus(
                                receptionist
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* View */}
                              <button
                                type="button"
                                onClick={() =>
                                  openView(receptionist)
                                }
                                title="View receptionist"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* Activate / Deactivate */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleAccountStatus(
                                    receptionist
                                  )
                                }
                                title={
                                  receptionist.enabled === false
                                    ? "Activate receptionist"
                                    : "Deactivate receptionist"
                                }
                                className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  receptionist.enabled === false
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                              >
                                {receptionist.enabled ===
                                false ? (
                                  <Power className="h-4 w-4" />
                                ) : (
                                  <PowerOff className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================
          VIEW RECEPTIONIST MODAL
      ===================================================== */}

      {showView && selectedReceptionist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#2F3A32]">
                  Receptionist Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Account and contact information
                </p>
              </div>

              <button
                type="button"
                onClick={closeView}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF2EA] text-lg font-semibold text-[#557A5A]">
                  {getInitials(
                    selectedReceptionist.fullName
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#2F3A32]">
                    {selectedReceptionist.fullName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Receptionist
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Email */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>

                  <p className="break-all text-sm text-gray-700">
                    {selectedReceptionist.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedReceptionist.phone ||
                      "Not provided"}
                  </p>
                </div>

                {/* Role */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <UserRound className="h-3.5 w-3.5" />
                    Role
                  </div>

                  <p className="text-sm text-gray-700">
                    Receptionist
                  </p>
                </div>

                {/* Account Status */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Account Status
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAccountStatusClasses(
                      selectedReceptionist
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedReceptionist.enabled === false
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                    />

                    {getAccountStatus(
                      selectedReceptionist
                    )}
                  </span>
                </div>
              </div>

              {/* Account Action */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeView}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAccountStatus(
                      selectedReceptionist
                    );
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedReceptionist.enabled === false
                      ? "bg-[#557A5A] text-white hover:bg-[#47694C]"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {selectedReceptionist.enabled === false ? (
                    <>
                      <Power className="h-4 w-4" />
                      Activate Account
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-4 w-4" />
                      Deactivate Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD RECEPTIONIST MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#2F3A32]">
                  Add Receptionist
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a receptionist account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleAddReceptionist}
              className="p-6"
            >
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) =>
                      handleFormChange(
                        "fullName",
                        event.target.value
                      )
                    }
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleFormChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Enter email address"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleFormChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      handleFormChange(
                        "password",
                        event.target.value
                      )
                    }
                    placeholder="Create password"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#557A5A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#47694C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {saving
                    ? "Adding..."
                    : "Add Receptionist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SMALL ICON WRAPPER
========================================================= */

const UsersIcon = () => {
  return <UserRound className="h-5 w-5" />;
};

export default AdminReceptionistsPage;