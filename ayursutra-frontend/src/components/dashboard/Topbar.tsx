import { Bell, Menu, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  userName?: string;
  role?: string;
  onMenuClick?: () => void;
}

function Topbar({
  title,
  subtitle,
  userName,
  role,
  onMenuClick,
}: TopbarProps) {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-[#D9DDCE] bg-white px-5 py-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-[#4D5C4B] transition hover:bg-[#F8F6F0] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-[#1F3D2E] md:text-2xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 hidden text-sm text-[#7A806F] sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden rounded-xl p-2.5 text-[#4D5C4B] transition hover:bg-[#F8F6F0] md:block"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-[#4D5C4B] transition hover:bg-[#F8F6F0]"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#A46A4C]" />
        </button>

        <div className="ml-1 hidden h-9 w-px bg-[#D9DDCE] sm:block" />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-[#1F3D2E]">
            {userName}
          </p>

          <p className="text-xs uppercase tracking-wider text-[#71834F]">
            {role}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE5D6] text-sm font-semibold text-[#1F3D2E]">
          {userName?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

export default Topbar;