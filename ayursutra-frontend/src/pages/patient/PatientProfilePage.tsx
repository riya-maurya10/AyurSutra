import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api/client";

interface PatientProfile {
  id?: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  address: string;
  medicalHistory: string;
}

const emptyProfile: PatientProfile = {
  fullName: "",
  email: "",
  phone: "",
  age: null,
  gender: "",
  address: "",
  medicalHistory: "",
};

function PatientProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<PatientProfile>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Load patient profile
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await apiClient.get("/patients/me");

        const data = response.data.data;

        setProfile({
          id: data.id,
          userId: data.userId,
          fullName: data.fullName || user?.fullName || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          age: data.age ?? null,
          gender: data.gender || "",
          address: data.address || "",
          medicalHistory: data.medicalHistory || "",
        });

        setProfileExists(true);
      } catch (err: any) {
        /*
         * 404 means the User exists but the Patient
         * profile has not been created yet.
         */
        if (err.response?.status === 404) {
          setProfile({
            ...emptyProfile,
            fullName: user?.fullName || "",
            email: user?.email || "",
            phone: "",
          });

          setProfileExists(false);
        } else {
          console.error("Failed to load profile:", err);

          setError(
            "Unable to load your profile. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  /*
   * Handle input changes
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "age"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));

    setError("");
    setSuccess("");
  };

  /*
   * Save profile
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!profile.age) {
      setError("Please enter your age.");
      return;
    }

    if (!profile.gender) {
      setError("Please select your gender.");
      return;
    }

    if (!profile.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        age: profile.age,
        gender: profile.gender,
        address: profile.address,
        medicalHistory: profile.medicalHistory,
      };

      if (!profileExists) {
        /*
         * First-time patient profile creation
         */
        const response = await apiClient.post(
          "/patients/me",
          payload
        );

        const data = response.data.data;

        setProfile({
          id: data.id,
          userId: data.userId,
          fullName: data.fullName || profile.fullName,
          email: data.email || profile.email,
          phone: data.phone || profile.phone,
          age: data.age ?? null,
          gender: data.gender || "",
          address: data.address || "",
          medicalHistory: data.medicalHistory || "",
        });

        setProfileExists(true);

        setSuccess(
          "Your patient profile has been created successfully."
        );
      } else {
        /*
         * Existing patient profile update
         */
        const response = await apiClient.put(
          "/patients/me",
          payload
        );

        const data = response.data.data;

        setProfile({
          id: data.id,
          userId: data.userId,
          fullName: data.fullName || profile.fullName,
          email: data.email || profile.email,
          phone: data.phone || profile.phone,
          age: data.age ?? null,
          gender: data.gender || "",
          address: data.address || "",
          medicalHistory:
            data.medicalHistory || "",
        });

        setSuccess(
          "Your profile has been updated successfully."
        );
      }
    } catch (err: any) {
      console.error("Profile save failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#D8DDCE] border-t-[#1F3D2E]" />

          <p className="text-sm text-[#6B756B]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1F3D2E]">

      {/* Header */}
      <header className="border-b border-[#DDD9C9] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#71834F]">
              AyurSutra
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              My Profile
            </h1>
          </div>

          <button
            onClick={() => navigate("/patient")}
            className="rounded-xl border border-[#D4D8CC] bg-white px-4 py-2.5 text-sm font-medium text-[#1F3D2E] transition hover:bg-[#EFF1E8]"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

        {/* Intro */}
        <div className="mb-8">

          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#71834F]">
            Personal Information
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Your AyurSutra profile
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667168]">
            Keep your personal and health information up to date
            so AyurSutra can provide a more personalized care
            experience.
          </p>

        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-[#C9D7C4] bg-[#EDF4EA] px-5 py-4 text-sm text-[#315A3E]">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-[#E1DED3] bg-white shadow-sm">

          {/* Card Header */}
          <div className="border-b border-[#E8E5DC] bg-[#FBFAF6] px-6 py-6 md:px-8">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E7EBDD] text-xl font-semibold text-[#1F3D2E]">
                {profile.fullName
                  ? profile.fullName.charAt(0).toUpperCase()
                  : "P"}
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {profile.fullName || "Your Profile"}
                </h3>

                <p className="mt-1 text-sm text-[#718078]">
                  {profile.email}
                </p>
              </div>

            </div>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-8 md:px-8"
          >

            <div className="grid gap-6 md:grid-cols-2">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#31483C]">
                  Full Name
                </label>

                <input
                  type="text"
                  value={profile.fullName}
                  disabled
                  className="w-full rounded-xl border border-[#D9DDD5] bg-[#F5F6F2] px-4 py-3.5 text-sm text-[#667168]"
                />

                <p className="mt-2 text-xs text-[#8A928B]">
                  Your name comes from your AyurSutra account.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#31483C]">
                  Email Address
                </label>

                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-[#D9DDD5] bg-[#F5F6F2] px-4 py-3.5 text-sm text-[#667168]"
                />

                <p className="mt-2 text-xs text-[#8A928B]">
                  Your email is linked to your login account.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10"
                />
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Age
                </label>

                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={profile.age ?? ""}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10"
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

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Address
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="City, State"
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10"
                />
              </div>

            </div>

            {/* Medical History */}
            <div className="mt-6">

              <label
                htmlFor="medicalHistory"
                className="mb-2 block text-sm font-medium text-[#31483C]"
              >
                Medical History
              </label>

              <textarea
                id="medicalHistory"
                name="medicalHistory"
                rows={5}
                value={profile.medicalHistory}
                onChange={handleChange}
                placeholder="Mention any previous conditions, allergies, ongoing treatments, or other relevant information..."
                className="w-full resize-none rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10"
              />

              <p className="mt-2 text-xs text-[#8A928B]">
                This information helps your Ayurvedic care team
                understand your background.
              </p>

            </div>

            {/* Bottom */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#E8E5DC] pt-6 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                onClick={() => navigate("/patient")}
                className="rounded-xl border border-[#D4D8CC] px-6 py-3 text-sm font-medium text-[#31483C] transition hover:bg-[#F5F6F2]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#1F3D2E] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#2C5843] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : profileExists
                    ? "Save Changes"
                    : "Create My Profile"}
              </button>

            </div>

          </form>

        </div>

      </main>
    </div>
  );
}

export default PatientProfilePage;