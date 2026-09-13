import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getAllPatients,
  type PatientResponse,
} from "../../services/doctor/doctorService";

function ReceptionistPatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllPatients();
        setPatients(data);
      } catch (err: any) {
        console.error("Failed to load patients:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load patients."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1F3D2E]">
            Patients
          </h1>

          <p className="mt-1 text-sm text-[#7A806F]">
            View and manage registered patients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/receptionist/patients/register")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F3D2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#294C3A]"
        >
          <UserPlus size={17} />
          Register Patient
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E7E4D8] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7EFE8] text-[#1F3D2E]">
              <Users size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E82]">
                Total Patients
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#1F3D2E]">
                {patients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E7E4D8] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E82]">
            Showing
          </p>

          <p className="mt-1 text-2xl font-semibold text-[#1F3D2E]">
            {filteredPatients.length}
          </p>

          <p className="mt-1 text-xs text-[#8A8E82]">
            Matching current search
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-[#E7E4D8] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92978C]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by patient name, email or phone..."
            className="w-full rounded-xl border border-[#DCD9CD] bg-[#FCFBF7] py-3 pl-11 pr-4 text-sm text-[#1F3D2E] outline-none transition placeholder:text-[#A3A69B] focus:border-[#78927F] focus:ring-2 focus:ring-[#78927F]/15"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-[#E7E4D8] bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-[#7A806F]">
            Loading patients...
          </p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-2xl border border-[#E7E4D8] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F0E8] text-[#7A806F]">
            <Users size={20} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-[#1F3D2E]">
            No patients found
          </h3>

          <p className="mt-1 text-sm text-[#7A806F]">
            Try changing your search or register a new patient.
          </p>

          {!search && (
            <button
              type="button"
              onClick={() =>
                navigate("/receptionist/patients/register")
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1F3D2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#294C3A]"
            >
              <UserPlus size={16} />
              Register First Patient
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E7E4D8] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-[#E7E4D8] bg-[#FAF9F4]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#7A806F]">
                    Patient
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#7A806F]">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#7A806F]">
                    Age
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#7A806F]">
                    Gender
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#7A806F]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEECE3]">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="transition hover:bg-[#FCFBF7]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1F3D2E]">
                          {patient.fullName}
                        </p>

                        <p className="mt-0.5 text-xs text-[#8A8E82]">
                          ID: {patient.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-[#536054]">
                        {patient.phone}
                      </p>

                      <p className="mt-0.5 text-xs text-[#8A8E82]">
                        {patient.email}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#536054]">
                      {patient.age ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#536054]">
                      {patient.gender || "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/receptionist/patients/${patient.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#DCD9CD] bg-white px-3 py-2 text-sm font-medium text-[#536054] transition hover:bg-[#F7F6F0] hover:text-[#1F3D2E]"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistPatientsPage;