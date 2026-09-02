import { Outlet } from "react-router-dom";

import DashboardLayout from "./DashboardLayout";

function PatientLayout() {
  return (
    <DashboardLayout
      role="PATIENT"
      title="My Wellness Journey"
      subtitle="Your Ayurvedic care, thoughtfully organized."
    >
      <Outlet />
    </DashboardLayout>
  );
}

export default PatientLayout;