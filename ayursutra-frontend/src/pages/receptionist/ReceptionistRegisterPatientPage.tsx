import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

import { register } from "../../services/auth/authService";
import { createPatient } from "../../services/doctor/doctorService";

function ReceptionistRegisterPatientPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    gender: "",
    address: "",
    medicalHistory: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // -------------------------------------------------------
      // STEP 1: Create User account with PATIENT role
      // -------------------------------------------------------
      const user = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      // -------------------------------------------------------
      // STEP 2: Create Patient profile using returned user ID
      // -------------------------------------------------------
      await createPatient({
        userId: user.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        address: formData.address.trim(),
        medicalHistory: formData.medicalHistory.trim(),
      });

      setSuccess("Patient registered successfully.");

      setTimeout(() => {
        navigate("/receptionist/patients");
      }, 1000);
    } catch (err: any) {
      console.error("Patient registration failed:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to register patient. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/receptionist/patients")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#6B7568] transition hover:text-[#1F3D2E]"
          >
            <ArrowLeft size={16} />
            Back to Patients
          </button>

          <h1 className="text-2xl font-semibold tracking-tight text-[#1F3D2E]">
            Register New Patient
          </h1>

          <p className="mt-1 text-sm text-[#7A806F]">
            Create the patient's account and healthcare profile.
          </p>
        </div>

        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#E7EFE8] text-[#1F3D2E] sm:flex">
          <UserPlus size={22} />
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <section className="rounded-2xl border border-[#E7E4D8] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1F3D2E]">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-[#7A806F]">
              These details will be used for the patient's login account.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Email <span className="text-red-500">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Phone <span className="text-red-500">*</span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Password <span className="text-red-500">*</span>
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create login password"
                className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>
          </div>
        </section>

        {/* Patient Information */}
        <section className="rounded-2xl border border-[#E7E4D8] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1F3D2E]">
              Patient Information
            </h2>

            <p className="mt-1 text-sm text-[#7A806F]">
              Add the patient's basic healthcare profile information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Age <span className="text-red-500">*</span>
              </label>

              <input
                id="age"
                name="age"
                type="number"
                min="1"
                value={formData.age}
                onChange={handleChange}
                required
                placeholder="Enter age"
                className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Gender <span className="text-red-500">*</span>
              </label>

              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Address
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Enter patient's address"
                className="w-full resize-none rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>

            {/* Medical History */}
            <div className="md:col-span-2">
              <label
                htmlFor="medicalHistory"
                className="mb-2 block text-sm font-medium text-[#374338]"
              >
                Medical History
              </label>

              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows={5}
                placeholder="Enter relevant medical history, conditions, allergies, previous treatments, etc."
                className="w-full resize-none rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/receptionist/patients")}
            disabled={loading}
            className="rounded-xl border border-[#DCD9CD] bg-white px-6 py-3 text-sm font-medium text-[#536054] transition hover:bg-[#F7F6F0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#294C3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={17} />

            {loading ? "Registering Patient..." : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReceptionistRegisterPatientPage;