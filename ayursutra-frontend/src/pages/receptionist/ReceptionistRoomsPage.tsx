import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  BedDouble,
  Building2,
  CheckCircle2,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  createReceptionistRoom,
  deleteReceptionistRoom,
  getReceptionistRooms,
  updateReceptionistRoom,
  type RoomRequest,
  type RoomResponse,
  type RoomType,
} from "../../services/receptionist/receptionistService";

function ReceptionistRoomsPage() {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedRoom, setSelectedRoom] =
    useState<RoomResponse | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] =
    useState<RoomResponse | null>(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<RoomRequest>({
    roomNumber: "",
    name: "",
    type: "THERAPY_ROOM",
    capacity: 1,
    description: "",
    active: true,
  });

  const loadRooms = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getReceptionistRooms();

      setRooms(data);
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setError("Unable to load rooms.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const roomTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        rooms
          .map((room) => room.type)
          .filter(Boolean)
      )
    );

    return uniqueTypes.sort();
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        !query ||
        room.roomNumber
          .toLowerCase()
          .includes(query) ||
        room.name
          .toLowerCase()
          .includes(query) ||
        room.type
          .toString()
          .toLowerCase()
          .includes(query) ||
        (room.description || "")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        room.type === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && room.active) ||
        (statusFilter === "INACTIVE" && !room.active);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    rooms,
    search,
    typeFilter,
    statusFilter,
  ]);

  const activeRooms = rooms.filter(
    (room) => room.active
  );

  const inactiveRooms =
    rooms.length - activeRooms.length;

  const totalCapacity = rooms.reduce(
    (total, room) =>
      total + (room.capacity || 0),
    0
  );

  const formatRoomType = (type: string) => {
    return type
      .toString()
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL";

  const openAddForm = () => {
    setEditingRoom(null);

    setForm({
      roomNumber: "",
      name: "",
      type: "THERAPY_ROOM",
      capacity: 1,
      description: "",
      active: true,
    });

    setShowForm(true);
  };

  const openEditForm = (room: RoomResponse) => {
    setEditingRoom(room);

    setForm({
      roomNumber: room.roomNumber,
      name: room.name,
      type: room.type as RoomType,
      capacity: room.capacity ?? 1,
      description: room.description || "",
      active: room.active,
    });

    setSelectedRoom(null);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingRoom(null);
  };

  const handleSave = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!form.roomNumber.trim()) {
      setError("Room number is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Room name is required.");
      return;
    }

    if (form.capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: RoomRequest = {
        ...form,
        roomNumber: form.roomNumber.trim(),
        name: form.name.trim(),
        description:
          form.description?.trim() || "",
      };

      if (editingRoom) {
        await updateReceptionistRoom(
          editingRoom.id,
          request
        );
      } else {
        await createReceptionistRoom(request);
      }

      setShowForm(false);
      setEditingRoom(null);

      await loadRooms(true);
    } catch (err) {
      console.error("Failed to save room:", err);
      setError(
        "Unable to save room. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleRoomStatus = async (
    room: RoomResponse
  ) => {
    try {
      setError("");

      const request: RoomRequest = {
        roomNumber: room.roomNumber,
        name: room.name,
        type: room.type as RoomType,
        capacity: room.capacity ?? 1,
        description: room.description || "",
        active: !room.active,
      };

      await updateReceptionistRoom(
        room.id,
        request
      );

      await loadRooms(true);

      if (selectedRoom?.id === room.id) {
        setSelectedRoom({
          ...room,
          active: !room.active,
        });
      }
    } catch (err) {
      console.error(
        "Failed to update room status:",
        err
      );

      setError(
        "Unable to update room status."
      );
    }
  };

  const handleDelete = async (
    room: RoomResponse
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Room ${room.roomNumber}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteReceptionistRoom(room.id);

      setSelectedRoom(null);

      await loadRooms(true);
    } catch (err) {
      console.error(
        "Failed to delete room:",
        err
      );

      setError(
        "Unable to delete room. It may be in use."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 md:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
            AyurSutra
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F3D2E]">
            Rooms
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6A6258] md:text-base">
            Manage treatment rooms, their capacity
            and current availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E]"
          >
            <Plus size={18} />
            Add Room
          </button>

          <button
            type="button"
            onClick={() => loadRooms(true)}
            disabled={loading || refreshing}
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
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-[#E6C7C1] bg-[#FDF0ED] px-4 py-3 text-sm text-[#914D43]">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-[#F6DDD8]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Total Rooms
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading ? "—" : rooms.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <Building2
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
                Active Rooms
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : activeRooms.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <CheckCircle2
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>

        {/* INACTIVE */}

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Inactive Rooms
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : inactiveRooms}
              </p>
            </div>

            <div className="rounded-xl bg-[#F1EBDD] p-3">
              <X
                size={20}
                className="text-[#8A6A3F]"
              />
            </div>
          </div>
        </div>

        {/* CAPACITY */}

        <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7A806F]">
                Total Capacity
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1F3D2E]">
                {loading
                  ? "—"
                  : totalCapacity}
              </p>

              <p className="mt-1 text-xs text-[#8A8174]">
                Across all rooms
              </p>
            </div>

            <div className="rounded-xl bg-[#EEF1E6] p-3">
              <Users
                size={20}
                className="text-[#53683D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

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
                setSearch(event.target.value)
              }
              placeholder="Search by room number, name or type..."
              className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A39B8E] focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
          >
            <option value="ALL">
              All Types
            </option>

            {roomTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {formatRoomType(type)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
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

      {/* =====================================================
          ROOMS
      ===================================================== */}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-[#E8E2D5] bg-white px-6 py-16 text-center shadow-sm">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-[#6B7F4E]"
            />

            <p className="mt-4 text-sm text-[#7A806F]">
              Loading rooms...
            </p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D0C1] bg-white px-6 py-16 text-center shadow-sm">
            <BedDouble
              size={30}
              className="mx-auto text-[#9AA08D]"
            />

            <h2 className="mt-4 text-base font-semibold text-[#1F3D2E]">
              No rooms found
            </h2>

            <p className="mt-1 text-sm text-[#8A8174]">
              Try changing your search or filters.
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
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="group h-full rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8C9AC] hover:shadow-md"
              >
                {/* HEADER */}

                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRoom(room)
                    }
                    className="flex min-w-0 items-start gap-3 text-left"
                  >
                    <div className="rounded-xl bg-[#EEF1E6] p-3">
                      <BedDouble
                        size={20}
                        className="text-[#53683D]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8174]">
                        Room {room.roomNumber}
                      </p>

                      <h2 className="mt-1 truncate text-base font-semibold text-[#1F3D2E]">
                        {room.name}
                      </h2>
                    </div>
                  </button>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${room.active
                        ? "bg-[#E8F2E8] text-[#3F6B45]"
                        : "bg-[#F1EDE7] text-[#81786C]"
                      }`}
                  >
                    {room.active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* TYPE */}

                <div className="mt-5">
                  <span className="rounded-full bg-[#F1EBDD] px-3 py-1.5 text-xs font-medium text-[#8A6A3F]">
                    {formatRoomType(
                      room.type
                    )}
                  </span>
                </div>

                {/* DESCRIPTION */}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRoom(room)
                  }
                  className="mt-5 min-h-[72px] text-left"
                >
                  <p className="line-clamp-3 text-sm leading-6 text-[#6A6258]">
                    {room.description ||
                      "No description available for this room."}
                  </p>
                </button>

                {/* FOOTER */}

                <div className="mt-5 flex items-center justify-between border-t border-[#EEE9DE] pt-4">
                  <div className="flex items-center gap-2 text-sm text-[#7A806F]">
                    <Users size={16} />

                    <span>
                      Capacity: {room.capacity}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRoom(room)
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
                    onClick={() => openEditForm(room)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#DCC8A3] px-2.5 py-2 text-xs font-medium text-[#1F3D2E] transition hover:bg-[#F4F0E7]"
                  >
                    <Edit size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleRoomStatus(room)}
                    className={`flex-1 rounded-lg px-2.5 py-2 text-xs font-medium transition ${room.active
                        ? "border border-[#E6C7C1] text-[#914D43] hover:bg-[#FDF0ED]"
                        : "border border-[#C9D6BD] text-[#53683D] hover:bg-[#EEF1E6]"
                      }`}
                  >
                    {room.active
                      ? "Mark Inactive"
                      : "Mark Active"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(room)}
                    title="Delete Room"
                    aria-label="Delete Room"
                    className="rounded-lg border border-[#E6C7C1] p-2 text-[#914D43] transition hover:bg-[#FDF0ED]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() =>
            setSelectedRoom(null)
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
                  Room Details
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#1F3D2E]">
                  {selectedRoom.name}
                </h2>

                <p className="mt-1 text-sm text-[#8A8174]">
                  Room{" "}
                  {selectedRoom.roomNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRoom(null)
                }
                className="rounded-lg p-2 text-[#7A806F] transition hover:bg-[#F4F0E7] hover:text-[#1F3D2E]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#F1EBDD] px-3 py-1.5 text-xs font-medium text-[#8A6A3F]">
                  {formatRoomType(
                    selectedRoom.type
                  )}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${selectedRoom.active
                      ? "bg-[#E8F2E8] text-[#3F6B45]"
                      : "bg-[#F1EDE7] text-[#81786C]"
                    }`}
                >
                  {selectedRoom.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[#F8F6F0] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Room Number
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {selectedRoom.roomNumber}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F6F0] px-4 py-3">
                  <p className="text-xs text-[#8A8174]">
                    Capacity
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                    {selectedRoom.capacity}{" "}
                    {selectedRoom.capacity === 1
                      ? "person"
                      : "people"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8A8174]">
                  Description
                </p>

                <p className="mt-2 text-sm leading-7 text-[#5F584F]">
                  {selectedRoom.description ||
                    "No description available for this room."}
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#EEE9DE] px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  openEditForm(
                    selectedRoom
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCC8A3] px-4 py-3 text-sm font-medium text-[#1F3D2E] transition hover:bg-[#F4F0E7]"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleRoomStatus(
                    selectedRoom
                  )
                }
                className="flex-1 rounded-xl border border-[#DCC8A3] px-4 py-3 text-sm font-medium text-[#53683D] transition hover:bg-[#EEF1E6]"
              >
                {selectedRoom.active
                  ? "Mark Inactive"
                  : "Mark Active"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedRoom
                  )
                }
                title="Delete Room"
                aria-label="Delete Room"
                className="rounded-xl border border-[#E6C7C1] px-4 py-3 text-[#914D43] transition hover:bg-[#FDF0ED]"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD / EDIT ROOM MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSave}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
          >
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[#EEE9DE] px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#6B7F4E]">
                  Room Management
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#1F3D2E]">
                  {editingRoom
                    ? "Edit Room"
                    : "Add Room"}
                </h2>

                <p className="mt-1 text-sm text-[#8A8174]">
                  Enter the room details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-[#7A806F] transition hover:bg-[#F4F0E7]"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* ROOM NUMBER */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F3D2E]">
                    Room Number
                  </label>

                  <input
                    type="text"
                    value={form.roomNumber}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        roomNumber:
                          event.target.value,
                      })
                    }
                    placeholder="e.g. R-101"
                    className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
                  />
                </div>

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F3D2E]">
                    Room Name
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
                    placeholder="e.g. Panchakarma Room 1"
                    className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
                  />
                </div>

                {/* TYPE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F3D2E]">
                    Room Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target
                          .value as RoomType,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
                  >
                    <option value="THERAPY_ROOM">
                      Therapy Room
                    </option>

                    <option value="PANCHAKARMA_ROOM">
                      Panchakarma Room
                    </option>

                    <option value="CONSULTATION_ROOM">
                      Consultation Room
                    </option>

                    <option value="STEAM_ROOM">
                      Steam Room
                    </option>

                    <option value="SHIRODHARA_ROOM">
                      Shirodhara Room
                    </option>

                    <option value="RECOVERY_ROOM">
                      Recovery Room
                    </option>
                  </select>
                </div>

                {/* CAPACITY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F3D2E]">
                    Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        capacity: Number(
                          event.target.value
                        ),
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F3D2E]">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Describe the room..."
                  className="w-full resize-none rounded-xl border border-[#DED8CB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#1F3D2E] outline-none focus:border-[#9AA88A] focus:ring-2 focus:ring-[#EEF1E6]"
                />
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F8F6F0] px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      active:
                        event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#1F3D2E]"
                />

                <div>
                  <p className="text-sm font-medium text-[#1F3D2E]">
                    Active Room
                  </p>

                  <p className="text-xs text-[#8A8174]">
                    This room can be used for
                    scheduling.
                  </p>
                </div>
              </label>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-[#EEE9DE] px-6 py-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-[#DCC8A3] px-5 py-3 text-sm font-medium text-[#6A6258] transition hover:bg-[#F4F0E7] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                )}

                {editingRoom
                  ? "Update Room"
                  : "Add Room"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReceptionistRoomsPage;