import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Menu,
  Search,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  title: string;
  subtitle?: string;
  userName?: string;
  role?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

function Topbar({
  title,
  subtitle,
  userName,
  role,
  userEmail,
  onMenuClick,
}: TopbarProps) {
  const navigate = useNavigate();

  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");

    setAccountOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const handleProfile = () => {
    setAccountOpen(false);

    const normalizedRole =
      role?.toUpperCase() || "";

    if (normalizedRole === "PATIENT") {
      navigate("/patient/profile");
    } else if (normalizedRole === "DOCTOR") {
      navigate("/doctor/profile");
    } else if (normalizedRole === "THERAPIST") {
      navigate("/therapist/profile");
    } else if (normalizedRole === "RECEPTIONIST") {
      navigate("/receptionist/profile");
    } else if (normalizedRole === "ADMIN") {
      navigate("/admin/profile");
    } else {
      navigate("/unauthorized");
    }
  };

  // =========================================================
  // SETTINGS
  // =========================================================

  const handleSettings = () => {
    setAccountOpen(false);

    const normalizedRole =
      role?.toUpperCase() || "";

    if (normalizedRole === "PATIENT") {
      navigate("/patient/settings");
    } else if (normalizedRole === "DOCTOR") {
      navigate("/doctor/settings");
    } else if (normalizedRole === "THERAPIST") {
      navigate("/therapist/settings");
    } else if (normalizedRole === "RECEPTIONIST") {
      navigate("/receptionist/settings");
    } else if (normalizedRole === "ADMIN") {
      navigate("/admin/settings");
    } else {
      navigate("/unauthorized");
    }
  };

  // =========================================================
  // INITIAL
  // =========================================================

  const initial =
    userName?.charAt(0).toUpperCase() || "U";

  return (
    <header className="relative z-50 flex h-20 items-center justify-between border-b border-[#D9DDCE] bg-white px-5 lg:px-8">

      {/* ===================================================
    LEFT
=================================================== */}

<div className="flex items-center gap-4">

  {/* Mobile menu */}

  <button
    type="button"
    onClick={onMenuClick}
    className="rounded-xl p-2 text-[#4D5C4B] transition hover:bg-[#F8F6F0] lg:hidden"
    aria-label="Open menu"
  >
    <Menu size={22} />
  </button>

  <div>

    <h1 className="text-lg font-semibold tracking-tight text-[#1F3D2E] md:text-xl">
      {title}
    </h1>

    {subtitle && (
      <p className="mt-0.5 hidden text-xs text-[#7A806F] sm:block">
        {subtitle}
      </p>
    )}

  </div>

</div>

      {/* ===================================================
          RIGHT
      =================================================== */}

      <div className="flex items-center gap-3">

        {/* Search */}

        <button
          type="button"
          className="hidden rounded-xl p-2.5 text-[#4D5C4B] transition hover:bg-[#F8F6F0] md:block"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        {/* Notifications */}

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-[#4D5C4B] transition hover:bg-[#F8F6F0]"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#A46A4C]" />
        </button>

        {/* Divider */}

        <div className="ml-1 hidden h-9 w-px bg-[#D9DDCE] sm:block" />

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <div
          ref={accountRef}
          className="relative"
        >

          {/* Account button */}

          <button
            type="button"
            onClick={() =>
              setAccountOpen((previous) => !previous)
            }
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#F8F6F0]"
          >

            {/* Name */}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#1F3D2E]">
                {userName || "User"}
              </p>
            </div>

            {/* Avatar */}

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE5D6] text-sm font-semibold text-[#1F3D2E]">
              {initial}
            </div>

          </button>

          {/* =================================================
              ACCOUNT DROPDOWN
          ================================================= */}

          {accountOpen && (
            <div
              className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-[#D9DDCE] bg-white shadow-xl"
              role="menu"
            >

              {/* Account information */}

              <div className="border-b border-[#E7E8E0] bg-[#F8F6F0] px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DDE5D6] text-sm font-semibold text-[#1F3D2E]">
                    {initial}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-[#1F3D2E]">
                      {userName || "User"}
                    </p>

                    <p className="truncate text-xs text-[#718078]">
                      {userEmail || "Account"}
                    </p>

                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#71834F]">
                      {role || "USER"}
                    </p>

                  </div>

                </div>

              </div>

              {/* Menu items */}

              <div className="p-2">

                {/* My Profile */}

                <button
                  type="button"
                  onClick={handleProfile}
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#4D5C4B] transition hover:bg-[#F8F6F0] hover:text-[#1F3D2E]"
                >

                  <UserRound size={18} />

                  <span>
                    My Profile
                  </span>

                </button>

                {/* Settings */}

                <button
                  type="button"
                  onClick={handleSettings}
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#4D5C4B] transition hover:bg-[#F8F6F0] hover:text-[#1F3D2E]"
                >

                  <Settings size={18} />

                  <span>
                    Settings
                  </span>

                </button>

              </div>

              {/* Logout */}

              <div className="border-t border-[#E7E8E0] p-2">

                <button
                  type="button"
                  onClick={handleLogout}
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#8B4A42] transition hover:bg-[#F5E9E7]"
                >

                  <LogOut size={18} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;