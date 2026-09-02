import { Outlet } from "react-router-dom";

import DashboardLayout from "./DashboardLayout";

function DoctorLayout() {
  return (
    <DashboardLayout
      role="DOCTOR"
      title="Doctor Dashboard"
      subtitle="Manage your patients, treatment plans and care sessions."
    >
      <Outlet />
    </DashboardLayout>
  );
}

export default DoctorLayout;