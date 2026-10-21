import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "/admin";

      case "DOCTOR":
        return "/doctor";

      case "THERAPIST":
        return "/therapist";

      case "RECEPTIONIST":
        return "/receptionist";

      case "PATIENT":
        return "/patient";

      default:
        return "/unauthorized";
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardPath(user.role), {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = await login({
        email,
        password,
      });

      console.log("Login response:", data);

      navigate(getDashboardPath(data.role), {
        replace: true,
      });
    } catch (error: any) {
      console.error("Login failed:", error);

      const backendMessage =
        error?.response?.data?.message;

      setMessage(
        backendMessage ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* =====================================================
          BACKGROUND IMAGE
          ===================================================== */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/ayurvedic-login-bg.png')",
        }}
      />

      {/* =====================================================
          SOFT OVERLAY
          Keeps the background visible while making the
          login card and text stand out.
          ===================================================== */}

      <div className="absolute inset-0 bg-[#173D2D]/10" />

      {/* =====================================================
          BACK TO HOME
          ===================================================== */}

      <button
        type="button"
        onClick={() => navigate("/")}
        className="
    absolute
    left-8
    top-8
    z-20
    inline-flex
    items-center
    gap-2
    text-sm
    font-medium
    text-[#173D2D]
    transition
    duration-200
    hover:text-[#6B7F4E]
  "
      >
        <span className="text-lg leading-none">←</span>
        Back to Home
      </button>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">

        {/* ===================================================
            LOGIN CARD
            =================================================== */}

        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-white/70
            bg-[#FFFDF8]/95
            p-8
            shadow-2xl
            backdrop-blur-md
            sm:p-10
          "
        >

          {/* BRAND */}

          <div className="mb-7">

            <p
              className="
                mb-2
                text-sm
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#71834F]
              "
            >
              AyurSutra
            </p>

            <h1
              className="
                mb-2
                text-4xl
                font-semibold
                tracking-tight
                text-[#173D2D]
              "
            >
              Welcome Back
            </h1>

            <p className="text-[#5A4A3A]">
              Continue your Ayurvedic care journey.
            </p>

          </div>

          {/* =================================================
              LOGIN FORM
              ================================================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-[#173D2D]
                "
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                placeholder="Enter your email"
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#B8C4B4]
                  bg-white
                  px-4
                  py-3
                  text-[#173D2D]
                  placeholder:text-[#9AA49C]
                  outline-none
                  transition
                  duration-200
                  focus:border-[#71834F]
                  focus:ring-2
                  focus:ring-[#71834F]/20
                "
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-[#173D2D]
                "
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                placeholder="Enter your password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#B8C4B4]
                  bg-white
                  px-4
                  py-3
                  text-[#173D2D]
                  placeholder:text-[#9AA49C]
                  outline-none
                  transition
                  duration-200
                  focus:border-[#71834F]
                  focus:ring-2
                  focus:ring-[#71834F]/20
                "
              />

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-[#173D2D]
                px-4
                py-3.5
                font-semibold
                text-white
                shadow-sm
                transition
                duration-200
                hover:bg-[#24533F]
                hover:shadow-md
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>

          {/* =================================================
              ERROR MESSAGE
              ================================================= */}

          {message && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-[#E4C8C2]
                bg-[#FBF1EE]
                px-4
                py-3
                text-center
                text-sm
                text-[#8A4A3C]
              "
            >
              {message}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default LoginPage;