import { Outlet } from "react-router-dom";

import DashboardLayout from "./DashboardLayout";

function ReceptionistLayout() {
  return (
    <DashboardLayout
      role="RECEPTIONIST"
      title="Receptionist Workspace"
      subtitle="Manage patients, scheduling and daily operations."
    >
      <main className="min-h-[calc(100vh-5rem)] overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </DashboardLayout>
  );
}

export default ReceptionistLayout;