import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";

import HomePage from "./pages/public/HomePage";
import RegisterPage from "./pages/public/RegisterPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import TherapistDashboard from "./pages/therapist/TherapistDashboard";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";

import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfilePage from "./pages/patient/PatientProfilePage";

import UnauthorizedPage from "./pages/common/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ===================================================== */}
      {/* PUBLIC REGISTRATION */}
      {/* ===================================================== */}

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* ===================================================== */}
      {/* PUBLIC HOME PAGE */}
      {/* ===================================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />

      {/* ===================================================== */}
      {/* AUTH */}
      {/* ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* ===================================================== */}
      {/* UNAUTHORIZED */}
      {/* ===================================================== */}

      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* ===================================================== */}
      {/* ADMIN */}
      {/* ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN"]}
          />
        }
      >
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Route>

      {/* ===================================================== */}
      {/* DOCTOR */}
      {/* ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["DOCTOR"]}
          />
        }
      >
        <Route
          path="/doctor"
          element={<DoctorDashboard />}
        />
      </Route>

      {/* ===================================================== */}
      {/* THERAPIST */}
      {/* ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["THERAPIST"]}
          />
        }
      >
        <Route
          path="/therapist"
          element={<TherapistDashboard />}
        />
      </Route>

      {/* ===================================================== */}
      {/* RECEPTIONIST */}
      {/* ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["RECEPTIONIST"]}
          />
        }
      >
        <Route
          path="/receptionist"
          element={<ReceptionistDashboard />}
        />
      </Route>

      {/* ===================================================== */}
      {/* PATIENT */}
      {/* ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["PATIENT"]}
          />
        }
      >

        {/* Patient Dashboard */}
        <Route
          path="/patient"
          element={<PatientDashboard />}
        />

        {/* Patient Profile */}
        <Route
          path="/patient/profile"
          element={<PatientProfilePage />}
        />

      </Route>

      {/* ===================================================== */}
      {/* FALLBACK */}
      {/* ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;