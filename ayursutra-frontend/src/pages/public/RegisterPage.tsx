import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import doctorConsultationImage from "./images/ayursutra-doctor-consultation.png";

import { register } from "../../services/auth/authService";
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------
    // FRONTEND VALIDATION
    // -----------------------------

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError(
        "Please accept the Terms of Service and Privacy Policy."
      );
      return;
    }

    // -----------------------------
    // REGISTER USER
    // -----------------------------

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      console.log("Patient registration successful.");

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );
      

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      // Redirect after short delay
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);

    } catch (error: any) {

      console.error(
        "Patient registration failed:",
        error
      );

      // Backend error message
      const backendMessage =
        error?.response?.data?.message;

      if (backendMessage) {
        setError(backendMessage);
      } else if (error?.response?.status === 400) {
        setError(
          "Registration failed. Please check your information."
        );
      } else if (!error?.response) {
        setError(
          "Unable to connect to AyurSutra backend. Please make sure the server is running."
        );
      } else {
        setError(
          "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ===================================================== */}
        {/* LEFT — AYURVEDIC VISUAL */}
        {/* ===================================================== */}

        <div className="relative hidden min-h-screen overflow-hidden lg:block">

          <img
            src={doctorConsultationImage}
            alt="Ayurvedic consultation at AyurSutra"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[#123d2f]/45" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-16 text-white">

            {/* LOGO */}

            <div>
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 text-xl">
                  A
                </div>

                <div>

                  <div className="text-xl font-semibold tracking-[0.18em]">
                    AYURSUTRA
                  </div>

                  <div className="text-xs tracking-[0.18em] text-[#e8e4b0]">
                    PANCHAKARMA & WELLNESS
                  </div>

                </div>

              </div>
            </div>

            {/* MAIN MESSAGE */}

            <div className="max-w-xl pb-10">

              <p className="mb-6 text-sm tracking-[0.35em] text-[#e8e4b0]">
                BEGIN YOUR JOURNEY
              </p>

              <h1 className="text-5xl font-semibold leading-[1.08]">

                A more

                <br />

                <span className="text-[#eee6ad]">
                  balanced approach
                </span>

                <br />

                to care.

              </h1>

              <p className="mt-8 max-w-lg text-base leading-7 text-white/85">
                Create your AyurSutra account and take the
                first step toward a more organized and
                personalized Ayurvedic care journey.
              </p>

            </div>

          </div>

        </div>


        {/* ===================================================== */}
        {/* RIGHT — REGISTRATION FORM */}
        {/* ===================================================== */}

        <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">

          <div className="w-full max-w-lg">

            {/* MOBILE LOGO */}

            <Link
              to="/"
              className="mb-10 flex items-center gap-3 lg:hidden"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9EAE8B] text-[#173D2D]">
                A
              </div>

              <div>

                <div className="text-lg font-semibold tracking-[0.16em]">
                  AYURSUTRA
                </div>

                <div className="text-[9px] tracking-[0.22em] text-[#71834F]">
                  PANCHAKARMA & WELLNESS
                </div>

              </div>

            </Link>


            {/* HEADING */}

            <div className="mb-8">

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#71834F]">
                CREATE YOUR ACCOUNT
              </p>

              <h2 className="text-4xl font-semibold tracking-tight text-[#173D2D]">
                Begin your AyurSutra journey.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#667168]">
                Create a patient account to access your
                personalized Ayurvedic care experience.
              </p>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* FULL NAME */}

              <div>

                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm text-[#173D2D] outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm text-[#173D2D] outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>


              {/* PHONE */}

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
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 text-sm text-[#173D2D] outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    disabled={loading}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 pr-20 text-sm text-[#173D2D] outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#71834F]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[#31483C]"
                >
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    disabled={loading}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-[#D7D9CF] bg-white px-4 py-3.5 pr-20 text-sm text-[#173D2D] outline-none transition placeholder:text-[#9AA198] focus:border-[#71834F] focus:ring-2 focus:ring-[#71834F]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#71834F]"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}


              {/* SUCCESS */}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}


              {/* TERMS */}

              <label className="flex cursor-pointer items-start gap-3 text-sm text-[#667168]">

                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) =>
                    setAgree(e.target.checked)
                  }
                  disabled={loading}
                  className="mt-1 h-4 w-4 accent-[#1F3D2E]"
                />

                <span className="leading-6">

                  I agree to the{" "}

                  <span className="font-medium text-[#173D2D]">
                    Terms of Service
                  </span>

                  {" "}and{" "}

                  <span className="font-medium text-[#173D2D]">
                    Privacy Policy
                  </span>

                  .

                </span>

              </label>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#173D2D] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#24533F] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Creating Account..."
                  : "Create Patient Account"}

              </button>

            </form>


            {/* LOGIN */}

            <div className="mt-7 text-center text-sm text-[#667168]">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-[#173D2D] underline-offset-4 hover:underline"
              >
                Login
              </Link>

            </div>


            {/* STAFF NOTE */}

            <div className="mt-8 rounded-2xl border border-[#DCDDD3] bg-[#EFF1E8] px-5 py-4">

              <p className="text-xs leading-5 text-[#667168]">

                <span className="font-semibold text-[#173D2D]">
                  Are you AyurSutra staff?
                </span>{" "}

                Doctors, therapists and receptionists receive
                access through the clinic administration system.

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RegisterPage;