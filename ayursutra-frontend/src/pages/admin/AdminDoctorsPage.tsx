import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    BriefcaseMedical,
    Eye,
    Mail,
    Pencil,
    Phone,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Search,
    Stethoscope,
    UserRound,
    X,
} from "lucide-react";
import apiClient from "../../services/api/client";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";

import { useAuth } from "../../context/AuthContext";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    enabled: boolean;
}

interface Doctor {
    id: string;
    userId?: string;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    licenseNumber: string;
    available: boolean;
    enabled?: boolean;
}

interface DoctorForm {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    specialization: string;
    qualification: string;
    experienceYears: string;
    licenseNumber: string;
    available: boolean;
}

const emptyForm: DoctorForm = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    qualification: "",
    experienceYears: "0",
    licenseNumber: "",
    available: true,
};

export default function AdminDoctorsPage() {
    const { user } = useAuth();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);

    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const [form, setForm] = useState<DoctorForm>(emptyForm);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* -----------------------------------------
       Fetch Doctors + Users
    ----------------------------------------- */

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError("");

            const [doctorResponse, userResponse] = await Promise.all([
                apiClient.get<ApiResponse<Doctor[]>>("/doctors"),
                apiClient.get<ApiResponse<User[]>>("/users"),
            ]);

            const doctorList = doctorResponse.data.data || [];
            const userList = userResponse.data.data || [];

            /*
             * Join doctor profile with User account.
             * User.enabled = login/account status.
             */
            const doctorListWithStatus = doctorList.map((doctor) => {
                const linkedUser = userList.find(
                    (item) => item.id === doctor.userId
                );

                return {
                    ...doctor,
                    enabled: linkedUser?.enabled ?? true,
                };
            });

            setDoctors(doctorListWithStatus);
            setUsers(userList);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Failed to load doctors. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    /* -----------------------------------------
       Search
    ----------------------------------------- */

    const filteredDoctors = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return doctors;

        return doctors.filter((doctor) =>
            [
                doctor.fullName,
                doctor.email,
                doctor.phone,
                doctor.specialization,
                doctor.qualification,
                doctor.licenseNumber,
            ]
                .filter(Boolean)
                .some((value) =>
                    value.toLowerCase().includes(query)
                )
        );
    }, [doctors, search]);

    /* -----------------------------------------
       Form
    ----------------------------------------- */

    const handleChange = (
        field: keyof DoctorForm,
        value: string | boolean
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const openAddForm = () => {
        setEditingDoctor(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (doctor: Doctor) => {
        setEditingDoctor(doctor);

        setForm({
            fullName: doctor.fullName || "",
            email: doctor.email || "",
            phone: doctor.phone || "",
            password: "",
            specialization: doctor.specialization || "",
            qualification: doctor.qualification || "",
            experienceYears: String(doctor.experienceYears ?? 0),
            licenseNumber: doctor.licenseNumber || "",
            available: doctor.available ?? true,
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingDoctor(null);
        setForm(emptyForm);
        setError("");
    };

    /* -----------------------------------------
       Validation
    ----------------------------------------- */

    const validateForm = () => {
        if (!form.fullName.trim()) {
            return "Full name is required.";
        }

        if (!form.email.trim()) {
            return "Email is required.";
        }

        if (!form.phone.trim()) {
            return "Phone number is required.";
        }

        if (!editingDoctor && !form.password.trim()) {
            return "Password is required when creating a doctor account.";
        }

        if (!form.specialization.trim()) {
            return "Specialization is required.";
        }

        if (!form.qualification.trim()) {
            return "Qualification is required.";
        }

        if (!form.licenseNumber.trim()) {
            return "License number is required.";
        }

        const experience = Number(form.experienceYears);

        if (Number.isNaN(experience) || experience < 0) {
            return "Experience years must be 0 or greater.";
        }

        return "";
    };

    /* -----------------------------------------
       Add / Edit Doctor
    ----------------------------------------- */

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const experienceYears = Number(form.experienceYears);

            /* ---------------------------------
               EDIT DOCTOR
            --------------------------------- */

            if (editingDoctor) {
                const userId = editingDoctor.userId;

                if (!userId) {
                    throw new Error(
                        "Doctor user ID is missing. This doctor cannot be updated."
                    );
                }

                const response = await apiClient.put<ApiResponse<Doctor>>(
                    `/doctors/${editingDoctor.id}`,
                    {
                        userId,
                        fullName: form.fullName.trim(),
                        email: form.email.trim(),
                        phone: form.phone.trim(),
                        specialization: form.specialization.trim(),
                        qualification: form.qualification.trim(),
                        experienceYears,
                        licenseNumber: form.licenseNumber.trim(),
                        available: form.available,
                    }
                );

                const updatedDoctor = response.data.data;

                const linkedUser = users.find(
                    (item) => item.id === userId
                );

                setDoctors((prev) =>
                    prev.map((doctor) =>
                        doctor.id === editingDoctor.id
                            ? {
                                ...updatedDoctor,
                                enabled:
                                    linkedUser?.enabled ??
                                    doctor.enabled ??
                                    true,
                            }
                            : doctor
                    )
                );

                setSuccess("Doctor updated successfully.");

                setTimeout(() => {
                    setShowForm(false);
                    setEditingDoctor(null);
                    setSuccess("");
                }, 700);

            } else {

                /* ---------------------------------
                   STEP 1: CREATE USER ACCOUNT
                --------------------------------- */

                const userResponse = await apiClient.post<ApiResponse<User>>(
                    "/users/register",
                    {
                        fullName: form.fullName.trim(),
                        email: form.email.trim(),
                        phone: form.phone.trim(),
                        password: form.password,
                        role: "DOCTOR",
                    }
                );

                const createdUser = userResponse.data.data;

                if (!createdUser?.id) {
                    throw new Error(
                        "Doctor account was created, but user ID was not returned."
                    );
                }

                /* ---------------------------------
                   STEP 2: CREATE DOCTOR PROFILE
                --------------------------------- */

                const doctorResponse =
                    await apiClient.post<ApiResponse<Doctor>>(
                        "/doctors",
                        {
                            userId: createdUser.id,
                            fullName: createdUser.fullName,
                            email: createdUser.email,
                            phone: createdUser.phone,
                            specialization: form.specialization.trim(),
                            qualification: form.qualification.trim(),
                            experienceYears,
                            licenseNumber: form.licenseNumber.trim(),
                            available: form.available,
                        }
                    );

                const createdDoctor = doctorResponse.data.data;

                setDoctors((prev) => [
                    {
                        ...createdDoctor,
                        enabled: true,
                    },
                    ...prev,
                ]);

                setUsers((prev) => [
                    createdUser,
                    ...prev,
                ]);

                setSuccess(
                    "Doctor account and profile created successfully."
                );

                setTimeout(() => {
                    setShowForm(false);
                    setForm(emptyForm);
                    setSuccess("");
                }, 900);
            }

        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    /* -----------------------------------------
       Activate / Deactivate
    ----------------------------------------- */

    const handleAccountStatus = async (doctor: Doctor) => {
        const userId = doctor.userId;

        if (!userId) {
            setError(
                "Doctor user ID is missing. Account status cannot be changed."
            );
            return;
        }

        const currentlyEnabled = doctor.enabled !== false;

        const action = currentlyEnabled
            ? "deactivate"
            : "activate";

        const confirmed = window.confirm(
            currentlyEnabled
                ? `Are you sure you want to deactivate Dr. ${doctor.fullName}'s account? The doctor will no longer be able to log in.`
                : `Are you sure you want to activate Dr. ${doctor.fullName}'s account?`
        );

        if (!confirmed) return;

        try {
            setStatusUpdating(doctor.id);
            setError("");
            setSuccess("");

            const response = await apiClient.put<ApiResponse<User>>(
                `/users/${userId}/${action}`
            );

            const updatedUser = response.data.data;

            setUsers((prev) =>
                prev.map((item) =>
                    item.id === userId
                        ? {
                            ...item,
                            enabled: updatedUser.enabled,
                        }
                        : item
                )
            );

            setDoctors((prev) =>
                prev.map((item) =>
                    item.id === doctor.id
                        ? {
                            ...item,
                            enabled: updatedUser.enabled,
                        }
                        : item
                )
            );

            if (selectedDoctor?.id === doctor.id) {
                setSelectedDoctor((prev) =>
                    prev
                        ? {
                            ...prev,
                            enabled: updatedUser.enabled,
                        }
                        : prev
                );
            }

            setSuccess(
                updatedUser.enabled
                    ? "Doctor account activated successfully."
                    : "Doctor account deactivated successfully."
            );

            setTimeout(() => {
                setSuccess("");
            }, 2500);

        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                `Failed to ${action} doctor account. Please try again.`
            );
        } finally {
            setStatusUpdating(null);
        }
    };

    /* -----------------------------------------
       View
    ----------------------------------------- */

    const openView = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setShowView(true);
    };

    const closeView = () => {
        setShowView(false);
        setSelectedDoctor(null);
    };

    return (
        <div className="flex min-h-screen bg-[#F8F6F0]">

            <Sidebar
                role={user?.role ?? ""}
                isOpen={false}
                onClose={() => { }}
            />

            <div className="flex min-w-0 flex-1 flex-col lg:ml-72">

                <Topbar
                    title="Doctors"
                    userName={user?.fullName}
                    role={user?.role}
                    userEmail={user?.email}
                    onMenuClick={() => { }}
                />

                <main className="flex-1 p-5 md:p-8">

                    {/* Header */}

                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                            <h1 className="font-serif text-3xl font-medium text-[#1F3D2E]">
                                Doctors
                            </h1>

                            <p className="mt-1 text-sm text-[#68756B]">
                                Manage doctor accounts and professional profiles.
                            </p>
                        </div>

                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={fetchDoctors}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9DED5] bg-white px-4 py-2.5 text-sm font-medium text-[#1F3D2E] transition hover:bg-[#F2F4EF] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={openAddForm}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#294C3A]"
                            >
                                <Plus size={18} />
                                Add Doctor
                            </button>

                        </div>
                    </div>

                    {/* Alerts */}

                    {error && (
                        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="ml-4"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {/* Search */}

                    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#E1E4DB] bg-white p-4 md:flex-row md:items-center md:justify-between">

                        <div className="relative w-full md:max-w-md">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A948C]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search doctors..."
                                className="w-full rounded-xl border border-[#DDE2D9] bg-[#FAFBF8] py-2.5 pl-10 pr-4 text-sm text-[#26352B] outline-none transition placeholder:text-[#9AA39C] focus:border-[#1F3D2E] focus:ring-2 focus:ring-[#1F3D2E]/10"
                            />

                        </div>

                        <div className="text-sm text-[#68756B]">
                            Showing{" "}
                            <span className="font-semibold text-[#1F3D2E]">
                                {filteredDoctors.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-[#1F3D2E]">
                                {doctors.length}
                            </span>{" "}
                            doctors
                        </div>

                    </div>

                    {/* Desktop Table */}

                    <div className="hidden overflow-hidden rounded-2xl border border-[#E1E4DB] bg-white md:block">

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1100px]">

                                <thead className="border-b border-[#E5E8E2] bg-[#F7F8F4]">

                                    <tr>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Doctor
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Contact
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Specialization
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Experience
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Availability
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Account
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#68756B]">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[#E8EAE5]">

                                    {loading ? (

                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center text-sm text-[#7A847D]"
                                            >
                                                Loading doctors...
                                            </td>
                                        </tr>

                                    ) : filteredDoctors.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center"
                                            >

                                                <Stethoscope
                                                    size={32}
                                                    className="mx-auto mb-3 text-[#AAB3AA]"
                                                />

                                                <p className="text-sm font-medium text-[#48564D]">
                                                    No doctors found
                                                </p>

                                                <p className="mt-1 text-xs text-[#89938B]">
                                                    Try changing your search or add a new doctor.
                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredDoctors.map((doctor) => (

                                            <tr
                                                key={doctor.id}
                                                className="transition hover:bg-[#FBFCF9]"
                                            >

                                                {/* Doctor */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EFE5] text-[#1F3D2E]">
                                                            <Stethoscope size={18} />
                                                        </div>

                                                        <div>

                                                            <p className="font-medium text-[#24362B]">
                                                                Dr. {doctor.fullName}
                                                            </p>

                                                            <p className="text-xs text-[#8A948C]">
                                                                {doctor.qualification}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* Contact */}

                                                <td className="px-6 py-4">

                                                    <div className="space-y-1 text-sm">

                                                        <div className="flex items-center gap-2 text-[#536057]">
                                                            <Mail size={14} />
                                                            {doctor.email}
                                                        </div>

                                                        <div className="flex items-center gap-2 text-[#536057]">
                                                            <Phone size={14} />
                                                            {doctor.phone}
                                                        </div>

                                                    </div>

                                                </td>

                                                {/* Specialization */}

                                                <td className="px-6 py-4">

                                                    <span className="rounded-lg bg-[#EEF2EA] px-3 py-1.5 text-sm font-medium text-[#36513F]">
                                                        {doctor.specialization}
                                                    </span>

                                                </td>

                                                {/* Experience */}

                                                <td className="px-6 py-4 text-sm text-[#536057]">

                                                    {doctor.experienceYears}{" "}
                                                    {doctor.experienceYears === 1
                                                        ? "year"
                                                        : "years"}

                                                </td>

                                                {/* Availability */}

                                                <td className="px-6 py-4">

                                                    {doctor.available ? (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F2E7] px-3 py-1.5 text-xs font-semibold text-[#397044]">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#4B8A55]" />

                                                            Available

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F2EF] px-3 py-1.5 text-xs font-semibold text-[#737B74]">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#929A93]" />

                                                            Unavailable

                                                        </span>

                                                    )}

                                                </td>

                                                {/* Account Status */}

                                                <td className="px-6 py-4">

                                                    {doctor.enabled !== false ? (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F2E7] px-3 py-1.5 text-xs font-semibold text-[#397044]">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#4B8A55]" />

                                                            Active

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEAEA] px-3 py-1.5 text-xs font-semibold text-[#A34E4E]">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#B85D5D]" />

                                                            Inactive

                                                        </span>

                                                    )}

                                                </td>

                                                {/* Actions */}

                                                <td className="px-6 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() => openView(doctor)}
                                                            title="View"
                                                            className="rounded-lg p-2 text-[#557060] transition hover:bg-[#EAF0E7] hover:text-[#1F3D2E]"
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openEditForm(doctor)}
                                                            title="Edit"
                                                            className="rounded-lg p-2 text-[#557060] transition hover:bg-[#EAF0E7] hover:text-[#1F3D2E]"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>

                                                        {doctor.enabled !== false ? (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAccountStatus(doctor)
                                                                }
                                                                disabled={
                                                                    statusUpdating === doctor.id
                                                                }
                                                                title="Deactivate"
                                                                className="rounded-lg p-2 text-[#A25C5C] transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                                            >
                                                                {statusUpdating === doctor.id ? (
                                                                    <RefreshCw
                                                                        size={17}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <PowerOff size={17} />
                                                                )}
                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAccountStatus(doctor)
                                                                }
                                                                disabled={
                                                                    statusUpdating === doctor.id
                                                                }
                                                                title="Activate"
                                                                className="rounded-lg p-2 text-[#4C7658] transition hover:bg-[#EAF3E8] hover:text-[#1F3D2E] disabled:opacity-50"
                                                            >
                                                                {statusUpdating === doctor.id ? (
                                                                    <RefreshCw
                                                                        size={17}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Power size={17} />
                                                                )}
                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* Mobile Cards */}

                    <div className="space-y-4 md:hidden">

                        {loading ? (

                            <div className="rounded-2xl border border-[#E1E4DB] bg-white p-8 text-center text-sm text-[#7A847D]">
                                Loading doctors...
                            </div>

                        ) : filteredDoctors.length === 0 ? (

                            <div className="rounded-2xl border border-[#E1E4DB] bg-white p-8 text-center">

                                <Stethoscope
                                    size={32}
                                    className="mx-auto mb-3 text-[#AAB3AA]"
                                />

                                <p className="text-sm font-medium text-[#48564D]">
                                    No doctors found
                                </p>

                            </div>

                        ) : (

                            filteredDoctors.map((doctor) => (

                                <div
                                    key={doctor.id}
                                    className="rounded-2xl border border-[#E1E4DB] bg-white p-5"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EFE5] text-[#1F3D2E]">
                                                <Stethoscope size={19} />
                                            </div>

                                            <div>

                                                <p className="font-semibold text-[#24362B]">
                                                    Dr. {doctor.fullName}
                                                </p>

                                                <p className="text-xs text-[#89938B]">
                                                    {doctor.specialization}
                                                </p>

                                            </div>

                                        </div>

                                        {doctor.enabled !== false ? (

                                            <span className="rounded-full bg-[#E7F2E7] px-2.5 py-1 text-[11px] font-semibold text-[#397044]">
                                                Active
                                            </span>

                                        ) : (

                                            <span className="rounded-full bg-[#FBEAEA] px-2.5 py-1 text-[11px] font-semibold text-[#A34E4E]">
                                                Inactive
                                            </span>

                                        )}

                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-[#536057]">

                                        <div className="flex items-center gap-2">
                                            <Mail size={14} />
                                            {doctor.email}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Phone size={14} />
                                            {doctor.phone}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <BriefcaseMedical size={14} />

                                            {doctor.experienceYears}{" "}
                                            {doctor.experienceYears === 1
                                                ? "year"
                                                : "years"}{" "}
                                            experience
                                        </div>

                                        <div className="flex items-center gap-2">

                                            <BadgeCheck size={14} />

                                            {doctor.available
                                                ? "Available"
                                                : "Unavailable"}

                                        </div>

                                    </div>

                                    <div className="mt-4 flex justify-end gap-2 border-t border-[#E8EAE5] pt-4">

                                        <button
                                            type="button"
                                            onClick={() => openView(doctor)}
                                            title="View"
                                            className="rounded-lg p-2 text-[#557060] hover:bg-[#EAF0E7]"
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openEditForm(doctor)}
                                            title="Edit"
                                            className="rounded-lg p-2 text-[#557060] hover:bg-[#EAF0E7]"
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        {doctor.enabled !== false ? (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAccountStatus(doctor)
                                                }
                                                disabled={
                                                    statusUpdating === doctor.id
                                                }
                                                title="Deactivate"
                                                className="rounded-lg p-2 text-[#A25C5C] hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {statusUpdating === doctor.id ? (
                                                    <RefreshCw
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <PowerOff size={17} />
                                                )}
                                            </button>

                                        ) : (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAccountStatus(doctor)
                                                }
                                                disabled={
                                                    statusUpdating === doctor.id
                                                }
                                                title="Activate"
                                                className="rounded-lg p-2 text-[#4C7658] hover:bg-[#EAF3E8] disabled:opacity-50"
                                            >
                                                {statusUpdating === doctor.id ? (
                                                    <RefreshCw
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Power size={17} />
                                                )}
                                            </button>

                                        )}

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </main>

            </div>

            {/* -----------------------------------------
                ADD / EDIT MODAL
            ----------------------------------------- */}

            {showForm && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E8E2] bg-white px-6 py-5">

                            <div>

                                <h2 className="font-serif text-2xl font-medium text-[#1F3D2E]">
                                    {editingDoctor
                                        ? "Edit Doctor"
                                        : "Add Doctor"}
                                </h2>

                                <p className="mt-1 text-sm text-[#7A847D]">
                                    {editingDoctor
                                        ? "Update the doctor's professional information."
                                        : "Create a doctor login account and professional profile."}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                className="rounded-xl p-2 text-[#69756D] hover:bg-[#F1F3EF]"
                            >
                                <X size={21} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6"
                        >

                            {error && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            {/* Account */}

                            <div className="mb-7">

                                <div className="mb-4 flex items-center gap-2">

                                    <UserRound
                                        size={18}
                                        className="text-[#1F3D2E]"
                                    />

                                    <h3 className="font-semibold text-[#1F3D2E]">
                                        Account Information
                                    </h3>

                                </div>

                                <div className="grid gap-4 md:grid-cols-2">

                                    <FormInput
                                        label="Full Name"
                                        value={form.fullName}
                                        onChange={(value) =>
                                            handleChange("fullName", value)
                                        }
                                        placeholder="Enter doctor's full name"
                                        required
                                    />

                                    <FormInput
                                        label="Email"
                                        type="email"
                                        value={form.email}
                                        onChange={(value) =>
                                            handleChange("email", value)
                                        }
                                        placeholder="doctor@example.com"
                                        required
                                    />

                                    <FormInput
                                        label="Phone"
                                        value={form.phone}
                                        onChange={(value) =>
                                            handleChange("phone", value)
                                        }
                                        placeholder="Enter phone number"
                                        required
                                    />

                                    {!editingDoctor && (

                                        <FormInput
                                            label="Initial Password"
                                            type="password"
                                            value={form.password}
                                            onChange={(value) =>
                                                handleChange("password", value)
                                            }
                                            placeholder="Create login password"
                                            required
                                        />

                                    )}

                                </div>

                            </div>

                            {/* Professional */}

                            <div className="mb-7">

                                <div className="mb-4 flex items-center gap-2">

                                    <BadgeCheck
                                        size={18}
                                        className="text-[#1F3D2E]"
                                    />

                                    <h3 className="font-semibold text-[#1F3D2E]">
                                        Professional Information
                                    </h3>

                                </div>

                                <div className="grid gap-4 md:grid-cols-2">

                                    <FormInput
                                        label="Specialization"
                                        value={form.specialization}
                                        onChange={(value) =>
                                            handleChange(
                                                "specialization",
                                                value
                                            )
                                        }
                                        placeholder="e.g. Panchakarma"
                                        required
                                    />

                                    <FormInput
                                        label="Qualification"
                                        value={form.qualification}
                                        onChange={(value) =>
                                            handleChange(
                                                "qualification",
                                                value
                                            )
                                        }
                                        placeholder="e.g. BAMS, MD"
                                        required
                                    />

                                    <FormInput
                                        label="Experience Years"
                                        type="number"
                                        min="0"
                                        value={form.experienceYears}
                                        onChange={(value) =>
                                            handleChange(
                                                "experienceYears",
                                                value
                                            )
                                        }
                                        placeholder="0"
                                        required
                                    />

                                    <FormInput
                                        label="License Number"
                                        value={form.licenseNumber}
                                        onChange={(value) =>
                                            handleChange(
                                                "licenseNumber",
                                                value
                                            )
                                        }
                                        placeholder="Enter medical license number"
                                        required
                                    />

                                </div>

                                <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-[#E1E5DD] bg-[#FAFBF8] px-4 py-3">

                                    <input
                                        type="checkbox"
                                        checked={form.available}
                                        onChange={(e) =>
                                            handleChange(
                                                "available",
                                                e.target.checked
                                            )
                                        }
                                        className="h-4 w-4 accent-[#1F3D2E]"
                                    />

                                    <div>

                                        <p className="text-sm font-medium text-[#26352B]">
                                            Doctor is available
                                        </p>

                                        <p className="text-xs text-[#7B867E]">
                                            Mark whether the doctor is currently available for appointments.
                                        </p>

                                    </div>

                                </label>

                            </div>

                            {/* Buttons */}

                            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E8E2] pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-xl border border-[#D9DED5] px-5 py-2.5 text-sm font-medium text-[#4D5A52] hover:bg-[#F4F5F2] disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#294C3A] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving && (
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingDoctor
                                            ? "Update Doctor"
                                            : "Create Doctor"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* -----------------------------------------
                VIEW MODAL
            ----------------------------------------- */}

            {showView && selectedDoctor && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-[#E5E8E2] px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EFE5] text-[#1F3D2E]">
                                    <Stethoscope size={20} />
                                </div>

                                <div>

                                    <h2 className="font-serif text-2xl font-medium text-[#1F3D2E]">
                                        Dr. {selectedDoctor.fullName}
                                    </h2>

                                    <p className="text-sm text-[#7A847D]">
                                        Doctor Profile
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={closeView}
                                className="rounded-xl p-2 text-[#69756D] hover:bg-[#F1F3EF]"
                            >
                                <X size={21} />
                            </button>

                        </div>

                        <div className="grid gap-4 p-6 md:grid-cols-2">

                            <DetailItem
                                label="Email"
                                value={selectedDoctor.email}
                                icon={<Mail size={16} />}
                            />

                            <DetailItem
                                label="Phone"
                                value={selectedDoctor.phone}
                                icon={<Phone size={16} />}
                            />

                            <DetailItem
                                label="Specialization"
                                value={selectedDoctor.specialization}
                                icon={<BriefcaseMedical size={16} />}
                            />

                            <DetailItem
                                label="Qualification"
                                value={selectedDoctor.qualification}
                                icon={<BadgeCheck size={16} />}
                            />

                            <DetailItem
                                label="Experience"
                                value={`${selectedDoctor.experienceYears} ${
                                    selectedDoctor.experienceYears === 1
                                        ? "year"
                                        : "years"
                                }`}
                                icon={<BriefcaseMedical size={16} />}
                            />

                            <DetailItem
                                label="License Number"
                                value={selectedDoctor.licenseNumber}
                                icon={<BadgeCheck size={16} />}
                            />

                            <DetailItem
                                label="Availability"
                                value={
                                    selectedDoctor.available
                                        ? "Currently Available"
                                        : "Currently Unavailable"
                                }
                                icon={<BadgeCheck size={16} />}
                            />

                            <DetailItem
                                label="Account Status"
                                value={
                                    selectedDoctor.enabled !== false
                                        ? "Active"
                                        : "Inactive"
                                }
                                icon={
                                    selectedDoctor.enabled !== false
                                        ? <Power size={16} />
                                        : <PowerOff size={16} />
                                }
                            />

                            <DetailItem
                                label="Doctor ID"
                                value={selectedDoctor.id}
                                icon={<UserRound size={16} />}
                            />

                        </div>

                        <div className="flex items-center justify-between border-t border-[#E5E8E2] px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    handleAccountStatus(selectedDoctor)
                                }
                                disabled={
                                    statusUpdating === selectedDoctor.id
                                }
                                className={
                                    selectedDoctor.enabled !== false
                                        ? "inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        : "inline-flex items-center gap-2 rounded-xl border border-[#CFE0D0] px-4 py-2.5 text-sm font-medium text-[#397044] hover:bg-[#EAF3E8] disabled:opacity-50"
                                }
                            >

                                {statusUpdating === selectedDoctor.id ? (
                                    <RefreshCw
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : selectedDoctor.enabled !== false ? (
                                    <PowerOff size={16} />
                                ) : (
                                    <Power size={16} />
                                )}

                                {selectedDoctor.enabled !== false
                                    ? "Deactivate Account"
                                    : "Activate Account"}

                            </button>

                            <button
                                type="button"
                                onClick={closeView}
                                className="rounded-xl bg-[#1F3D2E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#294C3A]"
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

/* -----------------------------------------
   Form Input
----------------------------------------- */

interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    min?: string;
    required?: boolean;
}

function FormInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    min,
    required,
}: FormInputProps) {
    return (
        <div>

            <label className="mb-1.5 block text-sm font-medium text-[#35443A]">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                min={min}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-[#DDE2D9] bg-white px-4 py-2.5 text-sm text-[#26352B] outline-none transition placeholder:text-[#A0A8A1] focus:border-[#1F3D2E] focus:ring-2 focus:ring-[#1F3D2E]/10"
            />

        </div>
    );
}

/* -----------------------------------------
   Detail Item
----------------------------------------- */

interface DetailItemProps {
    label: string;
    value: string;
    icon: React.ReactNode;
}

function DetailItem({
    label,
    value,
    icon,
}: DetailItemProps) {
    return (
        <div className="rounded-xl border border-[#E1E5DD] bg-[#FAFBF8] p-4">

            <div className="mb-2 flex items-center gap-2 text-[#6C786F]">
                {icon}

                <span className="text-xs font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>

            <p className="break-words text-sm font-medium text-[#26352B]">
                {value}
            </p>

        </div>
    );
}