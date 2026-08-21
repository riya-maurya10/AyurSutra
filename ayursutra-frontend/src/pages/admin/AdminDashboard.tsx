import { useEffect, useState } from "react";
import {
  Activity,
  BedDouble,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api/client";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import StatCard from "../../components/dashboard/StatCard";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Patient {
  id: string;
  [key: string]: unknown;
}

interface Therapy {
  id: string;
  [key: string]: unknown;
}

interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: string;
  capacity: number;
  description: string;
  active: boolean;
}

interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  licenseNumber: string;
  available: boolean;
}

interface Therapist {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  therapistType: string;
  available: boolean;
}

function AdminDashboard() {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [patientCount, setPatientCount] = useState<number | null>(
    null
  );

  const [therapyCount, setTherapyCount] = useState<number | null>(
    null
  );

  const [roomCount, setRoomCount] = useState<number | null>(null);

  const [doctorCount, setDoctorCount] = useState<number | null>(
    null
  );

  const [therapistCount, setTherapistCount] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          patientsResponse,
          therapiesResponse,
          roomsResponse,
          doctorsResponse,
          therapistsResponse,
        ] = await Promise.all([
          apiClient.get<ApiResponse<Patient[]>>("/patients"),

          apiClient.get<ApiResponse<Therapy[]>>("/therapies"),

          apiClient.get<ApiResponse<Room[]>>("/rooms"),

          apiClient.get<ApiResponse<Doctor[]>>("/doctors"),

          apiClient.get<ApiResponse<Therapist[]>>("/therapists"),
        ]);

        console.log(
          "Patients:",
          patientsResponse.data
        );

        console.log(
          "Therapies:",
          therapiesResponse.data
        );

        console.log(
          "Rooms:",
          roomsResponse.data
        );

        console.log(
          "Doctors:",
          doctorsResponse.data
        );

        console.log(
          "Therapists:",
          therapistsResponse.data
        );

        setPatientCount(
          patientsResponse.data.data?.length ?? 0
        );

        setTherapyCount(
          therapiesResponse.data.data?.length ?? 0
        );

        setRoomCount(
          roomsResponse.data.data?.length ?? 0
        );

        setDoctorCount(
          doctorsResponse.data.data?.length ?? 0
        );

        setTherapistCount(
          therapistsResponse.data.data?.length ?? 0
        );
      } catch (error) {
        console.error(
          "Admin dashboard API error:",
          error
        );

        setError(
          "Unable to load some dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <Sidebar
        role={user?.role || "ADMIN"}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Admin Dashboard"
          subtitle="Overview of your AyurSutra clinic"
          userName={user?.fullName}
          role={user?.role}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-5 md:p-8">
          {/* Welcome */}
          <section className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#71834F]">
              Administration
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F3D2E] md:text-4xl">
              Welcome back, {user?.fullName}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667060] md:text-base">
              Here's an overview of your AyurSutra clinic
              operations and resources.
            </p>
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-[#E2C8C3] bg-[#FFF8F6] px-5 py-4 text-sm text-[#8B4A42]">
              {error}
            </div>
          )}

          {/* Statistics */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#1F3D2E]">
                Clinic Overview
              </h3>

              <p className="mt-1 text-sm text-[#7A806F]">
                Current resources and registered members
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                title="Patients"
                value={patientCount ?? 0}
                description="Registered patients"
                icon={Users}
                loading={loading}
              />

              <StatCard
                title="Doctors"
                value={doctorCount ?? 0}
                description="Registered doctors"
                icon={Stethoscope}
                loading={loading}
              />

              <StatCard
                title="Therapists"
                value={therapistCount ?? 0}
                description="Registered therapists"
                icon={HeartPulse}
                loading={loading}
              />

              <StatCard
                title="Therapies"
                value={therapyCount ?? 0}
                description="Available therapies"
                icon={Sparkles}
                loading={loading}
              />

              <StatCard
                title="Rooms"
                value={roomCount ?? 0}
                description="Registered rooms"
                icon={BedDouble}
                loading={loading}
              />
            </div>
          </section>

          {/* Quick overview */}
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#E1E4DB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                  <Activity size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-[#1F3D2E]">
                    Clinic Activity
                  </h3>

                  <p className="text-sm text-[#7A806F]">
                    Your operational overview
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#EEF0EA] pb-4">
                  <span className="text-sm text-[#667060]">
                    Active Rooms
                  </span>

                  <span className="font-semibold text-[#1F3D2E]">
                    {loading ? "..." : roomCount ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#EEF0EA] pb-4">
                  <span className="text-sm text-[#667060]">
                    Available Therapies
                  </span>

                  <span className="font-semibold text-[#1F3D2E]">
                    {loading ? "..." : therapyCount ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667060]">
                    Registered Patients
                  </span>

                  <span className="font-semibold text-[#1F3D2E]">
                    {loading ? "..." : patientCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E1E4DB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                  <Stethoscope size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-[#1F3D2E]">
                    Care Team
                  </h3>

                  <p className="text-sm text-[#7A806F]">
                    Healthcare professionals
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#EEF0EA] pb-4">
                  <span className="text-sm text-[#667060]">
                    Doctors
                  </span>

                  <span className="font-semibold text-[#1F3D2E]">
                    {loading ? "..." : doctorCount ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667060]">
                    Therapists
                  </span>

                  <span className="font-semibold text-[#1F3D2E]">
                    {loading ? "..." : therapistCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;