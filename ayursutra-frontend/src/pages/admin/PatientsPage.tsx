import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import apiClient from "../../services/api/client";

interface Patient {
  id: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  address?: string;
  medicalHistory?: string;
  [key: string]: unknown;
}

interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CreatePatientForm {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  medicalHistory: string;
}

const initialForm: CreatePatientForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  age: "",
  gender: "",
  address: "",
  medicalHistory: "",
};

function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] =
    useState<CreatePatientForm>(initialForm);

  const [formError, setFormError] = useState("");

  const [formSuccess, setFormSuccess] = useState("");

  const [creating, setCreating] = useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  // =========================
  // FETCH PATIENTS
  // =========================

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get<
        ApiResponse<Patient[]>
      >("/patients");

      console.log(
        "Patients API response:",
        response.data
      );

      setPatients(response.data.data ?? []);
    } catch (error) {
      console.error(
        "Failed to fetch patients:",
        error
      );

      setError(
        "Unable to load patients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.fullName
          ?.toLowerCase()
          .includes(query) ||
        patient.email
          ?.toLowerCase()
          .includes(query) ||
        patient.phone
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [patients, searchTerm]);

  // =========================
  // FORM HANDLING
  // =========================

  const handleFormChange = (
    field: keyof CreatePatientForm,
    value: string
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setFormError("");
    setFormSuccess("");
  };

  const resetAddForm = () => {
    setForm(initialForm);
    setFormError("");
    setFormSuccess("");
  };

  const handleOpenAddForm = () => {
    resetAddForm();
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    if (creating) {
      return;
    }

    setShowAddForm(false);
    resetAddForm();
  };

  // =========================
  // CREATE USER + PATIENT
  // =========================

  const handleCreatePatient = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    const age = Number(form.age);

    // Frontend validation
    if (!form.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }

    if (!form.password.trim()) {
      setFormError("Password is required.");
      return;
    }

    if (form.password.length < 6) {
      setFormError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!form.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    if (!form.age.trim() || Number.isNaN(age)) {
      setFormError("Please enter a valid age.");
      return;
    }

    if (age < 1) {
      setFormError(
        "Age must be greater than 0."
      );
      return;
    }

    if (!form.gender) {
      setFormError("Please select gender.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      setFormError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setCreating(true);

      // ==========================================
      // STEP 1: CREATE USER
      // ==========================================

      const userRequest = {
        fullName: form.fullName.trim(),
        email: form.email.trim() || null,
        password: form.password,
        phone: form.phone.trim(),
        role: "PATIENT",
      };

      console.log(
        "Create user request:",
        {
          ...userRequest,
          password: "********",
        }
      );

      const userResponse =
        await apiClient.post<
          ApiResponse<UserResponse>
        >(
          "/users/register",
          userRequest
        );

      console.log(
        "Create user response:",
        userResponse.data
      );

      if (
        !userResponse.data.success ||
        !userResponse.data.data
      ) {
        throw new Error(
          userResponse.data.message ||
            "User creation failed."
        );
      }

      const createdUser =
        userResponse.data.data;

      const userId = createdUser.id;

      console.log(
        "Generated User ID:",
        userId
      );

      // ==========================================
      // STEP 2: CREATE PATIENT
      // ==========================================

      const patientRequest = {
        userId: userId,
        fullName: form.fullName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        age: age,
        gender: form.gender,
        address: form.address.trim(),
        medicalHistory:
          form.medicalHistory.trim(),
      };

      console.log(
        "Create patient request:",
        patientRequest
      );

      const patientResponse =
        await apiClient.post<
          ApiResponse<Patient>
        >(
          "/patients",
          patientRequest
        );

      console.log(
        "Create patient response:",
        patientResponse.data
      );

      if (
        !patientResponse.data.success ||
        !patientResponse.data.data
      ) {
        throw new Error(
          patientResponse.data.message ||
            "Patient creation failed."
        );
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      const createdPatient =
        patientResponse.data.data;

      setFormSuccess(
        "Patient account created successfully."
      );

      setPatients((currentPatients) => [
        ...currentPatients,
        createdPatient,
      ]);

      console.log(
        "Patient successfully created:",
        createdPatient
      );

      // Close after successful creation
      setTimeout(() => {
        setShowAddForm(false);
        resetAddForm();
      }, 900);
    } catch (error: any) {
      console.error(
        "Failed to create patient:",
        error
      );

      const backendMessage =
        error?.response?.data?.message;

      setFormError(
        backendMessage ||
          error?.message ||
          "Unable to create patient. Please check the entered details."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // VIEW PATIENT
  // =========================

  const handleViewPatient = (
    patient: Patient
  ) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  // =========================
  // DELETE PATIENT
  // =========================

  const handleDeletePatient = async (
    patient: Patient
  ) => {
    if (!patient.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        patient.fullName ||
        "this patient"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(patient.id);

      await apiClient.delete(
        `/patients/${patient.id}`
      );

      setPatients((currentPatients) =>
        currentPatients.filter(
          (currentPatient) =>
            currentPatient.id !== patient.id
        )
      );

      if (
        selectedPatient?.id === patient.id
      ) {
        setSelectedPatient(null);
        setShowDetails(false);
      }
    } catch (error: any) {
      console.error(
        "Failed to delete patient:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
          "Unable to delete patient. Please try again."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-full">

      {/* =========================
          PAGE HEADER
          ========================= */}

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#71834F]">
            Administration
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
            Patients
          </h2>

          <p className="mt-2 text-sm text-[#667060]">
            Manage registered patients and their
            information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#6B7F4E]"
        >
          <Plus size={18} />
          Add Patient
        </button>
      </div>

      {/* =========================
          SEARCH
          ========================= */}

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#E1E4DB] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A927B]"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search by name, email or phone..."
            className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#9A9F91] focus:border-[#71834F] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-[#667060]">
          <Users size={18} />

          <span>
            {filteredPatients.length} patient
            {filteredPatients.length !==
            1
              ? "s"
              : ""}
          </span>
        </div>
      </div>

      {/* =========================
          ERROR
          ========================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E2C8C3] bg-[#FFF8F6] px-5 py-4 text-sm text-[#8B4A42]">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchPatients}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================
          PATIENT TABLE
          ========================= */}

      <div className="overflow-hidden rounded-2xl border border-[#E1E4DB] bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>
              <tr className="border-b border-[#E1E4DB] bg-[#FAFAF7]">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71834F]">
                  Patient
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71834F]">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71834F]">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71834F]">
                  Gender
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#71834F]">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D9DDCE] border-t-[#1F3D2E]" />

                    <p className="mt-4 text-sm text-[#7A806F]">
                      Loading patients...
                    </p>

                  </td>
                </tr>

              ) : filteredPatients.length ===
                0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9EFE4] text-[#1F3D2E]">
                      <Users size={25} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#1F3D2E]">
                      No patients found
                    </h3>

                    <p className="mt-1 text-sm text-[#7A806F]">
                      {searchTerm
                        ? "Try changing your search."
                        : "No patients are currently registered."}
                    </p>

                  </td>
                </tr>

              ) : (

                filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient.id}
                      className="border-b border-[#EEF0EA] last:border-b-0 hover:bg-[#FCFCF9]"
                    >

                      {/* PATIENT */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE5D6] text-sm font-semibold text-[#1F3D2E]">
                            {patient.fullName
                              ?.charAt(0)
                              .toUpperCase() ||
                              "P"}
                          </div>

                          <div>

                            <p className="font-semibold text-[#1F3D2E]">
                              {patient.fullName ||
                                "Unnamed Patient"}
                            </p>

                            <p className="mt-1 text-xs text-[#8A927B]">
                              ID:{" "}
                              {patient.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-5 text-sm text-[#667060]">
                        {patient.email ||
                          "—"}
                      </td>

                      {/* PHONE */}

                      <td className="px-6 py-5 text-sm text-[#667060]">
                        {patient.phone ||
                          "—"}
                      </td>

                      {/* GENDER */}

                      <td className="px-6 py-5 text-sm text-[#667060]">
                        {patient.gender ||
                          "—"}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewPatient(
                                patient
                              )
                            }
                            className="rounded-lg p-2 text-[#4D5C4B] transition hover:bg-[#E9EFE4] hover:text-[#1F3D2E]"
                            title="View patient"
                          >
                            <Eye size={18} />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              window.alert(
                                "Patient editing will be implemented next."
                              )
                            }
                            className="rounded-lg p-2 text-[#4D5C4B] transition hover:bg-[#E9EFE4] hover:text-[#1F3D2E]"
                            title="Edit patient"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePatient(
                                patient
                              )
                            }
                            disabled={
                              deleteLoading ===
                              patient.id
                            }
                            className="rounded-lg p-2 text-[#8B4A42] transition hover:bg-[#F5E9E7] disabled:opacity-50"
                            title="Delete patient"
                          >

                            {deleteLoading ===
                            patient.id ? (

                              <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[#E2C8C3] border-t-[#8B4A42]" />

                            ) : (

                              <Trash2 size={18} />

                            )}

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          ADD PATIENT MODAL
          ========================= */}

      {showAddForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-[#E1E4DB] bg-white px-6 py-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71834F]">
                  Patient Management
                </p>

                <h3 className="mt-1 text-2xl font-semibold text-[#1F3D2E]">
                  Add New Patient
                </h3>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseAddForm
                }
                disabled={creating}
                className="rounded-lg p-2 text-[#667060] transition hover:bg-[#F8F6F0] disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreatePatient
              }
              className="space-y-5 p-6"
            >

              {/* FULL NAME */}

              <div>

                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                >
                  Full Name *
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    handleFormChange(
                      "fullName",
                      event.target.value
                    )
                  }
                  placeholder="Enter patient's full name"
                  required
                  className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                />

              </div>

              {/* EMAIL + PHONE */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleFormChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="patient@example.com"
                    className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                  />

                </div>

                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                  >
                    Phone *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleFormChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    required
                    className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                >
                  Initial Password *
                </label>

                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    handleFormChange(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Enter initial login password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                />

                <p className="mt-1 text-xs text-[#8A927B]">
                  This password will be used by the
                  patient to log in.
                </p>

              </div>

              {/* AGE + GENDER */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label
                    htmlFor="age"
                    className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                  >
                    Age *
                  </label>

                  <input
                    id="age"
                    type="number"
                    min="1"
                    value={form.age}
                    onChange={(event) =>
                      handleFormChange(
                        "age",
                        event.target.value
                      )
                    }
                    placeholder="Enter age"
                    required
                    className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                  />

                </div>

                <div>

                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                  >
                    Gender *
                  </label>

                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(event) =>
                      handleFormChange(
                        "gender",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              {/* ADDRESS */}

              <div>

                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    handleFormChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter patient's address"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                />

              </div>

              {/* MEDICAL HISTORY */}

              <div>

                <label
                  htmlFor="medicalHistory"
                  className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                >
                  Medical History
                </label>

                <textarea
                  id="medicalHistory"
                  value={form.medicalHistory}
                  onChange={(event) =>
                    handleFormChange(
                      "medicalHistory",
                      event.target.value
                    )
                  }
                  placeholder="Enter relevant medical history"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#D9DDCE] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#71834F] focus:bg-white"
                />

              </div>

              {/* ERROR */}

              {formError && (

                <div className="rounded-xl border border-[#E2C8C3] bg-[#FFF8F6] px-4 py-3 text-sm text-[#8B4A42]">
                  {formError}
                </div>

              )}

              {/* SUCCESS */}

              {formSuccess && (

                <div className="rounded-xl border border-[#D4E2CE] bg-[#F3F8F0] px-4 py-3 text-sm text-[#49633D]">
                  {formSuccess}
                </div>

              )}

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    handleCloseAddForm
                  }
                  disabled={creating}
                  className="rounded-xl border border-[#D9DDCE] px-5 py-3 text-sm font-medium text-[#4D5C4B] transition hover:bg-[#F8F6F0] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {creating && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {creating
                    ? "Creating Patient..."
                    : "Create Patient"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          VIEW PATIENT MODAL
          ========================= */}

      {showDetails &&
        selectedPatient && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

              <div className="sticky top-0 flex items-start justify-between border-b border-[#E1E4DB] bg-white px-6 py-5">

                <div>

                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71834F]">
                    Patient Details
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                    {selectedPatient.fullName ||
                      "Patient"}
                  </h3>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedPatient(
                      null
                    );
                  }}
                  className="rounded-lg p-2 text-[#667060] hover:bg-[#F8F6F0]"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="space-y-5 p-6">

                <div className="rounded-xl bg-[#FAFAF7] p-4">

                  <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                    Patient ID
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-[#1F3D2E]">
                    {selectedPatient.id}
                  </p>

                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                      User ID
                    </p>

                    <p className="mt-1 break-all text-sm text-[#1F3D2E]">
                      {selectedPatient.userId ||
                        "—"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                      Age
                    </p>

                    <p className="mt-1 text-sm text-[#1F3D2E]">
                      {selectedPatient.age ??
                        "—"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-[#1F3D2E]">
                      {selectedPatient.email ||
                        "—"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-[#1F3D2E]">
                      {selectedPatient.phone ||
                        "—"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                      Gender
                    </p>

                    <p className="mt-1 text-sm text-[#1F3D2E]">
                      {selectedPatient.gender ||
                        "—"}
                    </p>

                  </div>

                </div>

                <div>

                  <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                    Address
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#1F3D2E]">
                    {selectedPatient.address ||
                      "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs uppercase tracking-wider text-[#8A927B]">
                    Medical History
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#1F3D2E]">
                    {selectedPatient.medicalHistory ||
                      "No medical history recorded."}
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default PatientsPage;