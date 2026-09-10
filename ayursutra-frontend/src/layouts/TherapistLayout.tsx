import { Outlet } from "react-router-dom";

import DashboardLayout from "./DashboardLayout";

function TherapistLayout() {
    return (
        <DashboardLayout
            role="THERAPIST"
            title="Therapy Workspace"
            subtitle="Manage your therapy sessions, patients and care."
        >
            <Outlet />
        </DashboardLayout>
    );
}

export default TherapistLayout;