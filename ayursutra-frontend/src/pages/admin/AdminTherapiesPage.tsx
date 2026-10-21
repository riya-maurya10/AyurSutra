import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Topbar from "../../components/dashboard/Topbar";
import Sidebar from "../../components/dashboard/Sidebar";
import {
  getAllTherapies,
  type Therapy,
} from "../../services/therapy/therapyService";

function AdminTherapiesPage() {
  const navigate = useNavigate();

  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedTherapy, setSelectedTherapy] =
    useState<Therapy | null>(null);

  // =====================================================
  // LOAD THERAPIES
  // =====================================================

  const loadTherapies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllTherapies();

      setTherapies(data ?? []);
    } catch (err) {
      console.error("Failed to load therapies:", err);
      setError("Unable to load therapies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapies();
  }, []);

  // =====================================================
  // STAGES
  // =====================================================

  const stages = useMemo(() => {
    return Array.from(
      new Set(
        therapies
          .map((therapy) => therapy.stage)
          .filter(Boolean)
      )
    ).sort();
  }, [therapies]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTherapies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return therapies.filter((therapy) => {
      const matchesSearch =
        !query ||
        therapy.name.toLowerCase().includes(query) ||
        therapy.stage.toLowerCase().includes(query) ||
        (therapy.description ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStage =
        stageFilter === "ALL" ||
        therapy.stage === stageFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && therapy.active) ||
        (statusFilter === "INACTIVE" && !therapy.active);

      return (
        matchesSearch &&
        matchesStage &&
        matchesStatus
      );
    });
  }, [
    therapies,
    search,
    stageFilter,
    statusFilter,
  ]);

  // =====================================================
  // COUNTS
  // =====================================================

  const activeCount = therapies.filter(
    (therapy) => therapy.active
  ).length;

  const inactiveCount =
    therapies.length - activeCount;

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  const formatStage = (stage: string) => {
    return stage
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <Sidebar role="ADMIN" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
        <Topbar title="Therapies" />

        <main className="flex-1 p-5 md:p-8">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="mb-3 flex items-center text-[#617341] transition hover:text-[#1F3D2E]"
              aria-label="Back to Admin Dashboard"
            >
              <ArrowLeft
                size={18}
                strokeWidth={1.8}
              />
            </button>

            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                
                <h1 className="font-serif text-3xl font-medium text-[#1F3D2E] md:text-4xl">
                  Available Therapies
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-[#6B705C]">
                  View the therapies currently available at
                  the clinic.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total */}
            <div className="rounded-2xl border border-[#E3E0D5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7B8068]">
                    Total Therapies
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#1F3D2E]">
                    {therapies.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2E7] text-[#617341]">
                  <Sparkles size={21} />
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="rounded-2xl border border-[#E3E0D5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7B8068]">
                    Active Therapies
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#1F3D2E]">
                    {activeCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5EA] text-[#55733D]">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            {/* Inactive */}
            <div className="rounded-2xl border border-[#E3E0D5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7B8068]">
                    Inactive Therapies
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#1F3D2E]">
                    {inactiveCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EEE8] text-[#8A6247]">
                  <XCircle size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SEARCH + FILTERS
          ===================================================== */}

          <div className="mb-6 rounded-2xl border border-[#E3E0D5] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_180px]">
              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7A]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search therapies..."
                  className="h-11 w-full rounded-xl border border-[#DEDCCF] bg-[#FBFAF6] pl-10 pr-4 text-sm text-[#263A2E] outline-none transition placeholder:text-[#9A9D91] focus:border-[#8A9A6B] focus:ring-2 focus:ring-[#8A9A6B]/10"
                />
              </div>

              {/* Stage */}
              <select
                value={stageFilter}
                onChange={(event) =>
                  setStageFilter(event.target.value)
                }
                className="h-11 rounded-xl border border-[#DEDCCF] bg-[#FBFAF6] px-3 text-sm text-[#3F4A40] outline-none focus:border-[#8A9A6B]"
              >
                <option value="ALL">
                  All Stages
                </option>

                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {formatStage(stage)}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-11 rounded-xl border border-[#DEDCCF] bg-[#FBFAF6] px-3 text-sm text-[#3F4A40] outline-none focus:border-[#8A9A6B]"
              >
                <option value="ALL">
                  All Status
                </option>
                <option value="ACTIVE">
                  Active
                </option>
                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          {loading ? (
            <div className="rounded-2xl border border-[#E3E0D5] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D9DDCC] border-t-[#617341]" />

              <p className="text-sm text-[#777C6E]">
                Loading therapies...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#E8D5CC] bg-[#FFF9F6] p-8 text-center">
              <XCircle
                size={30}
                className="mx-auto mb-3 text-[#A06B52]"
              />

              <p className="text-sm text-[#8A6247]">
                {error}
              </p>
            </div>
          ) : filteredTherapies.length === 0 ? (
            <div className="rounded-2xl border border-[#E3E0D5] bg-white p-12 text-center shadow-sm">
              <Sparkles
                size={34}
                className="mx-auto mb-4 text-[#A5AC91]"
              />

              <h3 className="font-serif text-xl text-[#1F3D2E]">
                No therapies found
              </h3>

              <p className="mt-2 text-sm text-[#7B8068]">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTherapies.map((therapy) => (
                <div
                  key={therapy.id}
                  className="group rounded-2xl border border-[#E3E0D5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2E7] text-[#617341]">
                        <Sparkles size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-lg font-medium text-[#1F3D2E]">
                          {therapy.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-[#7B8068]">
                          {formatStage(therapy.stage)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        therapy.active
                          ? "bg-[#EAF3E5] text-[#55733D]"
                          : "bg-[#F1EEE9] text-[#7A766D]"
                      }`}
                    >
                      {therapy.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-5 line-clamp-3 min-h-[60px] text-sm leading-6 text-[#6B705C]">
                    {therapy.description ||
                      "No description available."}
                  </p>

                  {/* Duration */}
                  <div className="mb-5 flex items-center gap-2 border-t border-[#EEECE4] pt-4 text-sm text-[#6B705C]">
                    <Clock3 size={16} />

                    <span>
                      Duration:{" "}
                      <span className="font-medium text-[#3F4A40]">
                        {formatDuration(
                          therapy.durationMinutes
                        )}
                      </span>
                    </span>
                  </div>

                  {/* View Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTherapy(therapy)
                    }
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#D9DDCC] bg-[#F8F9F4] text-sm font-medium text-[#617341] transition hover:bg-[#EEF2E7]"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          VIEW DETAILS MODAL
      ===================================================== */}

      {selectedTherapy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F3D2E]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E8E6DE] px-6 py-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles
                    size={19}
                    className="text-[#617341]"
                  />

                  <span className="text-xs uppercase tracking-[0.16em] text-[#7B8068]">
                    Therapy Details
                  </span>
                </div>

                <h2 className="font-serif text-2xl text-[#1F3D2E]">
                  {selectedTherapy.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTherapy(null)
                }
                className="rounded-lg p-2 text-[#777C6E] transition hover:bg-[#F3F2EC] hover:text-[#1F3D2E]"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#F8F9F4] p-4">
                  <p className="mb-1 text-xs text-[#7B8068]">
                    Stage
                  </p>

                  <p className="text-sm font-medium text-[#314237]">
                    {formatStage(
                      selectedTherapy.stage
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F9F4] p-4">
                  <p className="mb-1 text-xs text-[#7B8068]">
                    Duration
                  </p>

                  <p className="text-sm font-medium text-[#314237]">
                    {formatDuration(
                      selectedTherapy.durationMinutes
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#7B8068]">
                  Status
                </p>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    selectedTherapy.active
                      ? "bg-[#EAF3E5] text-[#55733D]"
                      : "bg-[#F1EEE9] text-[#7A766D]"
                  }`}
                >
                  {selectedTherapy.active ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}

                  {selectedTherapy.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#7B8068]">
                  Description
                </p>

                <p className="text-sm leading-6 text-[#5F665C]">
                  {selectedTherapy.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-[#E8E6DE] px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedTherapy(null)
                }
                className="rounded-xl bg-[#1F3D2E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#294D3A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTherapiesPage;