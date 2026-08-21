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
    } catch (error) {
      console.error("Login failed:", error);

      setMessage(
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
          AyurSutra
        </p>

        <h1 className="mb-2 text-4xl font-semibold text-[#1F3D2E]">
          Welcome Back
        </h1>

        <p className="mb-8 text-[#5A4A3A]">
          Continue your Ayurvedic care journey.
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
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
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#A2B5A0] px-4 py-3 outline-none transition focus:border-[#1F3D2E]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#1F3D2E]"
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
              className="w-full rounded-xl border border-[#A2B5A0] px-4 py-3 outline-none transition focus:border-[#1F3D2E]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1F3D2E] px-4 py-3 font-medium text-white transition hover:bg-[#6B7F4E] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center text-sm text-[#5A4A3A]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;