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
import AdminPatientsPage from "./pages/admin/AdminPatientsPage";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminTherapistsPage from "./pages/admin/AdminTherapistsPage";
import AdminRoomsPage from "./pages/admin/AdminRoomsPage";
import AdminTherapiesPage from "./pages/admin/AdminTherapiesPage";
import AdminReceptionistsPage from "./pages/admin/AdminReceptionistsPage";
import AdminTherapyPlansPage from "./pages/admin/AdminTherapyPlansPage";
import AdminSchedulesPage from "./pages/admin/AdminSchedulesPage";
import AdminTherapySessionsPage from "./pages/admin/AdminTherapySessionsPage";
import AdminPatientProgressPage from "./pages/admin/AdminPatientProgressPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminAuditHistoryPage from "./pages/admin/AdminAuditHistoryPage";

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
import TherapistLayout from "./layouts/TherapistLayout";
import AssignedPatientsPage from "./pages/therapist/AssignedPatientsPage";
import TherapistPatientDetailsPage from "./pages/therapist/TherapistPatientDetailsPage";
import TherapistSessionsPage from "./pages/therapist/TherapistSessionsPage";
import TherapistSessionHistoryPage from "./pages/therapist/TherapistSessionHistoryPage";
import TherapistProfilePage from "./pages/therapist/TherapistProfilePage";
import TherapistUpcomingSessionsPage from "./pages/therapist/TherapistUpcomingSessionsPage";

// =====================================================
// RECEPTIONIST
// =====================================================

import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import ReceptionistSchedulerPage from "./pages/receptionist/ReceptionistSchedulerPage";
import ReceptionistLayout from "./layouts/ReceptionistLayout";
import ReceptionistPatientsPage from "./pages/receptionist/ReceptionistPatientsPage";
import ReceptionistPatientDetailsPage from "./pages/receptionist/ReceptionistPatientDetailsPage";
import ReceptionistRegisterPatientPage from "./pages/receptionist/ReceptionistRegisterPatientPage";
import ReceptionistTherapiesPage from "./pages/receptionist/ReceptionistTherapiesPage";
import ReceptionistRoomsPage from "./pages/receptionist/ReceptionistRoomsPage";
import ReceptionistTherapySessionsPage from "./pages/receptionist/ReceptionistTherapySessionsPage";
import ReceptionistEquipmentPage from "./pages/receptionist/ReceptionistEquipmentPage";

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
          <ProtectedRoute allowedRoles={["ADMIN"]} />
        }
      >
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/patients"
          element={<AdminPatientsPage />}
        />
        <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
        <Route
          path="/admin/therapists"
          element={<AdminTherapistsPage />}
        />
        <Route
          path="/admin/receptionists"
          element={<AdminReceptionistsPage />}
        />
        <Route
          path="/admin/therapy-plans"
          element={<AdminTherapyPlansPage />}
        />
        <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
        <Route
          path="/admin/therapy-sessions"
          element={<AdminTherapySessionsPage />}
        />
        <Route
          path="/admin/progress"
          element={<AdminPatientProgressPage />}
        />
        <Route
          path="/admin/reports"
          element={<AdminReportsPage />}
        />
        <Route
  path="/admin/audit-history"
  element={<AdminAuditHistoryPage />}
/>
        <Route
          path="/admin/rooms"
          element={<AdminRoomsPage />}
        />
        <Route
          path="/admin/therapies"
          element={<AdminTherapiesPage />}
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

      <Route element={<TherapistLayout />}>

        <Route
          path="/therapist"
          element={<TherapistDashboard />}
        />

        <Route
          path="/therapist/patients"
          element={<AssignedPatientsPage />}
        />

        <Route
          path="/therapist/patients/:id"
          element={<TherapistPatientDetailsPage />}
        />

        <Route
          path="/therapist/sessions"
          element={<TherapistSessionsPage />}
        />

        <Route
          path="/therapist/upcoming"
          element={<TherapistUpcomingSessionsPage />}
        />

        <Route
          path="/therapist/history"
          element={<TherapistSessionHistoryPage />}
        />

        <Route
          path="/therapist/profile"
          element={<TherapistProfilePage />}
        />



      </Route>

      {/* =====================================================
    RECEPTIONIST
    ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["RECEPTIONIST"]} />
        }
      >
        <Route
          path="/receptionist"
          element={<ReceptionistLayout />}
        >
          <Route
            index
            element={<ReceptionistDashboard />}
          />

          <Route
            path="patients"
            element={<ReceptionistPatientsPage />}
          />

          <Route
            path="patients/register"
            element={<ReceptionistRegisterPatientPage />}
          />

          <Route
            path="patients/:id"
            element={<ReceptionistPatientDetailsPage />}
          />

          <Route
            path="therapies"
            element={<ReceptionistTherapiesPage />}
          />

          <Route
            path="rooms"
            element={<ReceptionistRoomsPage />}
          />
          <Route path="equipment" element={<ReceptionistEquipmentPage />} />

          <Route
            path="scheduler"
            element={<ReceptionistSchedulerPage />}
          />

          <Route
            path="sessions"
            element={<ReceptionistTherapySessionsPage />}
          />
        </Route>
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