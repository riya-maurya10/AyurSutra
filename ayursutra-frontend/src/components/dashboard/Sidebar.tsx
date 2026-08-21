import {
  LayoutDashboard,
  Users,
  UserRound,
  Stethoscope,
  HeartPulse,
  Sparkles,
  BedDouble,
  CalendarDays,
  ClipboardList,
  Activity,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

interface SidebarProps {
  role: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
}

const menuItems: Record<string, MenuItem[]> = {
  ADMIN: [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Patients",
      path: "/admin/patients",
      icon: Users,
    },
    {
      label: "Doctors",
      path: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      label: "Therapists",
      path: "/admin/therapists",
      icon: HeartPulse,
    },
    {
      label: "Therapies",
      path: "/admin/therapies",
      icon: Sparkles,
    },
    {
      label: "Rooms",
      path: "/admin/rooms",
      icon: BedDouble,
    },
    {
      label: "Schedules",
      path: "/admin/schedules",
      icon: CalendarDays,
    },
    {
      label: "Therapy Sessions",
      path: "/admin/sessions",
      icon: ClipboardList,
    },
  ],

  DOCTOR: [
    {
      label: "Dashboard",
      path: "/doctor",
      icon: LayoutDashboard,
    },
    {
      label: "My Patients",
      path: "/doctor/patients",
      icon: Users,
    },
    {
      label: "Therapy Plans",
      path: "/doctor/plans",
      icon: ClipboardList,
    },
    {
      label: "Therapy Sessions",
      path: "/doctor/sessions",
      icon: CalendarDays,
    },
    {
      label: "Patient Progress",
      path: "/doctor/progress",
      icon: Activity,
    },
  ],

  THERAPIST: [
    {
      label: "Dashboard",
      path: "/therapist",
      icon: LayoutDashboard,
    },
    {
      label: "Assigned Patients",
      path: "/therapist/patients",
      icon: Users,
    },
    {
      label: "Today's Sessions",
      path: "/therapist/sessions",
      icon: CalendarDays,
    },
    {
      label: "Session History",
      path: "/therapist/history",
      icon: ClipboardList,
    },
  ],

  RECEPTIONIST: [
    {
      label: "Dashboard",
      path: "/receptionist",
      icon: LayoutDashboard,
    },
    {
      label: "Patients",
      path: "/receptionist/patients",
      icon: Users,
    },
    {
      label: "Therapies",
      path: "/receptionist/therapies",
      icon: Sparkles,
    },
    {
      label: "Rooms",
      path: "/receptionist/rooms",
      icon: BedDouble,
    },
    {
      label: "Schedules",
      path: "/receptionist/schedules",
      icon: CalendarDays,
    },
    {
      label: "Therapy Sessions",
      path: "/receptionist/sessions",
      icon: ClipboardList,
    },
  ],

  PATIENT: [
    {
      label: "Dashboard",
      path: "/patient",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/patient/profile",
      icon: UserRound,
    },
    {
      label: "My Therapy Plan",
      path: "/patient/plan",
      icon: ClipboardList,
    },
    {
      label: "My Sessions",
      path: "/patient/sessions",
      icon: CalendarDays,
    },
    {
      label: "My Progress",
      path: "/patient/progress",
      icon: Activity,
    },
  ],
};

function Sidebar({
  role,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  const normalizedRole = role?.toUpperCase() || "";

  const items = menuItems[normalizedRole] || [];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");

    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-40
          flex h-screen w-72 flex-col
          border-r border-[#D9DDCE]
          bg-[#F8F6F0]
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-[#D9DDCE] px-6">
          <button
            type="button"
            onClick={() => navigate(
              normalizedRole === "ADMIN"
                ? "/admin"
                : normalizedRole === "DOCTOR"
                ? "/doctor"
                : normalizedRole === "THERAPIST"
                ? "/therapist"
                : normalizedRole === "RECEPTIONIST"
                ? "/receptionist"
                : "/patient"
            )}
            className="text-left"
          >
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#71834F]">
              AyurSutra
            </p>

            <p className="mt-1 text-lg font-semibold text-[#1F3D2E]">
              Wellness Care
            </p>
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#5A4A3A] hover:bg-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role */}
        <div className="px-6 py-5">
          <div className="rounded-2xl border border-[#D9DDCE] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[#71834F]">
              Current Role
            </p>

            <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
              {normalizedRole}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A927B]">
            Navigation
          </p>

          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  end={item.path === `/${normalizedRole.toLowerCase()}`}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 rounded-xl
                    px-3 py-3 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#1F3D2E] text-white shadow-sm"
                        : "text-[#4D5C4B] hover:bg-white hover:text-[#1F3D2E]"
                    }
                    `
                  }
                >
                  <Icon size={19} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#D9DDCE] p-4">
          <button
            type="button"
            onClick={() => {
              navigate(
                normalizedRole === "ADMIN"
                  ? "/admin/settings"
                  : normalizedRole === "DOCTOR"
                  ? "/doctor/settings"
                  : normalizedRole === "THERAPIST"
                  ? "/therapist/settings"
                  : normalizedRole === "RECEPTIONIST"
                  ? "/receptionist/settings"
                  : "/patient/settings"
              );
              onClose?.();
            }}
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#4D5C4B] transition hover:bg-white hover:text-[#1F3D2E]"
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#8B4A42] transition hover:bg-[#F5E9E7]"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;