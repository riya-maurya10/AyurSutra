import { useEffect, useMemo, useState } from "react";
import {
    Search,
    BedDouble,
    Users,
    CheckCircle2,
    XCircle,
    X,
    ArrowLeft,
    Building2,

} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/dashboard/Topbar";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";

interface Room {
    id: string;
    roomNumber: string;
    name: string;
    type:
    | "THERAPY_ROOM"
    | "PANCHAKARMA_ROOM"
    | "CONSULTATION_ROOM"
    | "STEAM_ROOM"
    | "SHIRODHARA_ROOM"
    | "RECOVERY_ROOM";
    capacity: number;
    description?: string;
    active: boolean;
}

const API_BASE_URL = "http://localhost:9999/api";

const roomTypeLabels: Record<Room["type"], string> = {
    THERAPY_ROOM: "Therapy Room",
    PANCHAKARMA_ROOM: "Panchakarma Room",
    CONSULTATION_ROOM: "Consultation Room",
    STEAM_ROOM: "Steam Room",
    SHIRODHARA_ROOM: "Shirodhara Room",
    RECOVERY_ROOM: "Recovery Room",
};

function AdminRoomsPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("accessToken");

            const response = await axios.get(
                `${API_BASE_URL}/rooms`,
                {
                    headers: {
                        Authorization: token
                            ? `Bearer ${token}`
                            : "",
                    },
                }
            );

            const data = response.data?.data ?? response.data;

            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch rooms:", err);
            setError("Unable to load rooms. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                room.roomNumber.toLowerCase().includes(searchValue) ||
                room.name.toLowerCase().includes(searchValue) ||
                roomTypeLabels[room.type]
                    .toLowerCase()
                    .includes(searchValue);

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
    }, [rooms, search, typeFilter, statusFilter]);

    const totalRooms = rooms.length;

    const activeRooms = rooms.filter(
        (room) => room.active
    ).length;

    const inactiveRooms = rooms.filter(
        (room) => !room.active
    ).length;

    const totalCapacity = rooms.reduce(
        (total, room) => total + (room.capacity || 0),
        0
    );

    //   const formatRoomType = (type: Room["type"]) => {
    //     return roomTypeLabels[type] || type;
    //   };

    return (
        <div className="flex min-h-screen bg-[#F8F6F0]">
            <Sidebar role="ADMIN" />

            <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
                <Topbar
                    title="Rooms"
                    subtitle="View clinic rooms and their current availability."
                />

                <main className="flex-1 p-5 md:p-8">

                    {/* Header */}
                    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate("/admin")}
                                className="mb-3 flex items-center text-[#617341] transition hover:text-[#1F3D2E]"
                                aria-label="Back to Admin Dashboard"
                            >
                                <ArrowLeft size={18} strokeWidth={1.8} />
                            </button>

                            <h1 className="font-serif text-3xl font-semibold text-[#153F32]">
                                Rooms
                            </h1>

                            <p className="mt-2 text-sm text-[#6F7568]">
                                View treatment rooms, capacity, type and current status.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <StatCard
                            label="Total Rooms"
                            value={totalRooms}
                            icon={<Building2 size={21} />}
                        />

                        <StatCard
                            label="Active Rooms"
                            value={activeRooms}
                            icon={<CheckCircle2 size={21} />}
                        />

                        <StatCard
                            label="Inactive Rooms"
                            value={inactiveRooms}
                            icon={<XCircle size={21} />}
                        />

                        <StatCard
                            label="Total Capacity"
                            value={totalCapacity}
                            icon={<Users size={21} />}
                        />

                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-2xl border border-[#E7E1D5] bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_180px]">

                            {/* Search */}
                            <div className="relative">
                                <Search
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9185]"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search by room number, name or type..."
                                    className="w-full rounded-xl border border-[#DED9CE] bg-[#FCFBF8] py-3 pl-11 pr-4 text-sm text-[#183D32] outline-none transition focus:border-[#7B8068]"
                                />
                            </div>

                            {/* Type */}
                            <select
                                value={typeFilter}
                                onChange={(e) =>
                                    setTypeFilter(e.target.value)
                                }
                                className="rounded-xl border border-[#DED9CE] bg-[#FCFBF8] px-4 py-3 text-sm text-[#183D32] outline-none focus:border-[#7B8068]"
                            >
                                <option value="ALL">
                                    All Types
                                </option>

                                {Object.entries(roomTypeLabels).map(
                                    ([value, label]) => (
                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    )
                                )}
                            </select>

                            {/* Status */}
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="rounded-xl border border-[#DED9CE] bg-[#FCFBF8] px-4 py-3 text-sm text-[#183D32] outline-none focus:border-[#7B8068]"
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

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="rounded-2xl border border-[#E7E1D5] bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D9DED0] border-t-[#244F3E]" />

                            <p className="text-sm text-[#73786D]">
                                Loading rooms...
                            </p>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="rounded-2xl border border-[#E7E1D5] bg-white p-12 text-center shadow-sm">
                            <BedDouble
                                size={40}
                                className="mx-auto mb-4 text-[#A0A594]"
                            />

                            <h3 className="text-lg font-semibold text-[#244F3E]">
                                No rooms found
                            </h3>

                            <p className="mt-1 text-sm text-[#777D72]">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                            {filteredRooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onView={() =>
                                        setSelectedRoom(room)
                                    }
                                />
                            ))}

                        </div>
                    )}

                </main>
            </div>

            {/* View Modal */}
            {selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    onClose={() =>
                        setSelectedRoom(null)
                    }
                />
            )}
        </div>
    );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#E7E1D5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm text-[#777D72]">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#173E31]">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0E4] text-[#526C43]">
                    {icon}
                </div>

            </div>
        </div>
    );
}

/* =========================
   ROOM CARD
========================= */

function RoomCard({
    room,
    onView,
}: {
    room: Room;
    onView: () => void;
}) {
    return (
        <div className="rounded-2xl border border-[#E7E1D5] bg-white p-5 shadow-sm transition hover:shadow-md">

            {/* Top */}
            <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E4] text-[#526C43]">
                        <BedDouble size={21} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.12em] text-[#8A8F83]">
                            Room {room.roomNumber}
                        </p>

                        <h3 className="mt-1 truncate text-lg font-semibold text-[#173E31]">
                            {room.name}
                        </h3>
                    </div>

                </div>

                <StatusBadge active={room.active} />

            </div>

            {/* Type */}
            <div className="mt-5">
                <span className="inline-flex rounded-full bg-[#F3ECDF] px-3 py-1 text-xs font-medium text-[#9A6D35]">
                    {roomTypeLabels[room.type]}
                </span>
            </div>

            {/* Description */}
            <p className="mt-5 min-h-[48px] text-sm leading-6 text-[#6F756A]">
                {room.description || "No description available."}
            </p>

            {/* Bottom */}
            <div className="mt-5 flex items-center justify-between border-t border-[#EEE9DF] pt-4">

                <div className="flex items-center gap-2 text-sm text-[#6D7469]">
                    <Users size={17} />
                    <span>
                        Capacity: {room.capacity}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onView}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#657548] transition hover:text-[#244F3E]"
                >
                    View details
                    <span>→</span>
                </button>

            </div>

        </div>
    );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
    active,
}: {
    active: boolean;
}) {
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${active
                    ? "bg-[#E6F3E9] text-[#39724D]"
                    : "bg-[#FBEAEA] text-[#A64B4B]"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${active
                        ? "bg-[#4D8B5D]"
                        : "bg-[#B85B5B]"
                    }`}
            />

            {active ? "Active" : "Inactive"}
        </span>
    );
}

/* =========================
   DETAILS MODAL
========================= */

function RoomDetailsModal({
    room,
    onClose,
}: {
    room: Room;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#EEE9DF] px-6 py-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF0E4] text-[#526C43]">
                            <BedDouble size={21} />
                        </div>

                        <div>
                            <h2 className="font-serif text-2xl font-semibold text-[#173E31]">
                                {room.name}
                            </h2>

                            <p className="text-sm text-[#7A8075]">
                                Room {room.roomNumber}
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F3EF] text-[#536057] transition hover:bg-[#E9E7E0]"
                    >
                        <X size={19} />
                    </button>

                </div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

                    <DetailItem
                        label="Room Number"
                        value={room.roomNumber}
                    />

                    <DetailItem
                        label="Room Type"
                        value={roomTypeLabels[room.type]}
                    />

                    <DetailItem
                        label="Capacity"
                        value={`${room.capacity} ${room.capacity === 1 ? "person" : "people"}`}
                    />

                    <div className="rounded-xl bg-[#FAF9F6] p-4">
                        <p className="text-xs uppercase tracking-[0.08em] text-[#969B91]">
                            Status
                        </p>

                        <div className="mt-2">
                            <StatusBadge active={room.active} />
                        </div>
                    </div>

                    <div className="sm:col-span-2 rounded-xl bg-[#FAF9F6] p-4">
                        <p className="text-xs uppercase tracking-[0.08em] text-[#969B91]">
                            Description
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#555E55]">
                            {room.description || "No description available."}
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-[#EEE9DF] px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#DDD8CD] px-5 py-2.5 text-sm font-medium text-[#455149] transition hover:bg-[#F7F5F0]"
                    >
                        Close
                    </button>

                </div>

            </div>
        </div>
    );
}

/* =========================
   DETAIL ITEM
========================= */

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl bg-[#FAF9F6] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[#969B91]">
                {label}
            </p>

            <p className="mt-2 text-sm font-medium text-[#35483E]">
                {value}
            </p>
        </div>
    );
}

export default AdminRoomsPage;