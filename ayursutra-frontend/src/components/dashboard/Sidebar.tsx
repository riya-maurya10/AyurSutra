import {
  LayoutDashboard,
  Users,
  UserRound,
  Stethoscope,
  HeartPulse,
  Sparkles,
  BedDouble,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Package,
  Activity,
  Settings,
  LogOut,
  X,
  Leaf,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
  // =====================================================
  // ADMIN
  // =====================================================

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

  // =====================================================
  // DOCTOR
  // =====================================================

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
    // {
    //   label: "Patient Progress",
    //   path: "/doctor/progress",
    //   icon: Activity,
    // },
  ],

  // =====================================================
  // THERAPIST
  // =====================================================

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
  label: "Upcoming Sessions",
  path: "/therapist/upcoming",
  icon: CalendarClock,
},
    {
      label: "Session History",
      path: "/therapist/history",
      icon: ClipboardList,
    },
  ],

  // =====================================================
  // RECEPTIONIST
  // =====================================================

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
      label: "Equipment", 
      path: "/receptionist/equipment", 
      icon: Package 
    },
    {
      label: "Scheduler",
      path: "/receptionist/scheduler",
      icon: CalendarDays,
    },
    {
      label: "Therapy Sessions",
      path: "/receptionist/sessions",
      icon: ClipboardList,
    },
  ],

  // =====================================================
  // PATIENT
  // =====================================================

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
      label: "My Diet Plan",
      path: "/patient/diet-plan",
      icon: Leaf,
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

// =====================================================
// SIDEBAR COMPONENT
// =====================================================

function Sidebar({
  role,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const normalizedRole =
    role?.toUpperCase() || "";

  const items =
    menuItems[normalizedRole] || [];

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    onClose?.();

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // ROLE HOME
  // =====================================================

  const getRoleHomePath = () => {
    switch (normalizedRole) {
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
        return "/patient";
    }
  };

  // =====================================================
  // SETTINGS PATH
  // =====================================================

  const getSettingsPath = () => {
    switch (normalizedRole) {
      case "ADMIN":
        return "/admin/settings";

      case "DOCTOR":
        return "/doctor/settings";

      case "THERAPIST":
        return "/therapist/settings";

      case "RECEPTIONIST":
        return "/receptionist/settings";

      case "PATIENT":
        return "/patient/settings";

      default:
        return "/patient/settings";
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <>
      {/* ================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ================================================= */}

      {isOpen && (
        <div
          className="
            fixed inset-0 z-30
            bg-black/30
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-40
          flex h-screen w-72 flex-col
          border-r border-white/10
          bg-[#173D2D]
          transition-transform duration-300

          lg:translate-x-0
          lg:z-40

          ${isOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >

        {/* ================================================= */}
        {/* BRAND */}
        {/* ================================================= */}

        <div
          className="
            flex h-20
            items-center
            justify-between
            border-b border-white/10
            px-6
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate(getRoleHomePath())
            }
            className="text-left"
          >

            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#DDE5D6]
              "
            >
              AyurSutra
            </p>

            <p
              className="
                mt-1
                text-lg
                font-semibold
                text-white
              "
            >
              Wellness Care
            </p>

          </button>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-[#DDE5D6]
              transition
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>

        {/* ================================================= */}
        {/* CURRENT ROLE */}
        {/* ================================================= */}

        <div className="px-6 py-5">

          <div
            className="
              rounded-2xl
              border border-white/10
              bg-white/10
              px-4
              py-3
              backdrop-blur-sm
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-[#DDE5D6]
              "
            >
              Current Role
            </p>

            <p
              className="
                mt-1
                text-sm
                font-semibold
                text-white
              "
            >
              {normalizedRole}
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-4
            pb-6
          "
        >

          <p
            className="
              mb-3
              px-3
              text-xs
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#AEBEAA]
            "
          >
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
                  end={
                    item.path ===
                    `/${normalizedRole.toLowerCase()}`
                  }
                  className={({ isActive }) =>
                    `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${isActive
                      ? "bg-[#DDE5D6] text-[#173D2D] shadow-sm"
                      : "text-[#DDE5D6] hover:bg-white/10 hover:text-white"
                    }
                    `
                  }
                >

                  <Icon size={19} />

                  <span>
                    {item.label}
                  </span>

                </NavLink>
              );

            })}

          </div>

        </nav>

        {/* ================================================= */}
        {/* BOTTOM SECTION */}
        {/* ================================================= */}

        <div
          className="
            border-t
            border-white/10
            p-4
          "
        >

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() => {
              navigate(getSettingsPath());
              onClose?.();
            }}
            className="
              mb-2
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-[#DDE5D6]
              transition
              hover:bg-white/10
              hover:text-white
            "
          >

            <Settings size={19} />

            <span>
              Settings
            </span>

          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-[#E8A49B]
              transition
              hover:bg-[#8B4A42]/20
              hover:text-[#F2B8B0]
            "
          >

            <LogOut size={19} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;