import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  createReceptionistEquipment,
  deleteReceptionistEquipment,
  getReceptionistEquipment,
  getReceptionistRooms,
  updateReceptionistEquipment,
  type EquipmentRequest,
  type EquipmentResponse,
} from "../../services/receptionist/receptionistService";

import type { RoomResponse } from "../../services/doctor/doctorService";

function ReceptionistEquipmentPage() {
  const [equipment, setEquipment] = useState<
    EquipmentResponse[]
  >([]);

  const [rooms, setRooms] = useState<
    RoomResponse[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [
    selectedEquipment,
    setSelectedEquipment,
  ] = useState<EquipmentResponse | null>(
    null
  );

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingEquipment,
    setEditingEquipment,
  ] = useState<EquipmentResponse | null>(
    null
  );

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState<EquipmentRequest>({
      equipmentCode: "",
      name: "",
      type: "",
      quantity: 1,
      availableQuantity: 1,
      roomId: "",
      status: "",
      description: "",
      active: true,
    });

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async (
    isRefresh = false
  ) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        equipmentData,
        roomsData,
      ] = await Promise.all([
        getReceptionistEquipment(),
        getReceptionistRooms(),
      ]);

      setEquipment(equipmentData);
      setRooms(roomsData);
    } catch (error) {
      console.error(
        "Failed to load equipment:",
        error
      );

      setError(
        "Unable to load equipment."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // ROOM
  // =====================================================

  const getRoomDisplay = (
    roomId: string | null
  ) => {
    if (!roomId) {
      return "Unassigned";
    }

    const room = rooms.find(
      (item) => item.id === roomId
    );

    if (!room) {
      return "Unassigned";
    }

    return `${room.roomNumber} — ${room.name}`;
  };

  // =====================================================
  // FILTER VALUES
  // =====================================================

  const equipmentTypes = useMemo(() => {
    return Array.from(
      new Set(
        equipment
          .map((item) => item.type)
          .filter(Boolean)
      )
    ).sort();
  }, [equipment]);

  const equipmentStatuses = useMemo(() => {
    return Array.from(
      new Set(
        equipment
          .map((item) => item.status)
          .filter(Boolean)
      )
    ).sort();
  }, [equipment]);

  // =====================================================
  // FILTERED DATA
  // =====================================================

  const filteredEquipment = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return equipment.filter((item) => {
      const roomName =
        getRoomDisplay(
          item.roomId
        ).toLowerCase();

      const matchesSearch =
        !query ||
        item.equipmentCode
          ?.toLowerCase()
          .includes(query) ||
        item.name
          ?.toLowerCase()
          .includes(query) ||
        item.type
          ?.toLowerCase()
          .includes(query) ||
        item.status
          ?.toLowerCase()
          .includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query) ||
        roomName.includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        item.type === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    equipment,
    rooms,
    search,
    typeFilter,
    statusFilter,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalEquipment =
    equipment.reduce(
      (total, item) =>
        total + (item.quantity ?? 0),
      0
    );

  const equipmentItems =
    equipment.length;

  const activeEquipment =
    equipment.filter(
      (item) => item.active
    ).length;

  const totalAvailable =
    equipment.reduce(
      (total, item) =>
        total +
        (item.availableQuantity ?? 0),
      0
    );

  // =====================================================
  // HELPERS
  // =====================================================

  const formatValue = (
    value: string | null | undefined
  ) => {
    if (!value) {
      return "—";
    }

    return value
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  };

  // =====================================================
  // ADD
  // =====================================================

  const openAddForm = () => {
    setEditingEquipment(null);

    setForm({
      equipmentCode: "",
      name: "",
      type:
        equipmentTypes[0] || "",
      quantity: 1,
      availableQuantity: 1,
      roomId: "",
      status:
        equipmentStatuses[0] || "",
      description: "",
      active: true,
    });

    setError("");
    setShowForm(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const openEditForm = (
    item: EquipmentResponse
  ) => {
    setEditingEquipment(item);

    setForm({
      equipmentCode:
        item.equipmentCode || "",
      name: item.name || "",
      type: item.type || "",
      quantity:
        item.quantity ?? 1,
      availableQuantity:
        item.availableQuantity ?? 0,
      roomId:
        item.roomId || "",
      status:
        item.status || "",
      description:
        item.description || "",
      active: item.active ?? true,
    });

    setSelectedEquipment(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingEquipment(null);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!form.equipmentCode.trim()) {
      setError(
        "Equipment code is required."
      );
      return;
    }

    if (!form.name.trim()) {
      setError(
        "Equipment name is required."
      );
      return;
    }

    if (!form.type.trim()) {
      setError(
        "Equipment type is required."
      );
      return;
    }

    if (!form.status.trim()) {
      setError(
        "Equipment status is required."
      );
      return;
    }

    if (form.quantity < 1) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    if (form.availableQuantity < 0) {
      setError(
        "Available quantity cannot be negative."
      );
      return;
    }

    if (
      form.availableQuantity >
      form.quantity
    ) {
      setError(
        "Available quantity cannot be greater than total quantity."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: EquipmentRequest = {
        equipmentCode:
          form.equipmentCode.trim(),

        name: form.name.trim(),

        type: form.type.trim(),

        quantity: form.quantity,

        availableQuantity:
          form.availableQuantity,

        roomId:
          form.roomId || undefined,

        status: form.status.trim(),

        description:
          form.description?.trim() || "",

        active: form.active,
      };

      if (editingEquipment) {
        await updateReceptionistEquipment(
          editingEquipment.id,
          request
        );
      } else {
        await createReceptionistEquipment(
          request
        );
      }

      setShowForm(false);
      setEditingEquipment(null);

      await loadData(true);
    } catch (error) {
      console.error(
        "Failed to save equipment:",
        error
      );

      setError(
        "Unable to save equipment. Please check the entered values."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE ACTIVE / INACTIVE
  // =====================================================

  const toggleEquipmentActive =
    async (
      item: EquipmentResponse
    ) => {
      try {
        setError("");

        const request: EquipmentRequest =
          {
            equipmentCode:
              item.equipmentCode,

            name: item.name,

            type: item.type,

            quantity:
              item.quantity ?? 1,

            availableQuantity:
              item.availableQuantity ?? 0,

            roomId:
              item.roomId || undefined,

            status: item.status,

            description:
              item.description || "",

            active: !item.active,
          };

        await updateReceptionistEquipment(
          item.id,
          request
        );

        await loadData(true);

        if (
          selectedEquipment?.id ===
          item.id
        ) {
          setSelectedEquipment({
            ...item,
            active: !item.active,
          });
        }
      } catch (error) {
        console.error(
          "Failed to update equipment:",
          error
        );

        setError(
          "Unable to update equipment status."
        );
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    item: EquipmentResponse
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${item.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteReceptionistEquipment(
        item.id
      );

      setSelectedEquipment(null);

      await loadData(true);
    } catch (error) {
      console.error(
        "Failed to delete equipment:",
        error
      );

      setError(
        "Unable to delete equipment."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 md:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
            AyurSutra
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F3D2E]">
            Equipment
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6A6258] md:text-base">
            Manage therapy equipment,
            quantities, availability and
            room assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
          >
            <Plus size={18} />
            Add Equipment
          </button>

          <button
            type="button"
            onClick={() =>
              loadData(true)
            }
            disabled={
              loading || refreshing
            }
            title="Refresh"
            aria-label="Refresh"
            className="flex items-center justify-center rounded-xl border border-[#DCC8A3] bg-white p-3 text-[#1F3D2E] transition hover:bg-[#F4F0E7] disabled:opacity-60"
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
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-[#E6C7C1] bg-[#FDF0ED] px-4 py-3 text-sm text-[#914D43]">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Equipment Items
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : equipmentItems}
              </p>
            </div>

            <div className="rounded-xl bg-[#F1EBDD] p-3">
              <Package
                size={20}
                className="text-[#806B45]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Total Quantity
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : totalEquipment}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-2.5">
              <Users
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Available Quantity
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : totalAvailable}
              </p>
            </div>

            <div className="rounded-xl bg-[#E8F2EA] p-3">
              <CheckCircle2
                size={20}
                className="text-[#2E6847]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Active Equipment
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : activeEquipment}
              </p>
            </div>

            <div className="rounded-xl bg-[#EAF1F5] p-3">
              <CheckCircle2
                size={20}
                className="text-[#3D6074]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="mt-6 rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">

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
              placeholder="Search equipment, code, type or room..."
              className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none placeholder:text-[#A39B8E] focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none"
          >
            <option value="ALL">
              All Types
            </option>

            {equipmentTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatValue(type)}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none"
          >
            <option value="ALL">
              All Status
            </option>

            {equipmentStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatValue(status)}
                </option>
              )
            )}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#DED8CB] px-4 py-3 text-sm font-medium text-[#6A6258] hover:bg-[#F4F0E7]"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* CARDS */}

      <div className="mt-6">

        {loading ? (
          <div className="rounded-2xl border border-[#E8E2D5] bg-white px-6 py-16 text-center shadow-sm">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-[#6B7F4E]"
            />

            <p className="mt-4 text-sm text-[#7A806F]">
              Loading equipment...
            </p>
          </div>
        ) : filteredEquipment.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D0C1] bg-white px-6 py-16 text-center shadow-sm">
            <Package
              size={30}
              className="mx-auto text-[#9AA08D]"
            />

            <h2 className="mt-4 text-base font-semibold text-[#1F3D2E]">
              No equipment found
            </h2>

            <p className="mt-1 text-sm text-[#8A8174]">
              Try changing your search
              or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEquipment.map(
              (item) => (
                <div
                  key={item.id}
                  className="group h-full rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8C9AC] hover:shadow-md"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedEquipment(
                          item
                        )
                      }
                      className="flex min-w-0 items-start gap-3 text-left"
                    >
                      <div className="rounded-xl bg-[#EEF1E6] p-2.5">
                        <Package
                          size={20}
                          className="text-[#53683D]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8174]">
                          {item.equipmentCode}
                        </p>

                        <h2 className="mt-1 truncate text-sm font-semibold text-[#1F3D2E]">
                          {item.name}
                        </h2>
                      </div>
                    </button>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        item.active
                          ? "bg-[#E8F2E8] text-[#3F6B45]"
                          : "bg-[#F1EDE7] text-[#81786C]"
                      }`}
                    >
                      {item.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* TYPE */}

                  <div className="mt-4">
                    <span className="rounded-full bg-[#F1EBDD] px-3 py-1.5 text-xs font-medium text-[#8A6A3F]">
                      {formatValue(
                        item.type
                      )}
                    </span>
                  </div>

                  {/* DESCRIPTION */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedEquipment(
                        item
                      )
                    }
                    className="mt-4 min-h-[56px] text-left"
                  >
                    <p className="line-clamp-2 text-sm leading-5 text-[#6A6258]">
                      {item.description ||
                        "No description available for this equipment."}
                    </p>
                  </button>

                  {/* QUANTITY */}

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#EEE9DE] pt-3">
                    <div>
                      <p className="text-xs text-[#8A8174]">
                        Quantity
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                        {item.quantity ??
                          0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8A8174]">
                        Available
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#53683D]">
                        {item.availableQuantity ??
                          0}
                      </p>
                    </div>
                  </div>

                  {/* ROOM */}

                  <div className="mt-3 flex items-center gap-2 border-t border-[#EEE9DE] pt-3">
                    <Users
                      size={16}
                      className="text-[#8A927F]"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-[#8A8174]">
                        Assigned Room
                      </p>

                      <p className="mt-0.5 truncate text-sm font-medium text-[#53604F]">
                        {getRoomDisplay(
                          item.roomId
                        )}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="mt-2">
                    <span className="text-xs text-[#8A8174]">
                      Status:{" "}
                    </span>

                    <span className="text-xs font-medium text-[#53604F]">
                      {formatValue(
                        item.status
                      )}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-3 flex items-center gap-2 border-t border-[#EEE9DE] pt-3">

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          item
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#DCC8A3] px-2.5 py-1.5 text-xs font-medium text-[#1F3D2E] transition hover:bg-[#F4F0E7]"
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleEquipmentActive(
                          item
                        )
                      }
                      className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        item.active
                          ? "border border-[#E6C7C1] text-[#914D43] hover:bg-[#FDF0ED]"
                          : "border border-[#C9D6BD] text-[#53683D] hover:bg-[#EEF1E6]"
                      }`}
                    >
                      {item.active
                        ? "Mark Inactive"
                        : "Mark Active"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          item
                        )
                      }
                      title="Delete Equipment"
                      aria-label="Delete Equipment"
                      className="rounded-lg border border-[#E6C7C1] p-1.5 text-[#914D43] transition hover:bg-[#FDF0ED]"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedEquipment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() =>
            setSelectedEquipment(
              null
            )
          }
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between border-b border-[#EEE9DE] px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#6B7F4E]">
                  Equipment Details
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#1F3D2E]">
                  {selectedEquipment.name}
                </h2>

                <p className="mt-1 text-sm text-[#8A8174]">
                  {
                    selectedEquipment.equipmentCode
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEquipment(
                    null
                  )
                }
                className="rounded-lg p-2 text-[#7A806F] hover:bg-[#F4F0E7]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-[#F1EBDD] px-3 py-1.5 text-xs font-medium text-[#8A6A3F]">
                  {formatValue(
                    selectedEquipment.type
                  )}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    selectedEquipment.active
                      ? "bg-[#E8F2E8] text-[#3F6B45]"
                      : "bg-[#F1EDE7] text-[#81786C]"
                  }`}
                >
                  {selectedEquipment.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#F8F6F0] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Quantity
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {
                      selectedEquipment.quantity ??
                      0
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F6F0] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Available
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#53683D]">
                    {
                      selectedEquipment.availableQuantity ??
                      0
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F6F0] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {formatValue(
                      selectedEquipment.status
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8F6F0] px-4 py-4">
                <p className="text-xs text-[#8A8174]">
                  Assigned Room
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                  {getRoomDisplay(
                    selectedEquipment.roomId
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8174]">
                  Description
                </p>

                <p className="mt-2 text-sm leading-7 text-[#5F584F]">
                  {selectedEquipment.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#EEE9DE] px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  openEditForm(
                    selectedEquipment
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#DCC8A3] px-3 py-2.5 text-xs font-medium text-[#1F3D2E] hover:bg-[#F4F0E7]"
              >
                <Edit size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleEquipmentActive(
                    selectedEquipment
                  )
                }
                className="flex-1 rounded-lg border border-[#DCC8A3] px-3 py-2.5 text-xs font-medium text-[#53683D] hover:bg-[#EEF1E6]"
              >
                {selectedEquipment.active
                  ? "Mark Inactive"
                  : "Mark Active"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedEquipment
                  )
                }
                className="rounded-lg border border-[#E6C7C1] p-2.5 text-[#914D43] hover:bg-[#FDF0ED]"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

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
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#EEE9DE] bg-[#FCFBF8] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#EEF1E6] p-2.5">
                  <Package size={19} className="text-[#53683D]" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7F4E]">
                    Equipment Management
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#1F3D2E]">
                    {editingEquipment ? "Edit Equipment" : "Add Equipment"}
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

            {/* MODAL BODY */}
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
                    Enter the equipment identification and category.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Equipment Code <span className="text-[#A65B50]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.equipmentCode}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          equipmentCode: event.target.value,
                        })
                      }
                      placeholder="e.g. EQ-001"
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#AAA296] focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Equipment Name <span className="text-[#A65B50]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                        })
                      }
                      placeholder="e.g. Abhyanga Massage Table"
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#AAA296] focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Equipment Type <span className="text-[#A65B50]">*</span>
                    </label>
                    <select
                      value={form.type}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          type: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    >
                      <option value="">Select equipment type</option>
                      {equipmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {formatValue(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Equipment Status <span className="text-[#A65B50]">*</span>
                    </label>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    >
                      <option value="">Select status</option>
                      {equipmentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatValue(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* INVENTORY */}
              <div className="mt-7 border-t border-[#EEE9DE] pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#1F3D2E]">
                    Inventory & Assignment
                  </h3>
                  <p className="mt-1 text-xs text-[#8A8174]">
                    Set quantities and assign the equipment to a room.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Total Quantity <span className="text-[#A65B50]">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          quantity: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    />
                    <p className="mt-1.5 text-[11px] text-[#9A9287]">
                      Total number of units owned.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Available Quantity <span className="text-[#A65B50]">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={form.quantity}
                      value={form.availableQuantity}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          availableQuantity: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    />
                    <p className="mt-1.5 text-[11px] text-[#9A9287]">
                      Units currently ready for use.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-semibold text-[#53604F]">
                      Assigned Room
                    </label>
                    <select
                      value={form.roomId || ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          roomId: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#DED8CB] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#9AA88A] focus:ring-4 focus:ring-[#EEF1E6]"
                    >
                      <option value="">Unassigned</option>
                      {rooms
                        .filter((room) => room.active)
                        .map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.roomNumber} — {room.name}
                          </option>
                        ))}
                    </select>
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
                  rows={3}
                  value={form.description || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the equipment, its purpose or any useful notes..."
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
                          form.active
                            ? "text-[#53683D]"
                            : "text-[#9A9287]"
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#1F3D2E]">
                        Equipment is {form.active ? "Active" : "Inactive"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#8A8174]">
                        {form.active
                          ? "This equipment can be used in the system."
                          : "This equipment will remain unavailable for use."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        active: !form.active,
                      })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      form.active ? "bg-[#6B7F4E]" : "bg-[#C8C1B6]"
                    }`}
                    aria-label="Toggle equipment active status"
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

                  {editingEquipment ? "Update Equipment" : "Add Equipment"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReceptionistEquipmentPage;