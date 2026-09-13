import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  createReceptionistTherapy,
  getReceptionistTherapies,
  updateReceptionistTherapy,
  deleteReceptionistTherapy,
  type ReceptionistTherapy,
  type TherapyRequest,
} from "../../services/receptionist/receptionistService";

// =====================================================
// COMPONENT
// =====================================================

function ReceptionistTherapiesPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [therapies, setTherapies] = useState<
    ReceptionistTherapy[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedTherapy, setSelectedTherapy] =
    useState<ReceptionistTherapy | null>(null);

  // =====================================================
  // FORM MODAL
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  const [editingTherapy, setEditingTherapy] =
    useState<ReceptionistTherapy | null>(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<TherapyRequest>({
    name: "",
    stage: "",
    description: "",
    durationMinutes: 60,
    active: true,
  });
  const handleDelete = async (therapy: ReceptionistTherapy) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${therapy.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteReceptionistTherapy(therapy.id);

      setTherapies((prev) =>
        prev.filter((item) => item.id !== therapy.id)
      );

      if (selectedTherapy?.id === therapy.id) {
        setSelectedTherapy(null);
      }

      alert("Therapy deleted successfully.");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Failed to delete therapy."
      );
    }
  };

  // =====================================================
  // LOAD THERAPIES
  // =====================================================

  const loadTherapies = async (
    isRefresh = false
  ) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data =
        await getReceptionistTherapies();

      setTherapies(data ?? []);
    } catch (err) {
      console.error(
        "Failed to load therapies:",
        err
      );

      setError(
        "Unable to load therapies."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTherapies();
  }, []);

  // =====================================================
  // STAGES
  // =====================================================

  const stages = useMemo(() => {
    const uniqueStages = Array.from(
      new Set(
        therapies
          .map((therapy) => therapy.stage)
          .filter(Boolean)
      )
    );

    return uniqueStages.sort();
  }, [therapies]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTherapies = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return therapies.filter((therapy) => {
      const matchesSearch =
        !query ||
        therapy.name
          .toLowerCase()
          .includes(query) ||
        therapy.stage
          .toLowerCase()
          .includes(query) ||
        (therapy.description || "")
          .toLowerCase()
          .includes(query);

      const matchesStage =
        stageFilter === "ALL" ||
        therapy.stage === stageFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          therapy.active) ||
        (statusFilter === "INACTIVE" &&
          !therapy.active);

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
  // SUMMARY
  // =====================================================

  const activeCount =
    therapies.filter(
      (therapy) => therapy.active
    ).length;

  const inactiveCount =
    therapies.length - activeCount;

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDuration = (
    minutes: number
  ) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const clearFilters = () => {
    setSearch("");
    setStageFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasFilters =
    search.trim() !== "" ||
    stageFilter !== "ALL" ||
    statusFilter !== "ALL";

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    clearMessages();

    setEditingTherapy(null);

    setForm({
      name: "",
      stage: "",
      description: "",
      durationMinutes: 60,
      active: true,
    });

    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (
    therapy: ReceptionistTherapy
  ) => {
    clearMessages();

    setEditingTherapy(therapy);

    setForm({
      name: therapy.name,
      stage: therapy.stage,
      description:
        therapy.description || "",
      durationMinutes:
        therapy.durationMinutes,
      active: therapy.active,
    });

    setSelectedTherapy(null);
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingTherapy(null);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const updateForm = (
    field: keyof TherapyRequest,
    value: string | number | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // SAVE THERAPY
  // =====================================================

  const handleSave = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    clearMessages();

    const name =
      form.name.trim();

    const stage =
      form.stage.trim();

    const description =
      (form.description || "").trim();

    const duration =
      Number(form.durationMinutes);

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!name) {
      setError(
        "Therapy name is required."
      );
      return;
    }

    if (!stage) {
      setError(
        "Therapy stage is required."
      );
      return;
    }

    if (
      !duration ||
      duration <= 0
    ) {
      setError(
        "Duration must be greater than 0 minutes."
      );
      return;
    }

    const request: TherapyRequest = {
      name,
      stage,
      description,
      durationMinutes: duration,
      active: form.active,
    };

    try {
      setSaving(true);

      if (editingTherapy) {
        const updated =
          await updateReceptionistTherapy(
            editingTherapy.id,
            request
          );

        setTherapies((previous) =>
          previous.map((therapy) =>
            therapy.id === updated.id
              ? updated
              : therapy
          )
        );

        setSuccess(
          "Therapy updated successfully."
        );
      } else {
        const created =
          await createReceptionistTherapy(
            request
          );

        setTherapies((previous) => [
          created,
          ...previous,
        ]);

        setSuccess(
          "Therapy added successfully."
        );
      }

      setShowForm(false);
      setEditingTherapy(null);

      setForm({
        name: "",
        stage: "",
        description: "",
        durationMinutes: 60,
        active: true,
      });
    } catch (err: any) {
      console.error(
        "Failed to save therapy:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save therapy.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE ACTIVE / INACTIVE
  // =====================================================

  const toggleTherapyStatus = async (
    therapy: ReceptionistTherapy
  ) => {
    clearMessages();

    const newStatus =
      !therapy.active;

    try {
      const request: TherapyRequest = {
        name: therapy.name,
        stage: therapy.stage,
        description:
          therapy.description || "",
        durationMinutes:
          therapy.durationMinutes,
        active: newStatus,
      };

      const updated =
        await updateReceptionistTherapy(
          therapy.id,
          request
        );

      setTherapies((previous) =>
        previous.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      if (
        selectedTherapy?.id ===
        updated.id
      ) {
        setSelectedTherapy(updated);
      }

      setSuccess(
        `${updated.name} is now ${updated.active
          ? "Active"
          : "Inactive"
        }.`
      );
    } catch (err: any) {
      console.error(
        "Failed to update therapy status:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update therapy status.";

      setError(message);
    }
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 md:p-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
            AyurSutra
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F3D2E]">
            Therapies
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6A6258] md:text-base">
            Manage the therapies available at
            AyurSutra and their treatment details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              loadTherapies(true)
            }
            disabled={
              loading || refreshing
            }
            title="Refresh"
            aria-label="Refresh"
            className="flex items-center justify-center rounded-xl border border-[#DCC8A3] bg-white p-3 text-[#1F3D2E] transition hover:bg-[#F4F0E7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          {/* ADD */}

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
          >
            <Plus size={18} />
            Add Therapy
          </button>
        </div>
      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#CFE0CF] bg-[#F0F7F0] px-4 py-3 text-sm text-[#3F6B45]">
          <CheckCircle2 size={17} />
          <span>{success}</span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="ml-auto rounded-lg p-1 hover:bg-[#E4EFE4]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#E6C7C1] bg-[#FDF0ED] px-4 py-3 text-sm text-[#914D43]">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="ml-auto rounded-lg p-1 hover:bg-[#F7E3DF]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Total Therapies
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : therapies.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <Sparkles
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Active Therapies
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : activeCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <span className="block h-3 w-3 rounded-full bg-[#6B7F4E]" />
            </div>
          </div>
        </div>

        {/* INACTIVE */}

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Inactive Therapies
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : inactiveCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#F1EBDD] p-3">
              <span className="block h-3 w-3 rounded-full bg-[#B7AFA1]" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8174]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by therapy name, stage or description..."
              className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A39B8E] focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
            />
          </div>

          {/* STAGE */}

          <select
            value={stageFilter}
            onChange={(event) =>
              setStageFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
          >
            <option value="ALL">
              All Stages
            </option>

            {stages.map((stage) => (
              <option
                key={stage}
                value={stage}
              >
                {stage}
              </option>
            ))}
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
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

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#DED8CB] px-4 py-3 text-sm font-medium text-[#6A6258] transition hover:bg-[#F4F0E7]"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          THERAPY LIST
      ================================================= */}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-[#E8E2D5] bg-white px-6 py-16 text-center shadow-sm">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-[#6B7F4E]"
            />

            <p className="mt-4 text-sm text-[#7A806F]">
              Loading therapies...
            </p>
          </div>
        ) : filteredTherapies.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D0C1] bg-white px-6 py-16 text-center shadow-sm">
            <Sparkles
              size={30}
              className="mx-auto text-[#9AA08D]"
            />

            <h2 className="mt-4 text-base font-semibold text-[#1F3D2E]">
              No therapies found
            </h2>

            <p className="mt-1 text-sm text-[#8A8174]">
              Try changing your search or
              filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-[#1F3D2E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTherapies.map(
              (therapy) => (
                <div
                  key={therapy.id}
                  className="group h-full rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-[0_2px_10px_rgba(31,61,46,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D8C9AC] hover:shadow-[0_10px_28px_rgba(31,61,46,0.08)] md:p-6"
                >
                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-[#EEF1E6] p-3">
                        <Sparkles
                          size={20}
                          className="text-[#53683D]"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-[#1F3D2E]">
                          {therapy.name}
                        </h2>

                        <p className="mt-1 text-xs text-[#7A806F]">
                          {therapy.stage ||
                            "Stage not specified"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${therapy.active
                          ? "bg-[#E8F2E8] text-[#3F6B45]"
                          : "bg-[#F1EDE7] text-[#81786C]"
                        }`}
                    >
                      {therapy.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* DESCRIPTION */}

                  <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#6A6258]">
                    {therapy.description ||
                      "No description available for this therapy."}
                  </p>

                  {/* DURATION */}

                  <div className="mt-4 flex items-center justify-between border-t border-[#EEE9DE] pt-4">
                    <div className="flex items-center gap-2 text-sm text-[#7A806F]">
                      <Clock3 size={16} />

                      <span>
                        {formatDuration(
                          therapy.durationMinutes
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTherapy(
                          therapy
                        )
                      }
                      className="text-xs font-medium text-[#6B7F4E] transition hover:text-[#1F3D2E]"
                    >
                      View details →
                    </button>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex items-center gap-2 border-t border-[#EEE9DE] pt-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(therapy)}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCC8A3] bg-white px-3 text-sm font-medium text-[#1F3D2E] transition hover:bg-[#F4F0E7] active:scale-[0.98]"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleTherapyStatus(therapy)}
                      className={`inline-flex h-10 flex-1 items-center justify-center rounded-xl px-3 text-sm font-medium transition active:scale-[0.98] ${
                        therapy.active
                          ? "border border-[#E6C7C1] bg-white text-[#914D43] hover:bg-[#FDF0ED]"
                          : "bg-[#1F3D2E] text-white hover:bg-[#6B7F4E]"
                      }`}
                    >
                      {therapy.active ? "Mark Inactive" : "Mark Active"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(therapy)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6C7C1] bg-white text-[#A05249] transition hover:bg-[#FDF0ED] hover:text-[#873E36] active:scale-[0.98]"
                      title="Delete therapy"
                      aria-label={`Delete ${therapy.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedTherapy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() =>
            setSelectedTherapy(null)
          }
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[#EEE9DE] px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#6B7F4E]">
                  Therapy Details
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#1F3D2E]">
                  {selectedTherapy.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTherapy(
                    null
                  )
                }
                className="rounded-lg p-2 text-[#7A806F] transition hover:bg-[#F4F0E7] hover:text-[#1F3D2E]"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="space-y-5 px-6 py-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#EEF1E6] px-3 py-1.5 text-xs font-medium text-[#53683D]">
                  {selectedTherapy.stage ||
                    "Stage not specified"}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${selectedTherapy.active
                      ? "bg-[#E8F2E8] text-[#3F6B45]"
                      : "bg-[#F1EDE7] text-[#81786C]"
                    }`}
                >
                  {selectedTherapy.active
                    ? "Active"
                    : "Inactive"}
                </span>

                <span className="flex items-center gap-1.5 rounded-full bg-[#F5F2EB] px-3 py-1.5 text-xs font-medium text-[#6A6258]">
                  <Clock3 size={14} />

                  {formatDuration(
                    selectedTherapy.durationMinutes
                  )}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8174]">
                  Description
                </p>

                <p className="mt-2 text-sm leading-7 text-[#5F584F]">
                  {selectedTherapy.description ||
                    "No description available for this therapy."}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F6F0] px-4 py-3">
                <p className="text-xs text-[#8A8174]">
                  Therapy Duration
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                  {formatDuration(
                    selectedTherapy.durationMinutes
                  )}
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-3 border-t border-[#EEE9DE] px-6 py-4">
              <button
                type="button"
                onClick={() => openEditForm(selectedTherapy)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCC8A3] bg-white px-4 py-3 text-sm font-medium text-[#1F3D2E] transition hover:bg-[#F4F0E7] active:scale-[0.99]"
              >
                <Pencil size={16} />
                Edit Therapy
              </button>

              <button
                type="button"
                onClick={() => toggleTherapyStatus(selectedTherapy)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition active:scale-[0.99] ${
                  selectedTherapy.active
                    ? "border border-[#E6C7C1] bg-white text-[#914D43] hover:bg-[#FDF0ED]"
                    : "bg-[#1F3D2E] text-white hover:bg-[#6B7F4E]"
                }`}
              >
                {selectedTherapy.active ? "Mark Inactive" : "Mark Active"}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedTherapy)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E6C7C1] bg-white text-[#A05249] transition hover:bg-[#FDF0ED] hover:text-[#873E36] active:scale-[0.98]"
                title="Delete therapy"
                aria-label={`Delete ${selectedTherapy.name}`}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSave}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xl"
          >
            {/* FORM HEADER */}
            <div className="flex items-center justify-between border-b border-[#EEE9DE] bg-[#FCFBF8] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#EEF1E6] p-2.5">
                  <Sparkles size={19} className="text-[#53683D]" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7F4E]">
                    Therapy Management
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#1F3D2E]">
                    {editingTherapy ? "Edit Therapy" : "Add Therapy"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-[#7A806F] transition hover:bg-[#F0ECE3] hover:text-[#1F3D2E] disabled:opacity-50"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM BODY */}
            <div className="overflow-y-auto px-6 py-6">
              {error && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E6C7C1] bg-[#FDF0ED] px-4 py-3 text-sm text-[#914D43]">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="ml-3 rounded-md p-1 hover:bg-white/60"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* BASIC INFORMATION */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#1F3D2E]">
                    Basic Information
                  </h3>
                  <p className="mt-1 text-xs text-[#8A8174]">
                    Enter the therapy name and treatment stage.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="therapyName"
                      className="mb-2 block text-xs font-semibold text-[#53604F]"
                    >
                      Therapy Name <span className="text-[#A65B50]">*</span>
                    </label>

                    <input
                      id="therapyName"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateForm("name", event.target.value)
                      }
                      placeholder="e.g. Abhyanga"
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#AAA296] focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="therapyStage"
                      className="mb-2 block text-xs font-semibold text-[#53604F]"
                    >
                      Treatment Stage <span className="text-[#A65B50]">*</span>
                    </label>

                    <input
                      id="therapyStage"
                      type="text"
                      value={form.stage}
                      onChange={(event) =>
                        updateForm("stage", event.target.value)
                      }
                      placeholder="e.g. PURVAKARMA"
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#AAA296] focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    />

                    {stages.length > 0 && (
                      <p className="mt-1.5 text-[11px] text-[#9A9287]">
                        Existing: {stages.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DURATION */}
              <div className="mt-7 border-t border-[#EEE9DE] pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#1F3D2E]">
                    Treatment Duration
                  </h3>
                  <p className="mt-1 text-xs text-[#8A8174]">
                    Set the standard duration used when scheduling this therapy.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="therapyDuration"
                      className="mb-2 block text-xs font-semibold text-[#53604F]"
                    >
                      Duration (minutes) <span className="text-[#A65B50]">*</span>
                    </label>

                    <div className="relative">
                      <Clock3
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8174]"
                      />

                      <input
                        id="therapyDuration"
                        type="number"
                        min="1"
                        value={form.durationMinutes}
                        onChange={(event) =>
                          updateForm(
                            "durationMinutes",
                            Number(event.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-[#DED8CB] bg-white py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                      />
                    </div>

                    <p className="mt-1.5 text-[11px] text-[#9A9287]">
                      Example: 60 minutes = 1 hour.
                    </p>
                  </div>

                  <div className="flex items-end">
                    <div className="w-full rounded-xl border border-[#E8E2D5] bg-[#F8F6F0] px-4 py-3">
                      <p className="text-xs text-[#8A8174]">
                        Schedule duration
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                        {formatDuration(Number(form.durationMinutes) || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-7 border-t border-[#EEE9DE] pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#1F3D2E]">
                    Additional Details
                  </h3>
                  <p className="mt-1 text-xs text-[#8A8174]">
                    Add a short description for staff reference.
                  </p>
                </div>

                <textarea
                  id="therapyDescription"
                  rows={3}
                  value={form.description || ""}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the therapy, its purpose or useful notes..."
                  className="w-full resize-none rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm leading-6 text-[#1F3D2E] outline-none transition placeholder:text-[#AAA296] focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                />
              </div>

              {/* ACTIVE STATUS */}
              <div className="mt-7 border-t border-[#EEE9DE] pt-6">
                <div
                  className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-4 transition ${
                    form.active
                      ? "border-[#D6E2D0] bg-[#F4F7F0]"
                      : "border-[#E6DED3] bg-[#FAF8F4]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        form.active ? "bg-[#E3ECDC]" : "bg-[#EEE9DE]"
                      }`}
                    >
                      <CheckCircle2
                        size={18}
                        className={
                          form.active ? "text-[#53683D]" : "text-[#9A9287]"
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#1F3D2E]">
                        Therapy is {form.active ? "Active" : "Inactive"}
                      </p>

                      <p className="mt-0.5 text-xs text-[#8A8174]">
                        {form.active
                          ? "This therapy can be used for new scheduling."
                          : "This therapy will remain unavailable for new scheduling."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateForm("active", !form.active)
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      form.active ? "bg-[#6B7F4E]" : "bg-[#C8C1B6]"
                    }`}
                    aria-label="Toggle therapy active status"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        form.active ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between border-t border-[#EEE9DE] bg-[#FCFBF8] px-6 py-4">
              <p className="hidden text-xs text-[#9A9287] sm:block">
                Fields marked <span className="text-[#A65B50]">*</span> are required
              </p>

              <div className="ml-auto flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-[#DCC8A3] bg-white px-4 py-2.5 text-xs font-medium text-[#6A6258] transition hover:bg-[#F4F0E7] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-[#1F3D2E] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#6B7F4E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw size={14} className="animate-spin" />
                  )}

                  {editingTherapy ? "Update Therapy" : "Add Therapy"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReceptionistTherapiesPage;