import { useState } from "react";
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

interface DashboardLayoutProps {
  role?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

function DashboardLayout({
  role,
  title = "Dashboard",
  subtitle = "Manage your AyurSutra care journey.",
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedRole =
    role ||
    localStorage.getItem("userRole") ||
    "";

  const storedName =
    localStorage.getItem("userFullName") ||
    "User";

  const storedEmail =
    localStorage.getItem("userEmail") ||
    "";

  const normalizedRole = storedRole.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1F3D2E]">

      {/* ================================================= */}
      {/* FIXED SIDEBAR + MAIN APPLICATION */}
      {/* ================================================= */}

      <Sidebar
        role={normalizedRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ================================================= */}
      {/* MAIN APPLICATION AREA */}
      {/* ================================================= */}

      <div className="min-h-screen lg:ml-72">

        {/* ================================================= */}
        {/* TOPBAR */}
        {/* ================================================= */}

        <Topbar
          title={title}
          subtitle={subtitle}
          userName={storedName}
          role={normalizedRole}
          userEmail={storedEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ================================================= */}
        {/* PAGE CONTENT */}
        {/* ================================================= */}

        <main className="min-h-[calc(100vh-5rem)]">

          {children ? (
            children
          ) : (
            <Outlet />
          )}

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;