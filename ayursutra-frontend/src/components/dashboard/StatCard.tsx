import type { ComponentType } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ComponentType<{ size?: number }>;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E1E4DB] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#71834F]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold text-[#1F3D2E]">
            {loading ? "..." : value}
          </p>

          <p className="mt-2 text-xs text-[#7A806F]">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;