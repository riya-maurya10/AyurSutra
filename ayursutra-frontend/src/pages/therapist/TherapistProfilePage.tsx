import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Save,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getMyTherapistProfile,
  updateTherapist,
} from "../../services/therapist/therapistService";

import type { TherapistResponse } from "../../services/therapist/therapistService";

function TherapistProfilePage() {
  const navigate = useNavigate();

  const [therapist, setTherapist] = useState<TherapistResponse | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [therapistType, setTherapistType] = useState("");
  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const profile = await getMyTherapistProfile();

        setTherapist(profile);

        setFullName(profile.fullName || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setSpecialization(profile.specialization || "");
        setQualification(profile.qualification || "");
        setExperienceYears(String(profile.experienceYears ?? ""));
        setTherapistType(profile.therapistType || "");
        setAvailable(profile.available);
      } catch (err) {
        console.error("Failed to load therapist profile:", err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!therapist) {
      return;
    }

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!specialization.trim()) {
      setError("Specialization is required.");
      return;
    }

    if (!qualification.trim()) {
      setError("Qualification is required.");
      return;
    }

    const parsedExperience = Number(experienceYears);

    if (
      experienceYears.trim() === "" ||
      Number.isNaN(parsedExperience) ||
      parsedExperience < 0
    ) {
      setError("Please enter a valid experience in years.");
      return;
    }

    if (!therapistType.trim()) {
      setError("Therapist type is required.");
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = await updateTherapist(therapist.id, {
        // IMPORTANT:
        // Backend TherapistRequest requires userId.
        // Keep the existing userId linked to this therapist account.
        userId: therapist.userId,

        fullName: fullName.trim(),
        email: therapist.email,
        phone: phone.trim(),
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experienceYears: parsedExperience,
        therapistType: therapistType.trim(),
        available,
      });

      setTherapist(updatedProfile);

      setFullName(updatedProfile.fullName || "");
      setEmail(updatedProfile.email || "");
      setPhone(updatedProfile.phone || "");
      setSpecialization(updatedProfile.specialization || "");
      setQualification(updatedProfile.qualification || "");
      setExperienceYears(String(updatedProfile.experienceYears ?? ""));
      setTherapistType(updatedProfile.therapistType || "");
      setAvailable(updatedProfile.available);

      localStorage.setItem("userFullName", updatedProfile.fullName);

      setSuccess("Your profile has been updated successfully.");

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to update therapist profile:", err);
      setError("Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F6F1] px-6 py-8 lg:px-8">
        <div className="mx-auto flex min-h-[620px] max-w-[1100px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3E7055]" />

            <p className="mt-4 text-sm font-medium text-[#3F4D40]">
              Loading your profile...
            </p>

            <p className="mt-1 text-xs text-[#8B847A]">
              Fetching your therapist information
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F7F6F1] px-6 py-7 text-[#173D2D] lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1100px]">

        {/* HEADER */}
        <section className="mb-7">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate("/therapist")}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DDDCD3] bg-white text-[#315A46] shadow-sm transition hover:bg-[#F7F5EF]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <p className="text-sm font-medium text-[#9A7337]">
                Therapy Care
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#173D2D] sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6D655B] sm:text-[15px]">
                View and update your professional therapist information.
              </p>
            </div>
          </div>
        </section>

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#D5E8DE] bg-[#EDF7F0] px-5 py-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3C8A70]" />

            <p className="text-sm font-medium text-[#356B4B]">
              {success}
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-[#E7CFC8] bg-[#FBF3F0] px-5 py-4">
            <p className="text-sm font-medium text-[#9A6257]">
              {error}
            </p>
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="overflow-hidden rounded-2xl border border-[#DDDCD3] bg-white shadow-sm">

          {/* PROFILE TOP */}
          <div className="border-b border-[#E8E5DD] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8EFE4] text-[#526B3D]">
                  <UserRound className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[#173D2D]">
                    {therapist?.fullName || "Therapist"}
                  </h2>

                  <p className="mt-1 text-sm text-[#7A6A59]">
                    {therapist?.therapistType || "Therapist"}
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium sm:self-auto ${
                  available
                    ? "border-[#D5E8DE] bg-[#EDF7F0] text-[#356B4B]"
                    : "border-[#ECD8D2] bg-[#F7EDEA] text-[#A66A5B]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    available ? "bg-[#4F8A65]" : "bg-[#A66A5B]"
                  }`}
                />

                {available ? "Available" : "Currently unavailable"}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="px-6 py-7 sm:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-xl border border-[#DDDCD3] bg-white py-3 pl-10 pr-4 text-sm text-[#294F3E] outline-none transition focus:border-[#AFC5B4] focus:ring-2 focus:ring-[#E8EFE4]"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-[#E4E2DA] bg-[#F7F6F1] py-3 pl-10 pr-4 text-sm text-[#777D74]"
                  />
                </div>

                <p className="mt-1.5 text-xs text-[#91897C]">
                  Email is linked to your login account.
                </p>
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Phone
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-xl border border-[#DDDCD3] bg-white py-3 pl-10 pr-4 text-sm text-[#294F3E] outline-none transition focus:border-[#AFC5B4] focus:ring-2 focus:ring-[#E8EFE4]"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* SPECIALIZATION */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Specialization
                </label>

                <div className="relative">
                  <BriefcaseBusiness className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="text"
                    value={specialization}
                    onChange={(event) =>
                      setSpecialization(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#DDDCD3] bg-white py-3 pl-10 pr-4 text-sm text-[#294F3E] outline-none transition focus:border-[#AFC5B4] focus:ring-2 focus:ring-[#E8EFE4]"
                    placeholder="e.g. Abhyanga"
                  />
                </div>
              </div>

              {/* QUALIFICATION */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Qualification
                </label>

                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="text"
                    value={qualification}
                    onChange={(event) =>
                      setQualification(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#DDDCD3] bg-white py-3 pl-10 pr-4 text-sm text-[#294F3E] outline-none transition focus:border-[#AFC5B4] focus:ring-2 focus:ring-[#E8EFE4]"
                    placeholder="Enter your qualification"
                  />
                </div>
              </div>

              {/* EXPERIENCE */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Experience
                </label>

                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(event) =>
                      setExperienceYears(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#DDDCD3] bg-white py-3 pl-10 pr-4 text-sm text-[#294F3E] outline-none transition focus:border-[#AFC5B4] focus:ring-2 focus:ring-[#E8EFE4]"
                    placeholder="Years of experience"
                  />
                </div>
              </div>

              {/* THERAPIST TYPE */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[#8B7B68]">
                  Therapist Type
                </label>

                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A918B]" />

                  <input
                    type="text"
                    value={therapistType}
                    onChange={(event) =>
                      setTherapistType(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#DDDCD3] bg-white py-3 pl-10 pr-4 text-sm text-[#294F3E] outline-none transition focus:border-[#AFC5B4] focus:ring-2 focus:ring-[#E8EFE4]"
                    placeholder="e.g. PANCHAKARMA"
                  />
                </div>
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className="mt-7 rounded-xl border border-[#E5E3DA] bg-[#FAF9F5] px-4 py-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-medium text-[#3F4D40]">
                    Available for therapy sessions
                  </p>

                  <p className="mt-1 text-xs text-[#8B847A]">
                    Let the care team know whether you are currently available.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAvailable((current) => !current)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    available ? "bg-[#4F7A5D]" : "bg-[#C8C7BF]"
                  }`}
                  aria-label="Toggle therapist availability"
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      available ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* SAVE */}
            <div className="mt-8 flex justify-end border-t border-[#EEEAE2] pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315A46] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#244A3A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TherapistProfilePage;