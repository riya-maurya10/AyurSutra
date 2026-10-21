import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Users,
  UserRound,
  Phone,
  Mail,
  Eye,
  Pencil,
  Power,
  PowerOff,
  X,
  MapPin,
  FileText,
} from "lucide-react";
import apiClient from "../../services/api/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

interface Patient {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  address: string;
  medicalHistory: string;
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

interface PatientForm {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  medicalHistory: string;
}

const emptyForm: PatientForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  age: "",
  gender: "",
  address: "",
  medicalHistory: "",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function AdminPatientsPage() {

  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  const [form, setForm] = useState<PatientForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] =
    useState<string | null>(null);

  const loadPatients = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [patientsResponse, usersResponse] = await Promise.all([
        apiClient.get("/patients"),
        apiClient.get("/users"),
      ]);

      const patientList: Patient[] = Array.isArray(patientsResponse.data)
        ? patientsResponse.data
        : patientsResponse.data?.data ?? [];

      const userList: User[] = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data?.data ?? [];

      const patientsWithStatus = patientList.map((patient) => {
        const linkedUser =
          userList.find((user) => user.id === patient.userId) ??
          userList.find(
            (user) =>
              user.email?.toLowerCase() === patient.email?.toLowerCase() &&
              user.role === "PATIENT"
          );

        return {
          ...patient,
          enabled: linkedUser?.enabled ?? true,
        };
      });

      setPatients(patientsWithStatus);
     
    } catch (err: any) {
      console.error("Failed to load patients:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load patients. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.fullName?.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query) ||
        patient.gender?.toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

  const openAddForm = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (patient: Patient) => {
    setEditingPatient(patient);

    setForm({
      fullName: patient.fullName || "",
      email: patient.email || "",
      password: "",
      phone: patient.phone || "",
      age: patient.age !== null && patient.age !== undefined
        ? String(patient.age)
        : "",
      gender: patient.gender || "",
      address: patient.address || "",
      medicalHistory: patient.medicalHistory || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingPatient(null);
    setForm(emptyForm);
  };

  const handleFormChange = (
    field: keyof PatientForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
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

    if (!form.age.trim()) {
      setError("Age is required.");
      return;
    }

    if (!form.gender.trim()) {
      setError("Gender is required.");
      return;
    }

    const age = Number(form.age);

    if (Number.isNaN(age) || age < 0 || age > 120) {
      setError("Please enter a valid age.");
      return;
    }

    if (!editingPatient && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);

      if (editingPatient) {
        const response = await apiClient.put(
          `/patients/${editingPatient.id}`,
          {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            age,
            gender: form.gender.trim(),
            address: form.address.trim(),
            medicalHistory: form.medicalHistory.trim(),
          }
        );

        const updatedPatient: Patient =
          response.data?.data ?? response.data;

        const patientWithStatus = {
          ...updatedPatient,
          enabled: editingPatient.enabled,
        };

        setPatients((previous) =>
          previous.map((patient) =>
            patient.id === editingPatient.id
              ? patientWithStatus
              : patient
          )
        );

        setSelectedPatient((previous) =>
          previous?.id === editingPatient.id
            ? patientWithStatus
            : previous
        );

        setSuccess(
          `${form.fullName.trim()} has been updated successfully.`
        );
      } else {
        /*
         * Patient creation flow:
         * 1. Create USER with PATIENT role
         * 2. Create PATIENT profile using generated userId
         */

        const userResponse = await apiClient.post("/users/register", {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          role: "PATIENT",
        });

        const createdUser: User =
          userResponse.data?.data ?? userResponse.data;

        const patientResponse = await apiClient.post("/patients", {
          userId: createdUser.id,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          age,
          gender: form.gender.trim(),
          address: form.address.trim(),
          medicalHistory: form.medicalHistory.trim(),
        });

        const createdPatient: Patient =
          patientResponse.data?.data ?? patientResponse.data;

        const patientWithStatus = {
          ...createdPatient,
          enabled: true,
        };

        setPatients((previous) => [
          patientWithStatus,
          ...previous,
        ]);

        setSuccess(
          `${form.fullName.trim()} has been added successfully.`
        );
      }

      setShowForm(false);
      setEditingPatient(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error("Failed to save patient:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save patient. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAccountStatus = async (patient: Patient) => {
    if (!patient.userId) {
      setError(
        "This patient is not linked to a user account, so the account status cannot be changed."
      );
      return;
    }

    const isCurrentlyEnabled = patient.enabled !== false;

    const action = isCurrentlyEnabled
      ? "deactivate"
      : "activate";

    const actionText = isCurrentlyEnabled
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${patient.fullName}'s account?`
    );

    if (!confirmed) return;

    try {
      setStatusUpdatingId(patient.id);
      setError("");
      setSuccess("");

      const response = await apiClient.put(
        `/users/${patient.userId}/${action}`
      );

      const updatedUser: User =
        response.data?.data ?? response.data;

      const newEnabledStatus =
        updatedUser.enabled ?? !isCurrentlyEnabled;


      setPatients((previous) =>
        previous.map((item) =>
          item.id === patient.id
            ? {
                ...item,
                enabled: newEnabledStatus,
              }
            : item
        )
      );

      setSelectedPatient((previous) =>
        previous?.id === patient.id
          ? {
              ...previous,
              enabled: newEnabledStatus,
            }
          : previous
      );

      setSuccess(
        `${patient.fullName}'s account has been ${
          newEnabledStatus ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (err: any) {
      console.error("Failed to update account status:", err);

      setError(
        err?.response?.data?.message ||
          `Failed to ${actionText} the account. Please try again.`
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getAccountStatus = (patient: Patient) => {
    return patient.enabled === false ? "Inactive" : "Active";
  };

  const getAccountStatusClasses = (patient: Patient) => {
    return patient.enabled === false
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F6F0]">
        <Sidebar role="ADMIN" />

        <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
          <Topbar title="Patients" />

          <main className="flex flex-1 items-center justify-center p-8">
            <div className="flex items-center gap-3 text-gray-600">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading patients...
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <Sidebar role="ADMIN" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <Topbar title="Patients" />

        <main className="flex-1 p-5 md:p-8">
          {/* Header */}
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#2F3A32]">
                Patients
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage patient profiles and account status
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#557A5A] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#47694C]"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0"
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
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search + Refresh */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patients..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
              />
            </div>

            <button
              type="button"
              onClick={() => loadPatients(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Patients
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {patients.length}
                  </p>
                </div>

                <div className="rounded-xl bg-[#EAF2EA] p-3 text-[#557A5A]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Active Accounts
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {
                      patients.filter(
                        (patient) => patient.enabled !== false
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Power className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Inactive Accounts
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2F3A32]">
                    {
                      patients.filter(
                        (patient) => patient.enabled === false
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

          {/* Patient Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 rounded-full bg-[#EAF2EA] p-4 text-[#557A5A]">
                  <UserRound className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-semibold text-[#2F3A32]">
                  {search
                    ? "No patients found"
                    : "No patients yet"}
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  {search
                    ? "Try changing your search."
                    : "Add your first patient to get started."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#557A5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#47694C]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Patient
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FBFAF7] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Age
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Gender
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
                    {filteredPatients.map((patient) => {
                      const isUpdating =
                        statusUpdatingId === patient.id;

                      return (
                        <tr
                          key={patient.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-[#FCFBF8]"
                        >
                          {/* Patient */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF2EA] text-sm font-semibold text-[#557A5A]">
                                {getInitials(patient.fullName)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-[#2F3A32]">
                                  {patient.fullName}
                                </p>

                                <p className="truncate text-xs text-gray-500">
                                  ID: {patient.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                {patient.email}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                {patient.phone}
                              </div>
                            </div>
                          </td>

                          {/* Age */}
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {patient.age ?? "—"}
                          </td>

                          {/* Gender */}
                          <td className="px-6 py-4 text-sm capitalize text-gray-600">
                            {patient.gender || "—"}
                          </td>

                          {/* Account Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAccountStatusClasses(
                                patient
                              )}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  patient.enabled === false
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                }`}
                              />

                              {getAccountStatus(patient)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* View */}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPatient(patient)
                                }
                                title="View patient"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(patient)
                                }
                                title="Edit patient"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* Activate / Deactivate */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleAccountStatus(patient)
                                }
                                disabled={isUpdating}
                                title={
                                  patient.enabled === false
                                    ? "Activate account"
                                    : "Deactivate account"
                                }
                                className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  patient.enabled === false
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                              >
                                {isUpdating ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : patient.enabled === false ? (
                                  <Power className="h-4 w-4" />
                                ) : (
                                  <PowerOff className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Patient Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2EA] text-sm font-semibold text-[#557A5A]">
                  {getInitials(selectedPatient.fullName)}
                </div>

                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2F3A32]">
                    {selectedPatient.fullName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Patient Details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>

                  <p className="break-all text-sm text-gray-700">
                    {selectedPatient.email || "—"}
                  </p>
                </div>

                {/* Phone */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedPatient.phone || "—"}
                  </p>
                </div>

                {/* Age */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Age
                  </div>

                  <p className="text-sm text-gray-700">
                    {selectedPatient.age ?? "—"}
                  </p>
                </div>

                {/* Gender */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Gender
                  </div>

                  <p className="text-sm capitalize text-gray-700">
                    {selectedPatient.gender || "—"}
                  </p>
                </div>

                {/* Account Status */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Account Status
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getAccountStatusClasses(
                      selectedPatient
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedPatient.enabled === false
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                    />

                    {getAccountStatus(selectedPatient)}
                  </span>
                </div>

                {/* Patient ID */}
                <div className="rounded-xl bg-[#FBFAF7] p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Patient ID
                  </div>

                  <p className="break-all text-sm text-gray-700">
                    {selectedPatient.id}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-xl bg-[#FBFAF7] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </div>

                <p className="text-sm leading-6 text-gray-700">
                  {selectedPatient.address || "No address provided."}
                </p>
              </div>

              {/* Medical History */}
              <div className="rounded-xl bg-[#FBFAF7] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                  <FileText className="h-3.5 w-3.5" />
                  Medical History
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {selectedPatient.medicalHistory ||
                    "No medical history provided."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    openEditForm(selectedPatient);
                    setSelectedPatient(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Patient
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAccountStatus(selectedPatient)
                  }
                  disabled={
                    statusUpdatingId === selectedPatient.id
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedPatient.enabled === false
                      ? "bg-[#557A5A] text-white hover:bg-[#47694C]"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {statusUpdatingId === selectedPatient.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : selectedPatient.enabled === false ? (
                    <Power className="h-4 w-4" />
                  ) : (
                    <PowerOff className="h-4 w-4" />
                  )}

                  {selectedPatient.enabled === false
                    ? "Activate Account"
                    : "Deactivate Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#2F3A32]">
                  {editingPatient
                    ? "Edit Patient"
                    : "Add Patient"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingPatient
                    ? "Update patient information"
                    : "Create a new patient account"}
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
                      placeholder="patient@example.com"
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
                {!editingPatient && (
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

                {/* Age + Gender */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Age
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={form.age}
                      onChange={(event) =>
                        handleFormChange(
                          "age",
                          event.target.value
                        )
                      }
                      placeholder="Enter age"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Gender
                    </label>

                    <select
                      value={form.gender}
                      onChange={(event) =>
                        handleFormChange(
                          "gender",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      handleFormChange(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Enter address"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                  />
                </div>

                {/* Medical History */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Medical History
                  </label>

                  <textarea
                    value={form.medicalHistory}
                    onChange={(event) =>
                      handleFormChange(
                        "medicalHistory",
                        event.target.value
                      )
                    }
                    placeholder="Enter relevant medical history"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#557A5A] focus:ring-2 focus:ring-[#557A5A]/10"
                  />
                </div>
              </div>

              {/* Form Footer */}
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
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingPatient
                    ? "Update Patient"
                    : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}