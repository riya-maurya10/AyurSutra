import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    UserRound,
    Stethoscope,
} from "lucide-react";

import {
    getReceptionistPatients,
    getReceptionistTherapists,
    getReceptionistActiveRooms,
    getReceptionistTherapyPlans,
    scheduleTherapy,
    generateMultiDaySchedule,
} from "../../services/receptionist/receptionistService";

import type {
    PatientResponse,
    TherapistResponse,
    RoomResponse,
} from "../../services/doctor/doctorService";

import type {
    TherapyPlan,
    TherapyPlanItem,
} from "../../services/therapyPlan/therapyPlanService";

function getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function ReceptionistSchedulerPage() {
    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
    const [therapists, setTherapists] = useState<TherapistResponse[]>([]);
    const [rooms, setRooms] = useState<RoomResponse[]>([]);

    const [selectedPatientId, setSelectedPatientId] =
        useState("");

    const [selectedPlanId, setSelectedPlanId] =
        useState("");

    const [selectedTherapyId, setSelectedTherapyId] =
        useState("");

    const [sessionDate, setSessionDate] =
        useState(getTodayDate());

    const [startTime, setStartTime] =
        useState("09:00");

    const [selectedTherapistId, setSelectedTherapistId] =
        useState("");

    const [selectedRoomId, setSelectedRoomId] =
        useState("");

    const [notes, setNotes] = useState("");

    const [multiDaySessions, setMultiDaySessions] = useState<
        Record<
            string,
            {
                sessionDate: string;
                startTime: string;
                therapistId: string;
                roomId: string;
                notes: string;
            }
        >
    >({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [multiDaySubmitting, setMultiDaySubmitting] = useState(false);
    const [scheduleMode, setScheduleMode] =
        useState<"single" | "multi">("single");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =====================================================
    // LOAD SCHEDULER DATA
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    patientData,
                    planData,
                    therapistData,
                    roomData,
                ] = await Promise.all([
                    getReceptionistPatients(),
                    getReceptionistTherapyPlans(),
                    getReceptionistTherapists(),
                    getReceptionistActiveRooms(),
                ]);

                if (!mounted) {
                    return;
                }

                setPatients(patientData ?? []);
                setTherapyPlans(planData ?? []);
                setTherapists(
                    (therapistData ?? []).filter(
                        (therapist) => therapist.available
                    )
                );
                setRooms(
                    (roomData ?? []).filter(
                        (room) => room.active
                    )
                );
            } catch (err: any) {
                if (!mounted) {
                    return;
                }

                setError(
                    err?.response?.data?.message ||
                    "Unable to load scheduler data."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    // =====================================================
    // FILTER PLANS FOR SELECTED PATIENT
    // =====================================================

    const patientPlans = useMemo(() => {
        if (!selectedPatientId) {
            return [];
        }

        return therapyPlans.filter(
            (plan) =>
                plan.patientId === selectedPatientId
        );
    }, [therapyPlans, selectedPatientId]);

    // =====================================================
    // SELECTED PLAN
    // =====================================================

    const selectedPlan = useMemo(() => {
        return therapyPlans.find(
            (plan) => plan.id === selectedPlanId
        );
    }, [therapyPlans, selectedPlanId]);

    // =====================================================
    // THERAPIES FROM SELECTED PLAN
    // =====================================================

    const planTherapies = useMemo<TherapyPlanItem[]>(() => {
        if (!selectedPlan) {
            return [];
        }

        return [...(selectedPlan.therapies ?? [])].sort(
            (a, b) => {
                if (a.day !== b.day) {
                    return a.day - b.day;
                }

                return (
                    a.sequenceOrder - b.sequenceOrder
                );
            }
        );
    }, [selectedPlan]);

    // =====================================================
    // SELECTED THERAPY
    // =====================================================

    const selectedTherapy = useMemo(() => {
        return planTherapies.find(
            (therapy) =>
                therapy.therapyId === selectedTherapyId
        );
    }, [planTherapies, selectedTherapyId]);

    // =====================================================
    // DATE LIMITS
    // =====================================================

    const minimumDate =
        selectedPlan?.startDate || getTodayDate();

    const maximumDate =
        selectedPlan?.endDate || undefined;

    // =====================================================
    // PATIENT CHANGE
    // =====================================================

    const handlePatientChange = (
        patientId: string
    ) => {
        setSelectedPatientId(patientId);

        setSelectedPlanId("");
        setSelectedTherapyId("");
        setSelectedTherapistId("");
        setSelectedRoomId("");
        setSuccessMessage("");
        setError("");
    };

    // =====================================================
    // PLAN CHANGE
    // =====================================================

    const handlePlanChange = (
        planId: string
    ) => {
        setSelectedPlanId(planId);
        setSelectedTherapyId("");
        setSelectedTherapistId("");
        setSelectedRoomId("");
        setSuccessMessage("");
        setError("");

        const plan = therapyPlans.find(
            (item) => item.id === planId
        );

        if (plan) {
            const today = getTodayDate();

            if (plan.startDate > today) {
                setSessionDate(plan.startDate);
            } else {
                setSessionDate(today);
            }
        }
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!selectedPatientId) {
            setError("Please select a patient.");
            return;
        }

        if (!selectedPlanId) {
            setError("Please select a therapy plan.");
            return;
        }

        if (!selectedTherapyId) {
            setError("Please select a therapy.");
            return;
        }

        if (!sessionDate) {
            setError("Please select a session date.");
            return;
        }

        if (!startTime) {
            setError("Please select a start time.");
            return;
        }

        if (
            selectedPlan &&
            (
                sessionDate < selectedPlan.startDate ||
                sessionDate > selectedPlan.endDate
            )
        ) {
            setError(
                `Session date must be between ${selectedPlan.startDate} and ${selectedPlan.endDate}.`
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await scheduleTherapy({
                therapyPlanId: selectedPlanId,
                therapyId: selectedTherapyId,
                sessionDate,
                startTime,
                ...(selectedTherapistId
                    ? {
                        therapistId:
                            selectedTherapistId,
                    }
                    : {}),
                ...(selectedRoomId
                    ? {
                        roomId: selectedRoomId,
                    }
                    : {}),
                ...(notes.trim()
                    ? {
                        notes: notes.trim(),
                    }
                    : {}),
            });

            setSuccessMessage(
                response.message ||
                "Therapy scheduled successfully."
            );

            setNotes("");
            setSelectedTherapistId("");
            setSelectedRoomId("");
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Unable to schedule the therapy."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // MULTI-DAY SESSION CONFIGURATION
    // =====================================================

    const getDefaultMultiDayDate = (
        therapy: TherapyPlanItem
    ): string => {
        if (!selectedPlan) {
            return getTodayDate();
        }

        const date = new Date(
            `${selectedPlan.startDate}T00:00:00`
        );

        date.setDate(
            date.getDate() + (therapy.day - 1)
        );

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const getMultiDaySessionConfig = (
        therapy: TherapyPlanItem
    ) => {
        return (
            multiDaySessions[
                `${therapy.therapyId}-${therapy.day}-${therapy.sequenceOrder}`
            ] ?? {
                sessionDate: getDefaultMultiDayDate(therapy),
                startTime: "09:00",
                therapistId: "",
                roomId: "",
                notes: "",
            }
        );
    };

    const updateMultiDaySession = (
        therapy: TherapyPlanItem,
        field:
            | "sessionDate"
            | "startTime"
            | "therapistId"
            | "roomId"
            | "notes",
        value: string
    ) => {
        const key =
            `${therapy.therapyId}-${therapy.day}-${therapy.sequenceOrder}`;

        setMultiDaySessions((current) => ({
            ...current,
            [key]: {
                ...getMultiDaySessionConfig(therapy),
                [field]: value,
            },
        }));

        setError("");
        setSuccessMessage("");
    };

    const handleMultiDaySchedule = async () => {
        setError("");
        setSuccessMessage("");

        if (!selectedPatientId) {
            setError("Please select a patient.");
            return;
        }

        if (!selectedPlanId) {
            setError("Please select a therapy plan.");
            return;
        }

        if (!selectedPlan) {
            setError("Selected therapy plan could not be found.");
            return;
        }

        if (planTherapies.length === 0) {
            setError("This therapy plan does not contain any therapies.");
            return;
        }

        const sessions = planTherapies.map((therapy) => {
            const config =
                getMultiDaySessionConfig(therapy);

            return {
                therapyId: therapy.therapyId,
                sessionDate: config.sessionDate,
                startTime: config.startTime,
                ...(config.therapistId
                    ? { therapistId: config.therapistId }
                    : {}),
                ...(config.roomId
                    ? { roomId: config.roomId }
                    : {}),
                ...(config.notes.trim()
                    ? { notes: config.notes.trim() }
                    : {}),
            };
        });

        const invalidSession = sessions.find(
            (session) =>
                !session.sessionDate ||
                !session.startTime
        );

        if (invalidSession) {
            setError(
                "Please provide a date and start time for every therapy session."
            );
            return;
        }

        const confirmed = window.confirm(
            `Schedule all ${sessions.length} sessions for "${selectedPlan.planName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setMultiDaySubmitting(true);

            const response =
                await generateMultiDaySchedule({
                    therapyPlanId: selectedPlanId,
                    sessions,
                });

            setSuccessMessage(
                response.message ||
                `${response.totalSessionsCreated} therapy sessions scheduled successfully.`
            );

            setMultiDaySessions({});
            setSelectedPatientId("");
            setSelectedPlanId("");
            setSelectedTherapyId("");
            setSelectedTherapistId("");
            setSelectedRoomId("");
            setNotes("");
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Unable to generate the multi-day schedule."
            );
        } finally {
            setMultiDaySubmitting(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-3 text-[#6B7F4E]">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />
                    <span className="text-sm font-medium">
                        Loading scheduler...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* =================================================
          HEADER
      ================================================= */}

            <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
                    Scheduling
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F3D2E]">
                    Schedule Therapy
                </h1>

                <p className="mt-1 text-sm text-[#7A806F]">
                    Schedule a therapy session for a patient
                    from their active therapy plan.
                </p>
            </div>

            {/* =================================================
          ERROR
      ================================================= */}

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="mt-0.5 font-semibold">
                        !
                    </span>

                    <p>{error}</p>
                </div>
            )}

            {/* =================================================
          SUCCESS
      ================================================= */}

            {successMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                    />

                    <div>
                        <p className="font-semibold">
                            Session scheduled
                        </p>

                        <p className="mt-0.5">
                            {successMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* =================================================
          SCHEDULING MODE
      ================================================= */}

            <div className="rounded-2xl border border-[#E6DDCC] bg-white p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setScheduleMode("single");
                            setError("");
                            setSuccessMessage("");
                        }}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                            scheduleMode === "single"
                                ? "bg-[#1F3D2E] text-white"
                                : "text-[#1F3D2E] hover:bg-[#F8F6F0]"
                        }`}
                    >
                        Single Session
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setScheduleMode("multi");
                            setError("");
                            setSuccessMessage("");
                        }}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                            scheduleMode === "multi"
                                ? "bg-[#1F3D2E] text-white"
                                : "text-[#1F3D2E] hover:bg-[#F8F6F0]"
                        }`}
                    >
                        Multi-Day Schedule
                    </button>
                </div>
            </div>

            {/* =================================================
          MAIN CARD
      ================================================= */}

            {scheduleMode === "single" && (
            <div className="rounded-3xl border border-[#E6DDCC] bg-white shadow-sm">
                <form
                    onSubmit={handleSubmit}
                    className="p-6 md:p-8"
                >
                    {/* =================================================
              PATIENT + PLAN
          ================================================= */}

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* PATIENT */}

                        <div>
                            <label
                                htmlFor="patient"
                                className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                            >
                                Patient
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
                                />

                                <select
                                    id="patient"
                                    value={selectedPatientId}
                                    onChange={(event) =>
                                        handlePatientChange(
                                            event.target.value
                                        )
                                    }
                                    className="w-full appearance-none rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                >
                                    <option value="">
                                        Select patient
                                    </option>

                                    {patients.map((patient) => (
                                        <option
                                            key={patient.id}
                                            value={patient.id}
                                        >
                                            {patient.fullName}
                                            {patient.phone
                                                ? ` — ${patient.phone}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* THERAPY PLAN */}

                        <div>
                            <label
                                htmlFor="therapyPlan"
                                className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                            >
                                Therapy Plan
                            </label>

                            <select
                                id="therapyPlan"
                                value={selectedPlanId}
                                onChange={(event) =>
                                    handlePlanChange(
                                        event.target.value
                                    )
                                }
                                disabled={!selectedPatientId}
                                className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">
                                    {!selectedPatientId
                                        ? "Select patient first"
                                        : patientPlans.length === 0
                                            ? "No therapy plans found"
                                            : "Select therapy plan"}
                                </option>

                                {patientPlans.map((plan) => (
                                    <option
                                        key={plan.id}
                                        value={plan.id}
                                    >
                                        {plan.planName} —{" "}
                                        {plan.status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* =================================================
              THERAPY
          ================================================= */}

                    <div className="mt-6">
                        <label
                            htmlFor="therapy"
                            className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                        >
                            Therapy
                        </label>

                        <select
                            id="therapy"
                            value={selectedTherapyId}
                            onChange={(event) => {
                                const therapyId = event.target.value;

                                setSelectedTherapyId(therapyId);
                                setError("");
                                setSuccessMessage("");

                                const therapy = planTherapies.find(
                                    (item) => item.therapyId === therapyId
                                );

                                if (!therapy || !selectedPlan) {
                                    return;
                                }

                                // Default only when the current date is outside
                                // the selected therapy plan period.
                                const isOutsidePlanPeriod =
                                    sessionDate < selectedPlan.startDate ||
                                    sessionDate > selectedPlan.endDate;

                                if (isOutsidePlanPeriod) {
                                    const planStart = new Date(
                                        `${selectedPlan.startDate}T00:00:00`
                                    );

                                    planStart.setDate(
                                        planStart.getDate() + (therapy.day - 1)
                                    );

                                    const year = planStart.getFullYear();
                                    const month = String(
                                        planStart.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(
                                        planStart.getDate()
                                    ).padStart(2, "0");

                                    const calculatedDate =
                                        `${year}-${month}-${day}`;

                                    if (
                                        calculatedDate >= selectedPlan.startDate &&
                                        calculatedDate <= selectedPlan.endDate
                                    ) {
                                        setSessionDate(calculatedDate);
                                    } else {
                                        setSessionDate(selectedPlan.startDate);
                                    }
                                }
                            }}
                            disabled={!selectedPlanId}
                            className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">
                                {!selectedPlanId
                                    ? "Select therapy plan first"
                                    : planTherapies.length === 0
                                        ? "No therapies in this plan"
                                        : "Select therapy"}
                            </option>

                            {planTherapies.map(
                                (therapy, index) => (
                                    <option
                                        key={`${therapy.therapyId}-${therapy.day}-${therapy.sequenceOrder}-${index}`}
                                        value={therapy.therapyId}
                                    >
                                        Day {therapy.day} —{" "}
                                        {therapy.therapyName} (
                                        {therapy.durationMinutes} min)
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* =================================================
              SELECTED THERAPY INFO
          ================================================= */}

                    {selectedTherapy && (
                        <div className="mt-4 rounded-2xl bg-[#F8F6F0] p-4">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-[#7A806F]">
                                        Therapy
                                    </p>

                                    <p className="mt-1 font-semibold text-[#1F3D2E]">
                                        {selectedTherapy.therapyName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-[#7A806F]">
                                        Plan Day
                                    </p>

                                    <p className="mt-1 font-semibold text-[#1F3D2E]">
                                        Day {selectedTherapy.day}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock3
                                        size={16}
                                        className="text-[#6B7F4E]"
                                    />

                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-[#7A806F]">
                                            Duration
                                        </p>

                                        <p className="mt-1 font-semibold text-[#1F3D2E]">
                                            {
                                                selectedTherapy.durationMinutes
                                            }{" "}
                                            minutes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =================================================
              DATE + TIME
          ================================================= */}

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* DATE */}

                        <div>
                            <label
                                htmlFor="sessionDate"
                                className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                            >
                                Session Date
                            </label>

                            <div className="relative">
                                <CalendarDays
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
                                />

                                <input
                                    id="sessionDate"
                                    type="date"
                                    value={sessionDate}
                                    min={minimumDate}
                                    max={maximumDate}
                                    onChange={(event) => {
                                        setSessionDate(
                                            event.target.value
                                        );
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                />
                            </div>

                            {selectedPlan && (
                                <p className="mt-2 text-xs text-[#7A806F]">
                                    Plan period:{" "}
                                    {selectedPlan.startDate} to{" "}
                                    {selectedPlan.endDate}
                                </p>
                            )}
                        </div>

                        {/* TIME */}

                        <div>
                            <label
                                htmlFor="startTime"
                                className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                            >
                                Start Time
                            </label>

                            <div className="relative">
                                <Clock3
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
                                />

                                <input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => {
                                        setStartTime(
                                            event.target.value
                                        );
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                />
                            </div>

                            <p className="mt-2 text-xs text-[#7A806F]">
                                End time is calculated automatically
                                from the therapy duration.
                            </p>
                        </div>
                    </div>

                    {/* =================================================
              THERAPIST + ROOM
          ================================================= */}

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* THERAPIST */}

                        <div>
                            <label
                                htmlFor="therapist"
                                className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F3D2E]"
                            >
                                <Stethoscope
                                    size={16}
                                    className="text-[#6B7F4E]"
                                />
                                Therapist
                            </label>

                            <select
                                id="therapist"
                                value={selectedTherapistId}
                                onChange={(event) => {
                                    setSelectedTherapistId(
                                        event.target.value
                                    );
                                    setError("");
                                    setSuccessMessage("");
                                }}
                                className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                            >
                                <option value="">
                                    Auto assign therapist
                                </option>

                                {therapists.map((therapist) => (
                                    <option
                                        key={therapist.id}
                                        value={therapist.id}
                                    >
                                        {therapist.fullName}
                                        {therapist.specialization
                                            ? ` — ${therapist.specialization}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-2 text-xs text-[#7A806F]">
                                Leave as auto assign to let the
                                backend find an available therapist.
                            </p>
                        </div>

                        {/* ROOM */}

                        <div>
                            <label
                                htmlFor="room"
                                className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F3D2E]"
                            >
                                <MapPin
                                    size={16}
                                    className="text-[#6B7F4E]"
                                />
                                Room
                            </label>

                            <select
                                id="room"
                                value={selectedRoomId}
                                onChange={(event) => {
                                    setSelectedRoomId(
                                        event.target.value
                                    );
                                    setError("");
                                    setSuccessMessage("");
                                }}
                                className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                            >
                                <option value="">
                                    Auto assign room
                                </option>

                                {rooms.map((room) => (
                                    <option
                                        key={room.id}
                                        value={room.id}
                                    >
                                        {room.roomNumber} —{" "}
                                        {room.name}
                                        {room.type
                                            ? ` (${room.type})`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-2 text-xs text-[#7A806F]">
                                Leave as auto assign to let the
                                backend select a suitable room.
                            </p>
                        </div>
                    </div>

                    {/* =================================================
              NOTES
          ================================================= */}

                    <div className="mt-6">
                        <label
                            htmlFor="notes"
                            className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                        >
                            Notes
                        </label>

                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(event) => {
                                setNotes(event.target.value);
                                setError("");
                                setSuccessMessage("");
                            }}
                            rows={4}
                            placeholder="Add any scheduling notes..."
                            className="w-full resize-none rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A4A493] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                        />
                    </div>

                    {/* =================================================
              SUBMIT
          ================================================= */}

                    <div className="mt-8 flex justify-end border-t border-[#EEE7D9] pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <CalendarDays size={17} />
                                    Schedule Therapy
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            )}

            {/* =================================================
          MULTI-DAY SCHEDULE CARD
      ================================================= */}

            {scheduleMode === "multi" && (
                <div className="rounded-3xl border border-[#E6DDCC] bg-white shadow-sm">
                    <div className="p-6 md:p-8">
                        <div className="rounded-2xl bg-[#F8F6F0] p-5">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
                                Multi-Day Scheduling
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-[#1F3D2E]">
                                Schedule the complete therapy plan
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#7A806F]">
                                Configure the date, time, therapist and room
                                for every therapy, then schedule the complete
                                plan in one operation.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="multiDayPatient"
                                    className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                                >
                                    Patient
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
                                    />

                                    <select
                                        id="multiDayPatient"
                                        value={selectedPatientId}
                                        onChange={(event) =>
                                            handlePatientChange(
                                                event.target.value
                                            )
                                        }
                                        className="w-full appearance-none rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                    >
                                        <option value="">
                                            Select patient
                                        </option>

                                        {patients.map((patient) => (
                                            <option
                                                key={patient.id}
                                                value={patient.id}
                                            >
                                                {patient.fullName}
                                                {patient.phone
                                                    ? ` — ${patient.phone}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="multiDayTherapyPlan"
                                    className="mb-2 block text-sm font-medium text-[#1F3D2E]"
                                >
                                    Therapy Plan
                                </label>

                                <select
                                    id="multiDayTherapyPlan"
                                    value={selectedPlanId}
                                    onChange={(event) =>
                                        handlePlanChange(
                                            event.target.value
                                        )
                                    }
                                    disabled={!selectedPatientId}
                                    className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value="">
                                        {!selectedPatientId
                                            ? "Select patient first"
                                            : patientPlans.length === 0
                                                ? "No therapy plans found"
                                                : "Select therapy plan"}
                                    </option>

                                    {patientPlans.map((plan) => (
                                        <option
                                            key={plan.id}
                                            value={plan.id}
                                        >
                                            {plan.planName} — {plan.status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedPlan && (
                            <div className="mt-6">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-[#1F3D2E]">
                                        Sessions to schedule
                                    </p>
                                    <p className="mt-1 text-xs text-[#7A806F]">
                                        Set the date, time, therapist and room
                                        for each planned therapy. Dependency
                                        rules will be checked by the backend.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {planTherapies.map(
                                        (therapy, index) => {
                                            const config =
                                                getMultiDaySessionConfig(
                                                    therapy
                                                );

                                            return (
                                                <div
                                                    key={`${therapy.therapyId}-${therapy.day}-${therapy.sequenceOrder}-${index}`}
                                                    className="rounded-2xl border border-[#E6DDCC] bg-[#FCFBF7] p-5"
                                                >
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7F4E]">
                                                                Day {therapy.day}
                                                                {" · "}
                                                                Session{" "}
                                                                {therapy.sequenceOrder}
                                                            </p>

                                                            <p className="mt-1 font-semibold text-[#1F3D2E]">
                                                                {therapy.therapyName}
                                                            </p>
                                                        </div>

                                                        <div className="text-xs text-[#7A806F]">
                                                            {therapy.durationMinutes}{" "}
                                                            min
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <label className="mb-2 block text-xs font-medium text-[#1F3D2E]">
                                                                Date
                                                            </label>

                                                            <input
                                                                type="date"
                                                                value={config.sessionDate}
                                                                min={selectedPlan.startDate}
                                                                max={selectedPlan.endDate}
                                                                onChange={(event) =>
                                                                    updateMultiDaySession(
                                                                        therapy,
                                                                        "sessionDate",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full rounded-xl border border-[#DCC8A3] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="mb-2 block text-xs font-medium text-[#1F3D2E]">
                                                                Start Time
                                                            </label>

                                                            <input
                                                                type="time"
                                                                value={config.startTime}
                                                                onChange={(event) =>
                                                                    updateMultiDaySession(
                                                                        therapy,
                                                                        "startTime",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full rounded-xl border border-[#DCC8A3] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="mb-2 block text-xs font-medium text-[#1F3D2E]">
                                                                Therapist
                                                            </label>

                                                            <select
                                                                value={config.therapistId}
                                                                onChange={(event) =>
                                                                    updateMultiDaySession(
                                                                        therapy,
                                                                        "therapistId",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full rounded-xl border border-[#DCC8A3] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                                            >
                                                                <option value="">
                                                                    Auto assign therapist
                                                                </option>

                                                                {therapists.map(
                                                                    (therapist) => (
                                                                        <option
                                                                            key={
                                                                                therapist.id
                                                                            }
                                                                            value={
                                                                                therapist.id
                                                                            }
                                                                        >
                                                                            {
                                                                                therapist.fullName
                                                                            }
                                                                            {therapist.specialization
                                                                                ? ` — ${therapist.specialization}`
                                                                                : ""}
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="mb-2 block text-xs font-medium text-[#1F3D2E]">
                                                                Room
                                                            </label>

                                                            <select
                                                                value={config.roomId}
                                                                onChange={(event) =>
                                                                    updateMultiDaySession(
                                                                        therapy,
                                                                        "roomId",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full rounded-xl border border-[#DCC8A3] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                                            >
                                                                <option value="">
                                                                    Auto assign room
                                                                </option>

                                                                {rooms.map(
                                                                    (room) => (
                                                                        <option
                                                                            key={
                                                                                room.id
                                                                            }
                                                                            value={
                                                                                room.id
                                                                            }
                                                                        >
                                                                            {
                                                                                room.roomNumber
                                                                            }
                                                                            {" — "}
                                                                            {room.name}
                                                                            {room.type
                                                                                ? ` (${room.type})`
                                                                                : ""}
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <label className="mb-2 block text-xs font-medium text-[#1F3D2E]">
                                                            Notes
                                                        </label>

                                                        <textarea
                                                            value={config.notes}
                                                            onChange={(event) =>
                                                                updateMultiDaySession(
                                                                    therapy,
                                                                    "notes",
                                                                    event.target.value
                                                                )
                                                            }
                                                            rows={2}
                                                            placeholder="Optional session notes..."
                                                            className="w-full resize-none rounded-xl border border-[#DCC8A3] bg-white px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A4A493] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end border-t border-[#EEE7D9] pt-6">
                            <button
                                type="button"
                                onClick={handleMultiDaySchedule}
                                disabled={
                                    multiDaySubmitting ||
                                    !selectedPatientId ||
                                    !selectedPlanId
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {multiDaySubmitting ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Scheduling All...
                                    </>
                                ) : (
                                    <>
                                        <CalendarDays size={17} />
                                        Schedule All Sessions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistSchedulerPage;





// import { useEffect, useMemo, useState } from "react";
// import {
//     CalendarDays,
//     CheckCircle2,
//     Clock3,
//     Loader2,
//     MapPin,
//     UserRound,
//     Stethoscope,
// } from "lucide-react";

// import {
//     getReceptionistPatients,
//     getReceptionistTherapists,
//     getReceptionistActiveRooms,
//     getReceptionistTherapyPlans,
//     scheduleTherapy,
// } from "../../services/receptionist/receptionistService";

// import type {
//     PatientResponse,
//     TherapistResponse,
//     RoomResponse,
// } from "../../services/doctor/doctorService";

// import type {
//     TherapyPlan,
//     TherapyPlanItem,
// } from "../../services/therapyPlan/therapyPlanService";

// function getTodayDate(): string {
//     const today = new Date();

//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
// }

// function ReceptionistSchedulerPage() {
//     const [patients, setPatients] = useState<PatientResponse[]>([]);
//     const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
//     const [therapists, setTherapists] = useState<TherapistResponse[]>([]);
//     const [rooms, setRooms] = useState<RoomResponse[]>([]);

//     const [selectedPatientId, setSelectedPatientId] =
//         useState("");

//     const [selectedPlanId, setSelectedPlanId] =
//         useState("");

//     const [selectedTherapyId, setSelectedTherapyId] =
//         useState("");

//     const [sessionDate, setSessionDate] =
//         useState(getTodayDate());

//     const [startTime, setStartTime] =
//         useState("09:00");

//     const [selectedTherapistId, setSelectedTherapistId] =
//         useState("");

//     const [selectedRoomId, setSelectedRoomId] =
//         useState("");

//     const [notes, setNotes] = useState("");

//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);

//     const [error, setError] = useState("");
//     const [successMessage, setSuccessMessage] = useState("");

//     // =====================================================
//     // LOAD SCHEDULER DATA
//     // =====================================================

//     useEffect(() => {
//         let mounted = true;

//         const loadData = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const [
//                     patientData,
//                     planData,
//                     therapistData,
//                     roomData,
//                 ] = await Promise.all([
//                     getReceptionistPatients(),
//                     getReceptionistTherapyPlans(),
//                     getReceptionistTherapists(),
//                     getReceptionistActiveRooms(),
//                 ]);

//                 if (!mounted) {
//                     return;
//                 }

//                 setPatients(patientData ?? []);
//                 setTherapyPlans(planData ?? []);
//                 setTherapists(
//                     (therapistData ?? []).filter(
//                         (therapist) => therapist.available
//                     )
//                 );
//                 setRooms(
//                     (roomData ?? []).filter(
//                         (room) => room.active
//                     )
//                 );
//             } catch (err: any) {
//                 if (!mounted) {
//                     return;
//                 }

//                 setError(
//                     err?.response?.data?.message ||
//                     "Unable to load scheduler data."
//                 );
//             } finally {
//                 if (mounted) {
//                     setLoading(false);
//                 }
//             }
//         };

//         loadData();

//         return () => {
//             mounted = false;
//         };
//     }, []);

//     // =====================================================
//     // FILTER PLANS FOR SELECTED PATIENT
//     // =====================================================

//     const patientPlans = useMemo(() => {
//         if (!selectedPatientId) {
//             return [];
//         }

//         return therapyPlans.filter(
//             (plan) =>
//                 plan.patientId === selectedPatientId
//         );
//     }, [therapyPlans, selectedPatientId]);

//     // =====================================================
//     // SELECTED PLAN
//     // =====================================================

//     const selectedPlan = useMemo(() => {
//         return therapyPlans.find(
//             (plan) => plan.id === selectedPlanId
//         );
//     }, [therapyPlans, selectedPlanId]);

//     // =====================================================
//     // THERAPIES FROM SELECTED PLAN
//     // =====================================================

//     const planTherapies = useMemo<TherapyPlanItem[]>(() => {
//         if (!selectedPlan) {
//             return [];
//         }

//         return [...(selectedPlan.therapies ?? [])].sort(
//             (a, b) => {
//                 if (a.day !== b.day) {
//                     return a.day - b.day;
//                 }

//                 return (
//                     a.sequenceOrder - b.sequenceOrder
//                 );
//             }
//         );
//     }, [selectedPlan]);

//     // =====================================================
//     // SELECTED THERAPY
//     // =====================================================

//     const selectedTherapy = useMemo(() => {
//         return planTherapies.find(
//             (therapy) =>
//                 therapy.therapyId === selectedTherapyId
//         );
//     }, [planTherapies, selectedTherapyId]);

//     // =====================================================
//     // DATE LIMITS
//     // =====================================================

//     const minimumDate =
//         selectedPlan?.startDate || getTodayDate();

//     const maximumDate =
//         selectedPlan?.endDate || undefined;

//     // =====================================================
//     // PATIENT CHANGE
//     // =====================================================

//     const handlePatientChange = (
//         patientId: string
//     ) => {
//         setSelectedPatientId(patientId);

//         setSelectedPlanId("");
//         setSelectedTherapyId("");
//         setSelectedTherapistId("");
//         setSelectedRoomId("");
//         setSuccessMessage("");
//         setError("");
//     };

//     // =====================================================
//     // PLAN CHANGE
//     // =====================================================

//     const handlePlanChange = (
//         planId: string
//     ) => {
//         setSelectedPlanId(planId);
//         setSelectedTherapyId("");
//         setSelectedTherapistId("");
//         setSelectedRoomId("");
//         setSuccessMessage("");
//         setError("");

//         const plan = therapyPlans.find(
//             (item) => item.id === planId
//         );

//         if (plan) {
//             const today = getTodayDate();

//             if (plan.startDate > today) {
//                 setSessionDate(plan.startDate);
//             } else {
//                 setSessionDate(today);
//             }
//         }
//     };

//     // =====================================================
//     // SUBMIT
//     // =====================================================

//     const handleSubmit = async (
//         event: React.FormEvent
//     ) => {
//         event.preventDefault();

//         setError("");
//         setSuccessMessage("");

//         if (!selectedPatientId) {
//             setError("Please select a patient.");
//             return;
//         }

//         if (!selectedPlanId) {
//             setError("Please select a therapy plan.");
//             return;
//         }

//         if (!selectedTherapyId) {
//             setError("Please select a therapy.");
//             return;
//         }

//         if (!sessionDate) {
//             setError("Please select a session date.");
//             return;
//         }

//         if (!startTime) {
//             setError("Please select a start time.");
//             return;
//         }

//         if (
//             selectedPlan &&
//             (
//                 sessionDate < selectedPlan.startDate ||
//                 sessionDate > selectedPlan.endDate
//             )
//         ) {
//             setError(
//                 `Session date must be between ${selectedPlan.startDate} and ${selectedPlan.endDate}.`
//             );
//             return;
//         }

//         try {
//             setSubmitting(true);

//             const response = await scheduleTherapy({
//                 therapyPlanId: selectedPlanId,
//                 therapyId: selectedTherapyId,
//                 sessionDate,
//                 startTime,
//                 ...(selectedTherapistId
//                     ? {
//                         therapistId:
//                             selectedTherapistId,
//                     }
//                     : {}),
//                 ...(selectedRoomId
//                     ? {
//                         roomId: selectedRoomId,
//                     }
//                     : {}),
//                 ...(notes.trim()
//                     ? {
//                         notes: notes.trim(),
//                     }
//                     : {}),
//             });

//             setSuccessMessage(
//                 response.message ||
//                 "Therapy scheduled successfully."
//             );

//             setNotes("");
//             setSelectedTherapistId("");
//             setSelectedRoomId("");
//         } catch (err: any) {
//             setError(
//                 err?.response?.data?.message ||
//                 "Unable to schedule the therapy."
//             );
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // =====================================================
//     // LOADING
//     // =====================================================

//     if (loading) {
//         return (
//             <div className="flex min-h-[500px] items-center justify-center">
//                 <div className="flex items-center gap-3 text-[#6B7F4E]">
//                     <Loader2
//                         size={22}
//                         className="animate-spin"
//                     />
//                     <span className="text-sm font-medium">
//                         Loading scheduler...
//                     </span>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* =================================================
//           HEADER
//       ================================================= */}

//             <div>
//                 <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
//                     Scheduling
//                 </p>

//                 <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F3D2E]">
//                     Schedule Therapy
//                 </h1>

//                 <p className="mt-1 text-sm text-[#7A806F]">
//                     Schedule a therapy session for a patient
//                     from their active therapy plan.
//                 </p>
//             </div>

//             {/* =================================================
//           ERROR
//       ================================================= */}

//             {error && (
//                 <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                     <span className="mt-0.5 font-semibold">
//                         !
//                     </span>

//                     <p>{error}</p>
//                 </div>
//             )}

//             {/* =================================================
//           SUCCESS
//       ================================================= */}

//             {successMessage && (
//                 <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//                     <CheckCircle2
//                         size={18}
//                         className="mt-0.5 shrink-0"
//                     />

//                     <div>
//                         <p className="font-semibold">
//                             Session scheduled
//                         </p>

//                         <p className="mt-0.5">
//                             {successMessage}
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* =================================================
//           MAIN CARD
//       ================================================= */}

//             <div className="rounded-3xl border border-[#E6DDCC] bg-white shadow-sm">
//                 <form
//                     onSubmit={handleSubmit}
//                     className="p-6 md:p-8"
//                 >
//                     {/* =================================================
//               PATIENT + PLAN
//           ================================================= */}

//                     <div className="grid gap-6 md:grid-cols-2">
//                         {/* PATIENT */}

//                         <div>
//                             <label
//                                 htmlFor="patient"
//                                 className="mb-2 block text-sm font-medium text-[#1F3D2E]"
//                             >
//                                 Patient
//                             </label>

//                             <div className="relative">
//                                 <UserRound
//                                     size={18}
//                                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
//                                 />

//                                 <select
//                                     id="patient"
//                                     value={selectedPatientId}
//                                     onChange={(event) =>
//                                         handlePatientChange(
//                                             event.target.value
//                                         )
//                                     }
//                                     className="w-full appearance-none rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
//                                 >
//                                     <option value="">
//                                         Select patient
//                                     </option>

//                                     {patients.map((patient) => (
//                                         <option
//                                             key={patient.id}
//                                             value={patient.id}
//                                         >
//                                             {patient.fullName}
//                                             {patient.phone
//                                                 ? ` — ${patient.phone}`
//                                                 : ""}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         {/* THERAPY PLAN */}

//                         <div>
//                             <label
//                                 htmlFor="therapyPlan"
//                                 className="mb-2 block text-sm font-medium text-[#1F3D2E]"
//                             >
//                                 Therapy Plan
//                             </label>

//                             <select
//                                 id="therapyPlan"
//                                 value={selectedPlanId}
//                                 onChange={(event) =>
//                                     handlePlanChange(
//                                         event.target.value
//                                     )
//                                 }
//                                 disabled={!selectedPatientId}
//                                 className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
//                             >
//                                 <option value="">
//                                     {!selectedPatientId
//                                         ? "Select patient first"
//                                         : patientPlans.length === 0
//                                             ? "No therapy plans found"
//                                             : "Select therapy plan"}
//                                 </option>

//                                 {patientPlans.map((plan) => (
//                                     <option
//                                         key={plan.id}
//                                         value={plan.id}
//                                     >
//                                         {plan.planName} —{" "}
//                                         {plan.status}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     {/* =================================================
//               THERAPY
//           ================================================= */}

//                     <div className="mt-6">
//                         <label
//                             htmlFor="therapy"
//                             className="mb-2 block text-sm font-medium text-[#1F3D2E]"
//                         >
//                             Therapy
//                         </label>

//                         <select
//                             id="therapy"
//                             value={selectedTherapyId}
//                             onChange={(event) => {
//                                 const therapyId = event.target.value;

//                                 setSelectedTherapyId(therapyId);
//                                 setError("");
//                                 setSuccessMessage("");

//                                 const therapy = planTherapies.find(
//                                     (item) => item.therapyId === therapyId
//                                 );

//                                 if (!therapy || !selectedPlan) {
//                                     return;
//                                 }

//                                 // Default only when the current date is outside
//                                 // the selected therapy plan period.
//                                 const isOutsidePlanPeriod =
//                                     sessionDate < selectedPlan.startDate ||
//                                     sessionDate > selectedPlan.endDate;

//                                 if (isOutsidePlanPeriod) {
//                                     const planStart = new Date(
//                                         `${selectedPlan.startDate}T00:00:00`
//                                     );

//                                     planStart.setDate(
//                                         planStart.getDate() + (therapy.day - 1)
//                                     );

//                                     const year = planStart.getFullYear();
//                                     const month = String(
//                                         planStart.getMonth() + 1
//                                     ).padStart(2, "0");
//                                     const day = String(
//                                         planStart.getDate()
//                                     ).padStart(2, "0");

//                                     const calculatedDate =
//                                         `${year}-${month}-${day}`;

//                                     if (
//                                         calculatedDate >= selectedPlan.startDate &&
//                                         calculatedDate <= selectedPlan.endDate
//                                     ) {
//                                         setSessionDate(calculatedDate);
//                                     } else {
//                                         setSessionDate(selectedPlan.startDate);
//                                     }
//                                 }
//                             }}
//                             disabled={!selectedPlanId}
//                             className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
//                         >
//                             <option value="">
//                                 {!selectedPlanId
//                                     ? "Select therapy plan first"
//                                     : planTherapies.length === 0
//                                         ? "No therapies in this plan"
//                                         : "Select therapy"}
//                             </option>

//                             {planTherapies.map(
//                                 (therapy, index) => (
//                                     <option
//                                         key={`${therapy.therapyId}-${therapy.day}-${therapy.sequenceOrder}-${index}`}
//                                         value={therapy.therapyId}
//                                     >
//                                         Day {therapy.day} —{" "}
//                                         {therapy.therapyName} (
//                                         {therapy.durationMinutes} min)
//                                     </option>
//                                 )
//                             )}
//                         </select>
//                     </div>

//                     {/* =================================================
//               SELECTED THERAPY INFO
//           ================================================= */}

//                     {selectedTherapy && (
//                         <div className="mt-4 rounded-2xl bg-[#F8F6F0] p-4">
//                             <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
//                                 <div>
//                                     <p className="text-xs uppercase tracking-wide text-[#7A806F]">
//                                         Therapy
//                                     </p>

//                                     <p className="mt-1 font-semibold text-[#1F3D2E]">
//                                         {selectedTherapy.therapyName}
//                                     </p>
//                                 </div>

//                                 <div>
//                                     <p className="text-xs uppercase tracking-wide text-[#7A806F]">
//                                         Plan Day
//                                     </p>

//                                     <p className="mt-1 font-semibold text-[#1F3D2E]">
//                                         Day {selectedTherapy.day}
//                                     </p>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     <Clock3
//                                         size={16}
//                                         className="text-[#6B7F4E]"
//                                     />

//                                     <div>
//                                         <p className="text-xs uppercase tracking-wide text-[#7A806F]">
//                                             Duration
//                                         </p>

//                                         <p className="mt-1 font-semibold text-[#1F3D2E]">
//                                             {
//                                                 selectedTherapy.durationMinutes
//                                             }{" "}
//                                             minutes
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* =================================================
//               DATE + TIME
//           ================================================= */}

//                     <div className="mt-6 grid gap-6 md:grid-cols-2">
//                         {/* DATE */}

//                         <div>
//                             <label
//                                 htmlFor="sessionDate"
//                                 className="mb-2 block text-sm font-medium text-[#1F3D2E]"
//                             >
//                                 Session Date
//                             </label>

//                             <div className="relative">
//                                 <CalendarDays
//                                     size={18}
//                                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
//                                 />

//                                 <input
//                                     id="sessionDate"
//                                     type="date"
//                                     value={sessionDate}
//                                     min={minimumDate}
//                                     max={maximumDate}
//                                     onChange={(event) => {
//                                         setSessionDate(
//                                             event.target.value
//                                         );
//                                         setError("");
//                                         setSuccessMessage("");
//                                     }}
//                                     className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
//                                 />
//                             </div>

//                             {selectedPlan && (
//                                 <p className="mt-2 text-xs text-[#7A806F]">
//                                     Plan period:{" "}
//                                     {selectedPlan.startDate} to{" "}
//                                     {selectedPlan.endDate}
//                                 </p>
//                             )}
//                         </div>

//                         {/* TIME */}

//                         <div>
//                             <label
//                                 htmlFor="startTime"
//                                 className="mb-2 block text-sm font-medium text-[#1F3D2E]"
//                             >
//                                 Start Time
//                             </label>

//                             <div className="relative">
//                                 <Clock3
//                                     size={18}
//                                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F7F]"
//                                 />

//                                 <input
//                                     id="startTime"
//                                     type="time"
//                                     value={startTime}
//                                     onChange={(event) => {
//                                         setStartTime(
//                                             event.target.value
//                                         );
//                                         setError("");
//                                         setSuccessMessage("");
//                                     }}
//                                     className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] py-3 pl-10 pr-4 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
//                                 />
//                             </div>

//                             <p className="mt-2 text-xs text-[#7A806F]">
//                                 End time is calculated automatically
//                                 from the therapy duration.
//                             </p>
//                         </div>
//                     </div>

//                     {/* =================================================
//               THERAPIST + ROOM
//           ================================================= */}

//                     <div className="mt-6 grid gap-6 md:grid-cols-2">
//                         {/* THERAPIST */}

//                         <div>
//                             <label
//                                 htmlFor="therapist"
//                                 className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F3D2E]"
//                             >
//                                 <Stethoscope
//                                     size={16}
//                                     className="text-[#6B7F4E]"
//                                 />
//                                 Therapist
//                             </label>

//                             <select
//                                 id="therapist"
//                                 value={selectedTherapistId}
//                                 onChange={(event) => {
//                                     setSelectedTherapistId(
//                                         event.target.value
//                                     );
//                                     setError("");
//                                     setSuccessMessage("");
//                                 }}
//                                 className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
//                             >
//                                 <option value="">
//                                     Auto assign therapist
//                                 </option>

//                                 {therapists.map((therapist) => (
//                                     <option
//                                         key={therapist.id}
//                                         value={therapist.id}
//                                     >
//                                         {therapist.fullName}
//                                         {therapist.specialization
//                                             ? ` — ${therapist.specialization}`
//                                             : ""}
//                                     </option>
//                                 ))}
//                             </select>

//                             <p className="mt-2 text-xs text-[#7A806F]">
//                                 Leave as auto assign to let the
//                                 backend find an available therapist.
//                             </p>
//                         </div>

//                         {/* ROOM */}

//                         <div>
//                             <label
//                                 htmlFor="room"
//                                 className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F3D2E]"
//                             >
//                                 <MapPin
//                                     size={16}
//                                     className="text-[#6B7F4E]"
//                                 />
//                                 Room
//                             </label>

//                             <select
//                                 id="room"
//                                 value={selectedRoomId}
//                                 onChange={(event) => {
//                                     setSelectedRoomId(
//                                         event.target.value
//                                     );
//                                     setError("");
//                                     setSuccessMessage("");
//                                 }}
//                                 className="w-full rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
//                             >
//                                 <option value="">
//                                     Auto assign room
//                                 </option>

//                                 {rooms.map((room) => (
//                                     <option
//                                         key={room.id}
//                                         value={room.id}
//                                     >
//                                         {room.roomNumber} —{" "}
//                                         {room.name}
//                                         {room.type
//                                             ? ` (${room.type})`
//                                             : ""}
//                                     </option>
//                                 ))}
//                             </select>

//                             <p className="mt-2 text-xs text-[#7A806F]">
//                                 Leave as auto assign to let the
//                                 backend select a suitable room.
//                             </p>
//                         </div>
//                     </div>

//                     {/* =================================================
//               NOTES
//           ================================================= */}

//                     <div className="mt-6">
//                         <label
//                             htmlFor="notes"
//                             className="mb-2 block text-sm font-medium text-[#1F3D2E]"
//                         >
//                             Notes
//                         </label>

//                         <textarea
//                             id="notes"
//                             value={notes}
//                             onChange={(event) => {
//                                 setNotes(event.target.value);
//                                 setError("");
//                                 setSuccessMessage("");
//                             }}
//                             rows={4}
//                             placeholder="Add any scheduling notes..."
//                             className="w-full resize-none rounded-xl border border-[#DCC8A3] bg-[#FCFBF7] px-4 py-3 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A4A493] focus:border-[#6B7F4E] focus:ring-2 focus:ring-[#6B7F4E]/10"
//                         />
//                     </div>

//                     {/* =================================================
//               SUBMIT
//           ================================================= */}

//                     <div className="mt-8 flex justify-end border-t border-[#EEE7D9] pt-6">
//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="inline-flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B7F4E] disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                             {submitting ? (
//                                 <>
//                                     <Loader2
//                                         size={17}
//                                         className="animate-spin"
//                                     />
//                                     Scheduling...
//                                 </>
//                             ) : (
//                                 <>
//                                     <CalendarDays size={17} />
//                                     Schedule Therapy
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default ReceptionistSchedulerPage;