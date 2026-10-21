import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserRound,
  Phone,
  Mail,
  Eye,
  Pencil,
  Power,
  PowerOff,
  X,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";
import apiClient from "../../services/api/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

interface Therapist {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  therapistType: string;
  available: boolean;
  enabled?: boolean;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
}

interface TherapistForm {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: string;
  therapistType: string;
  available: boolean;
}

const emptyForm: TherapistForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
  qualification: "",
  experienceYears: "",
  therapistType: "",
  available: true,
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [selectedTherapist, setSelectedTherapist] =
    useState<Therapist | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingTherapist, setEditingTherapist] =
    useState<Therapist | null>(null);

  const [form, setForm] =
    useState<TherapistForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState<string | null>(null);

  // =========================================================
  // LOAD THERAPISTS
  // =========================================================

  const loadTherapists = async () => {
    try {
      setLoading(true);
      setError("");

      const [therapistsResponse, usersResponse] =
        await Promise.all([
          apiClient.get("/therapists"),
          apiClient.get("/users"),
        ]);

      const therapistList: Therapist[] =
        Array.isArray(therapistsResponse.data)
          ? therapistsResponse.data
          : therapistsResponse.data?.data ?? [];

      const userList: User[] =
        Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data?.data ?? [];

      const therapistsWithStatus =
        therapistList.map((therapist) => {
          const linkedUser =
            userList.find(
              (user) => user.id === therapist.userId
            ) ??
            userList.find(
              (user) =>
                user.email?.toLowerCase() ===
                  therapist.email?.toLowerCase() &&
                user.role === "THERAPIST"
            );

          return {
            ...therapist,
            enabled: linkedUser?.enabled ?? true,
          };
        });

      setTherapists(therapistsWithStatus);
    } catch (err: any) {
      console.error(
        "Failed to load therapists:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load therapists. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredTherapists = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return therapists;
    }

    return therapists.filter((therapist) => {
      return (
        therapist.fullName
          ?.toLowerCase()
          .includes(query) ||
        therapist.email
          ?.toLowerCase()
          .includes(query) ||
        therapist.phone
          ?.toLowerCase()
          .includes(query) ||
        therapist.specialization
          ?.toLowerCase()
          .includes(query) ||
        therapist.qualification
          ?.toLowerCase()
          .includes(query) ||
        therapist.therapistType
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [therapists, search]);

  // =========================================================
  // ADD FORM
  // =========================================================

  const openAddForm = () => {
    setEditingTherapist(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // EDIT FORM
  // =========================================================

  const openEditForm = (therapist: Therapist) => {
    setEditingTherapist(therapist);

    setForm({
      fullName: therapist.fullName || "",
      email: therapist.email || "",
      password: "",
      phone: therapist.phone || "",
      specialization:
        therapist.specialization || "",
      qualification:
        therapist.qualification || "",
      experienceYears:
        therapist.experienceYears !== undefined
          ? String(therapist.experienceYears)
          : "",
      therapistType:
        therapist.therapistType || "",
      available: therapist.available ?? true,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingTherapist(null);
    setForm(emptyForm);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (
    field: keyof TherapistForm,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!form.specialization.trim()) {
      setError("Specialization is required.");
      return;
    }

    if (!form.qualification.trim()) {
      setError("Qualification is required.");
      return;
    }

    if (!form.experienceYears.trim()) {
      setError("Experience is required.");
      return;
    }

    const experienceYears = Number(
      form.experienceYears
    );

    if (
      Number.isNaN(experienceYears) ||
      experienceYears < 0
    ) {
      setError(
        "Please enter a valid experience in years."
      );
      return;
    }

    if (!form.therapistType.trim()) {
      setError("Therapist type is required.");
      return;
    }

    if (
      !editingTherapist &&
      form.password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // EDIT EXISTING THERAPIST
      // =====================================================

      if (editingTherapist) {
        const response = await apiClient.put(
          `/therapists/${editingTherapist.id}`,
          {
            userId: editingTherapist.userId,
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            specialization:
              form.specialization.trim(),
            qualification:
              form.qualification.trim(),
            experienceYears,
            therapistType:
              form.therapistType.trim(),
            available: form.available,
          }
        );

        const updatedTherapist: Therapist =
          response.data?.data ?? response.data;

        const therapistWithStatus = {
          ...updatedTherapist,
          enabled: editingTherapist.enabled,
        };

        setTherapists((previous) =>
          previous.map((therapist) =>
            therapist.id === editingTherapist.id
              ? therapistWithStatus
              : therapist
          )
        );

        setSelectedTherapist((previous) =>
          previous?.id === editingTherapist.id
            ? therapistWithStatus
            : previous
        );

        setSuccess(
          `${form.fullName.trim()} has been updated successfully.`
        );
      }

      // =====================================================
      // CREATE NEW THERAPIST
      // =====================================================

      else {
        // First create USER account
        const userResponse =
          await apiClient.post(
            "/users/register",
            {
              fullName:
                form.fullName.trim(),
              email:
                form.email.trim(),
              password:
                form.password,
              phone:
                form.phone.trim(),
              role: "THERAPIST",
            }
          );

        const createdUser: User =
          userResponse.data?.data ??
          userResponse.data;

        // Then create THERAPIST profile
        const therapistResponse =
          await apiClient.post(
            "/therapists",
            {
              userId: createdUser.id,
              fullName:
                form.fullName.trim(),
              email:
                form.email.trim(),
              phone:
                form.phone.trim(),
              specialization:
                form.specialization.trim(),
              qualification:
                form.qualification.trim(),
              experienceYears,
              therapistType:
                form.therapistType.trim(),
              available:
                form.available,
            }
          );

        const createdTherapist: Therapist =
          therapistResponse.data?.data ??
          therapistResponse.data;

        setTherapists((previous) => [
          {
            ...createdTherapist,
            enabled: true,
          },
          ...previous,
        ]);

        setSuccess(
          `${form.fullName.trim()} has been added successfully.`
        );
      }

      setShowForm(false);
      setEditingTherapist(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error(
        "Failed to save therapist:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save therapist. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE ACCOUNT
  // =========================================================

  const handleAccountStatus = async (
    therapist: Therapist
  ) => {
    if (!therapist.userId) {
      setError(
        "This therapist is not linked to a user account, so the account status cannot be changed."
      );
      return;
    }

    const isCurrentlyEnabled =
      therapist.enabled !== false;

    const action = isCurrentlyEnabled
      ? "deactivate"
      : "activate";

    const actionText = isCurrentlyEnabled
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${therapist.fullName}'s account?`
    );

    if (!confirmed) return;

    try {
      setStatusUpdatingId(therapist.id);
      setError("");
      setSuccess("");

      await apiClient.put(
        `/users/${therapist.userId}/${action}`
      );

      const newEnabledStatus =
        !isCurrentlyEnabled;

      setTherapists((previous) =>
        previous.map((item) =>
          item.id === therapist.id
            ? {
                ...item,
                enabled: newEnabledStatus,
              }
            : item
        )
      );

      setSelectedTherapist((previous) =>
        previous?.id === therapist.id
          ? {
              ...previous,
              enabled: newEnabledStatus,
            }
          : previous
      );

      setSuccess(
        `${therapist.fullName}'s account has been ${
          newEnabledStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );
    } catch (err: any) {
      console.error(
        "Failed to update therapist account:",
        err
      );

      setError(
        err?.response?.data?.message ||
          `Failed to ${actionText} the account. Please try again.`
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const getAccountStatus = (
    therapist: Therapist
  ) => {
    return therapist.enabled === false
      ? "Inactive"
      : "Active";
  };

  const getAccountStatusClasses = (
    therapist: Therapist
  ) => {
    return therapist.enabled === false
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  const getAvailabilityClasses = (
    therapist: Therapist
  ) => {
    return therapist.available
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-gray-200 bg-gray-50 text-gray-600";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F6F0]">
        <Sidebar role="ADMIN" />

        <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
          <Topbar title="Therapists" />

          <main className="flex flex-1 items-center justify-center p-8">
            <div className="text-sm text-gray-500">
              Loading therapists...
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <Sidebar role="ADMIN" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <Topbar title="Therapists" />

        <main className="flex-1 p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#2F3A32]">
                Therapists
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage therapist profiles and account status
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#557A5A] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#47694C]"
            >
              <Plus className="h-4 w-4" />
              Add Therapist
            </button>
          </div>

          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search therapists..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
              />
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Total */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Therapists
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {therapists.length}
                  </p>
                </div>

                <div className="rounded-xl bg-[#EAF2EA] p-3 text-[#557A5A]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Active Accounts */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Active Accounts
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {
                      therapists.filter(
                        (therapist) =>
                          therapist.enabled !== false
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Power className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Inactive Accounts */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Inactive Accounts
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {
                      therapists.filter(
                        (therapist) =>
                          therapist.enabled === false
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <PowerOff className="h-5 w-5" />
                </div>
              </div>
            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            {filteredTherapists.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="mb-4 rounded-full bg-[#EAF2EA] p-4 text-[#557A5A]">
                  <UserRound className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-semibold text-[#2F3A32]">
                  {search
                    ? "No therapists found"
                    : "No therapists yet"}
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  {search
                    ? "Try changing your search."
                    : "Add your first therapist to get started."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#557A5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#47694C]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Therapist
                  </button>
                )}

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="min-w-[1250px] w-full">

                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FBFAF7] text-left">

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Therapist
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Specialization
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Experience
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Availability
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

                    {filteredTherapists.map(
                      (therapist) => {

                        const isUpdating =
                          statusUpdatingId ===
                          therapist.id;

                        return (
                          <tr
                            key={therapist.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-[#FCFBF8]"
                          >

                            {/* Therapist */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF2EA] text-sm font-semibold text-[#557A5A]">
                                  {getInitials(
                                    therapist.fullName
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-medium text-[#2F3A32]">
                                    {therapist.fullName}
                                  </p>

                                  <p className="truncate text-xs text-gray-500">
                                    {therapist.therapistType}
                                  </p>
                                </div>

                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-6 py-4">
                              <div className="space-y-1.5">

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                                  {therapist.email}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                                  {therapist.phone}
                                </div>

                              </div>
                            </td>

                            {/* Specialization */}
                            <td className="px-6 py-4">
                              <p className="max-w-[220px] truncate text-sm text-gray-600">
                                {therapist.specialization}
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                                {therapist.qualification}
                              </p>
                            </td>

                            {/* Experience */}
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {therapist.experienceYears}{" "}
                              {therapist.experienceYears === 1
                                ? "year"
                                : "years"}
                            </td>

                            {/* Availability */}
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAvailabilityClasses(
                                  therapist
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    therapist.available
                                      ? "bg-emerald-500"
                                      : "bg-gray-400"
                                  }`}
                                />

                                {therapist.available
                                  ? "Available"
                                  : "Unavailable"}
                              </span>
                            </td>

                            {/* Account Status */}
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAccountStatusClasses(
                                  therapist
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    therapist.enabled === false
                                      ? "bg-red-500"
                                      : "bg-emerald-500"
                                  }`}
                                />

                                {getAccountStatus(
                                  therapist
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
                                    setSelectedTherapist(
                                      therapist
                                    )
                                  }
                                  title="View therapist"
                                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      therapist
                                    )
                                  }
                                  title="Edit therapist"
                                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                {/* Activate / Deactivate */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAccountStatus(
                                      therapist
                                    )
                                  }
                                  disabled={isUpdating}
                                  title={
                                    therapist.enabled === false
                                      ? "Activate account"
                                      : "Deactivate account"
                                  }
                                  className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    therapist.enabled === false
                                      ? "text-emerald-600 hover:bg-emerald-50"
                                      : "text-red-500 hover:bg-red-50"
                                  }`}
                                >
                                  {isUpdating ? (
                                    <span className="text-xs">
                                      ...
                                    </span>
                                  ) : therapist.enabled ===
                                    false ? (
                                    <Power className="h-4 w-4" />
                                  ) : (
                                    <PowerOff className="h-4 w-4" />
                                  )}
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </main>
      </div>

      {/* =====================================================
          VIEW THERAPIST MODAL
      ===================================================== */}

      {selectedTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2EA] text-sm font-semibold text-[#557A5A]">
                  {getInitials(
                    selectedTherapist.fullName
                  )}
                </div>

                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2F3A32]">
                    {selectedTherapist.fullName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Therapist Details
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTherapist(null)
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Body */}
            <div className="space-y-5 p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                {/* Email */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>

                  <p className="break-all text-sm text-gray-700">
                    {selectedTherapist.email ||
                      "—"}
                  </p>
                </div>

                {/* Phone */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedTherapist.phone ||
                      "—"}
                  </p>
                </div>

                {/* Specialization */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    Specialization
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedTherapist.specialization ||
                      "—"}
                  </p>
                </div>

                {/* Qualification */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Qualification
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedTherapist.qualification ||
                      "—"}
                  </p>
                </div>

                {/* Experience */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Experience
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedTherapist.experienceYears}{" "}
                    {selectedTherapist.experienceYears ===
                    1
                      ? "year"
                      : "years"}
                  </p>
                </div>

                {/* Therapist Type */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Therapist Type
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedTherapist.therapistType ||
                      "—"}
                  </p>
                </div>

                {/* Availability */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Availability
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAvailabilityClasses(
                      selectedTherapist
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedTherapist.available
                          ? "bg-emerald-500"
                          : "bg-gray-400"
                      }`}
                    />

                    {selectedTherapist.available
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                {/* Account Status */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Account Status
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAccountStatusClasses(
                      selectedTherapist
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedTherapist.enabled === false
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                    />

                    {getAccountStatus(
                      selectedTherapist
                    )}
                  </span>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                onClick={() =>
                  setSelectedTherapist(null)
                }
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={() => {
                    openEditForm(
                      selectedTherapist
                    );
                    setSelectedTherapist(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Therapist
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAccountStatus(
                      selectedTherapist
                    )
                  }
                  disabled={
                    statusUpdatingId ===
                    selectedTherapist.id
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedTherapist.enabled === false
                      ? "bg-[#557A5A] text-white hover:bg-[#47694C]"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {statusUpdatingId ===
                  selectedTherapist.id ? (
                    "Updating..."
                  ) : selectedTherapist.enabled ===
                    false ? (
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
          ADD / EDIT THERAPIST MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="font-serif text-xl font-semibold text-[#2F3A32]">
                  {editingTherapist
                    ? "Edit Therapist"
                    : "Add Therapist"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingTherapist
                    ? "Update therapist information"
                    : "Create a new therapist account"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              <div className="space-y-5 p-6">

                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                      placeholder="therapist@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                </div>

                {/* Password */}
                {!editingTherapist && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>
                )}

                {/* Specialization + Qualification */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Specialization
                    </label>

                    <input
                      type="text"
                      value={form.specialization}
                      onChange={(event) =>
                        handleFormChange(
                          "specialization",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Panchakarma"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Qualification
                    </label>

                    <input
                      type="text"
                      value={form.qualification}
                      onChange={(event) =>
                        handleFormChange(
                          "qualification",
                          event.target.value
                        )
                      }
                      placeholder="Enter qualification"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                </div>

                {/* Experience + Therapist Type */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Experience (Years)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.experienceYears}
                      onChange={(event) =>
                        handleFormChange(
                          "experienceYears",
                          event.target.value
                        )
                      }
                      placeholder="Enter years"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Therapist Type
                    </label>

                    <input
                      type="text"
                      value={form.therapistType}
                      onChange={(event) =>
                        handleFormChange(
                          "therapistType",
                          event.target.value
                        )
                      }
                      placeholder="Enter therapist type"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                </div>

                {/* Availability */}
                <div className="rounded-xl border border-gray-200 bg-[#FBFAF7] p-4">

                  <label className="flex cursor-pointer items-center justify-between gap-4">

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Available for Therapy Sessions
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Controls whether this therapist is currently available.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleFormChange(
                          "available",
                          !form.available
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition ${
                        form.available
                          ? "bg-[#557A5A]"
                          : "bg-gray-300"
                      }`}
                      aria-label="Toggle availability"
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                          form.available
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>

                  </label>

                </div>

              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#557A5A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#47694C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <span className="text-xs">
                      Saving...
                    </span>
                  )}

                  {!saving &&
                    (editingTherapist
                      ? "Update Therapist"
                      : "Add Therapist")}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}