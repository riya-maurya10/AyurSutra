import { Navigate, Route, Routes } from "react-router-dom";

// =====================================================
// AUTH
// =====================================================

import LoginPage from "./pages/auth/LoginPage";

// =====================================================
// PUBLIC
// =====================================================
import TermsAndConditionsPage from "./pages/public/TermsAndConditionsPage";

import HomePage from "./pages/public/HomePage";
import RegisterPage from "./pages/public/RegisterPage";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./pages/admin/AdminDashboard";

// =====================================================
// DOCTOR
// =====================================================

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorLayout from "./layouts/DoctorLayout";
import MyPatientsPage from "./pages/doctor/MyPatientsPage";
import PatientClinicalRecordPage from "./pages/doctor/PatientClinicalRecordPage";
import DoctorTherapyPlanPage from "./pages/doctor/DoctorTherapyPlanPage";
import DoctorDietPlanPage from "./pages/doctor/PatientDietPlanPage";
import DoctorTherapyPlansPage from "./pages/doctor/DoctorTherapyPlansPage";
import DoctorTherapySessionsPage from "./pages/doctor/DoctorTherapySessionsPage";

// =====================================================
// THERAPIST
// =====================================================

import TherapistDashboard from "./pages/therapist/TherapistDashboard";

// =====================================================
// RECEPTIONIST
// =====================================================

import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";

// =====================================================
// PATIENT
// =====================================================

import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfilePage from "./pages/patient/PatientProfilePage";
import PatientTherapyPlan from "./pages/patient/PatientTherapyPlan";
import PatientSessionsPage from "./pages/patient/PatientSessionsPage";
import PatientDietPlanPage from "./pages/patient/PatientDietPlanPage";
import PatientProgressPage from "./pages/patient/PatientProgressPage";

// =====================================================
// COMMON
// =====================================================

import UnauthorizedPage from "./pages/common/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// LAYOUTS
// =====================================================
import PatientLayout from "./layouts/PatientLayout";

function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC HOME PAGE
          ===================================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />

      {/* =====================================================
          PUBLIC REGISTRATION
          ===================================================== */}

      <Route
        path="/register"
        element={<RegisterPage />}
      />
      <Route
        path="/terms"
        element={<TermsAndConditionsPage />}
      />
      <Route
        path="/privacy"
        element={<PrivacyPolicyPage />}
      />

      {/* =====================================================
          LOGIN
          ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* =====================================================
          UNAUTHORIZED
          ===================================================== */}

      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* =====================================================
          ADMIN
          ===================================================== */}

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

      {/* =====================================================
          DOCTOR
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["DOCTOR"]}
          />
        }
      >
        <Route element={<DoctorLayout />}>

          {/* DOCTOR DASHBOARD */}
          <Route
            path="/doctor"
            element={<DoctorDashboard />}
          />

          {/* MY PATIENTS */}
          <Route
            path="/doctor/patients"
            element={<MyPatientsPage />}
          />

          {/* PATIENT CLINICAL RECORD */}
          <Route
            path="/doctor/patients/:id"
            element={<PatientClinicalRecordPage />}
          />

          {/* CREATE THERAPY PLAN */}
          <Route
            path="/doctor/patients/:id/therapy-plan"
            element={<DoctorTherapyPlanPage />}
          />

          <Route
            path="/doctor/patients/:id/diet-plan"
            element={<DoctorDietPlanPage />}
          />

          <Route
            path="/doctor/plans"
            element={<DoctorTherapyPlansPage />}
          />

          <Route
            path="/doctor/sessions"
            element={<DoctorTherapySessionsPage />}
          />
        </Route>
      </Route>

      {/* =====================================================
          THERAPIST
          ===================================================== */}

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

      {/* =====================================================
          RECEPTIONIST
          ===================================================== */}

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

      {/* =====================================================
          PATIENT
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["PATIENT"]}
          />
        }
      >

        {/* ===================================================
            PATIENT LAYOUT

            All patient pages are inside PatientLayout so
            they share:
            - Sidebar
            - Topbar
            - Patient navigation
            - Common patient UI
            =================================================== */}

        <Route element={<PatientLayout />}>

          {/* ===============================================
              PATIENT DASHBOARD
              =============================================== */}

          <Route
            path="/patient"
            element={<PatientDashboard />}
          />

          {/* ===============================================
              PATIENT PROFILE
              =============================================== */}

          <Route
            path="/patient/profile"
            element={<PatientProfilePage />}
          />

          {/* ===============================================
              PATIENT THERAPY PLAN
              =============================================== */}

          <Route
            path="/patient/plan"
            element={<PatientTherapyPlan />}
          />

          {/* ===============================================
              PATIENT DIET PLAN
              =============================================== */}

          <Route
            path="/patient/diet-plan"
            element={<PatientDietPlanPage />}
          />

          {/* ===============================================
              PATIENT THERAPY SESSIONS
              =============================================== */}

          <Route
            path="/patient/sessions"
            element={<PatientSessionsPage />}
          />

          {/* ===============================================
              PATIENT PROGRESS
              
              Add this when PatientProgressPage exists.
              =============================================== */}


          <Route
            path="/patient/progress"
            element={<PatientProgressPage />}
          />


        </Route>
      </Route>

      {/* =====================================================
          FALLBACK
          ===================================================== */}

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