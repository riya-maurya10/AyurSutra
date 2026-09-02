import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Loader2,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";

import apiClient from "../../services/api/client";

// =============================================================
// API RESPONSE
// =============================================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================================
// PATIENT PROFILE
// =============================================================

interface PatientProfile {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

// =============================================================
// PATIENT PROGRESS
// =============================================================

interface PatientProgress {
  id: string;
  patientId: string;
  therapyPlanId: string;
  assessmentDate: string;
  dayNumber: number;
  symptoms?: string;
  observations?: string;
  improvementPercentage?: number;
  therapyResponse?: string;
  practitionerNotes?: string;
  nextRecommendation?: string;
}

// =============================================================
// FILTER
// =============================================================

type FilterType = "ALL" | "LATEST";

// =============================================================
// COMPONENT
// =============================================================

const PatientProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<PatientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");

  // ===========================================================
  // FETCH LOGGED-IN PATIENT + PROGRESS
  // ===========================================================

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError("");

        // =====================================================
        // 1. GET THE ACTUAL LOGGED-IN PATIENT
        // =====================================================

        console.log("Fetching logged-in patient profile...");

        const profileResponse =
          await apiClient.get<ApiResponse<PatientProfile>>(
            "/patients/me"
          );

        console.log(
          "Patient profile response:",
          profileResponse.data
        );

        const patientId =
          profileResponse.data.data?.id;

        console.log(
          "Logged-in patient ID:",
          patientId
        );

        if (!patientId) {
          throw new Error(
            "Unable to determine the logged-in patient."
          );
        }

        // =====================================================
        // 2. FETCH PROGRESS USING THAT PATIENT ID
        // =====================================================

        console.log(
          "Fetching progress for patient:",
          patientId
        );

        const response =
          await apiClient.get<
            ApiResponse<PatientProgress[]>
          >(
            `/patient-progress/patient/${patientId}`
          );

        console.log(
          "Patient progress response:",
          response.data
        );

        // =====================================================
        // 3. SET PROGRESS
        // =====================================================

        if (response.data.success) {
          setProgress(
            response.data.data || []
          );
        } else {
          setError(
            response.data.message ||
              "Unable to fetch patient progress."
          );
        }
      } catch (err: any) {
        console.error(
          "Unable to fetch patient progress:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your progress."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // ===========================================================
  // SORT PROGRESS BY ASSESSMENT DATE
  // ===========================================================

  const sortedProgress = useMemo(() => {
    return [...progress].sort((a, b) => {
      const dateDifference =
        new Date(b.assessmentDate).getTime() -
        new Date(a.assessmentDate).getTime();

      // If dates are identical, sort by day number.
      if (dateDifference === 0) {
        return b.dayNumber - a.dayNumber;
      }

      return dateDifference;
    });
  }, [progress]);

  // ===========================================================
  // FILTER
  // ===========================================================

  const displayedProgress = useMemo(() => {
    if (filter === "LATEST") {
      return sortedProgress.slice(0, 1);
    }

    return sortedProgress;
  }, [filter, sortedProgress]);

  // ===========================================================
  // STATISTICS
  // ===========================================================

  const latestProgress = sortedProgress[0];

  const averageImprovement =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum +
              (item.improvementPercentage || 0),
            0
          ) / progress.length
        )
      : 0;

  const maximumImprovement =
    progress.length > 0
      ? Math.max(
          ...progress.map(
            (item) =>
              item.improvementPercentage || 0
          )
        )
      : 0;

  // ===========================================================
  // DATE FORMATTING
  // ===========================================================

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===========================================================
  // IMPROVEMENT LABEL
  // ===========================================================

  const getImprovementLabel = (
    percentage?: number
  ) => {
    if (
      percentage === undefined ||
      percentage === null
    ) {
      return "Not recorded";
    }

    if (percentage >= 75) {
      return "Excellent progress";
    }

    if (percentage >= 50) {
      return "Good progress";
    }

    if (percentage >= 25) {
      return "Steady progress";
    }

    return "Early progress";
  };

  // ===========================================================
  // LOADING STATE
  // ===========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#F8F6F0]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#71834F]">
              YOUR AYURVEDIC CARE
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#123C2E]">
              My Progress
            </h1>

            <p className="mt-3 text-base text-[#65716A]">
              Track your healing journey and treatment progress.
            </p>
          </div>

          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-[#D9DDCE] bg-white">
            <div className="flex flex-col items-center gap-3 text-[#71834F]">
              <Loader2
                size={30}
                className="animate-spin"
              />

              <p className="text-sm">
                Loading your progress...
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ===========================================================
  // ERROR STATE
  // ===========================================================

  if (error) {
    return (
      <div className="min-h-full bg-[#F8F6F0]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#71834F]">
              YOUR AYURVEDIC CARE
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#123C2E]">
              My Progress
            </h1>

            <p className="mt-3 text-base text-[#65716A]">
              Track your healing journey and treatment progress.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E3D5CF] bg-white p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5E9E7] text-[#8B4A42]">
              <Activity size={26} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#123C2E]">
              Unable to load your progress
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#65716A]">
              {error}
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ===========================================================
  // EMPTY STATE
  // ===========================================================

  if (progress.length === 0) {
    return (
      <div className="min-h-full bg-[#F8F6F0]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#71834F]">
              YOUR AYURVEDIC CARE
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#123C2E]">
              My Progress
            </h1>

            <p className="mt-3 text-base text-[#65716A]">
              Track your healing journey and treatment progress.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D9DDCE] bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF2E7] text-[#71834F]">
              <TrendingUp size={30} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-[#123C2E]">
              Your progress will appear here
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#65716A]">
              Your practitioner will record assessments
              throughout your Panchakarma treatment.
              Once an assessment is added, you will be
              able to view your symptoms, observations,
              improvement, treatment response, and
              recommendations here.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ===========================================================
  // MAIN PAGE
  // ===========================================================

  return (
    <div className="min-h-full bg-[#F8F6F0]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10">

          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#71834F]">
            YOUR AYURVEDIC CARE
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#123C2E]">
            My Progress
          </h1>

          <p className="mt-3 text-base text-[#65716A]">
            Follow your healing journey and treatment progress.
          </p>

        </div>

        {/* ================================================= */}
        {/* SUMMARY CARDS */}
        {/* ================================================= */}

        <div className="grid gap-5 md:grid-cols-3">

          {/* Assessments */}

          <div className="rounded-3xl border border-[#D9DDCE] bg-white p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-[#8A927B]">
                  ASSESSMENTS
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#123C2E]">
                  {progress.length}
                </p>

                <p className="mt-1 text-sm text-[#65716A]">
                  Progress assessments
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF2E7] text-[#71834F]">
                <ClipboardCheck size={23} />
              </div>

            </div>

          </div>

          {/* Average improvement */}

          <div className="rounded-3xl border border-[#D9DDCE] bg-white p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-[#8A927B]">
                  AVERAGE IMPROVEMENT
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#123C2E]">
                  {averageImprovement}%
                </p>

                <p className="mt-1 text-sm text-[#65716A]">
                  Across recorded assessments
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF2E7] text-[#71834F]">
                <TrendingUp size={23} />
              </div>

            </div>

          </div>

          {/* Latest improvement */}

          <div className="rounded-3xl border border-[#D9DDCE] bg-white p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-[#8A927B]">
                  LATEST IMPROVEMENT
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#123C2E]">
                  {latestProgress?.improvementPercentage ??
                    maximumImprovement}
                  %
                </p>

                <p className="mt-1 text-sm text-[#65716A]">
                  Most recent assessment
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF2E7] text-[#71834F]">
                <HeartPulse size={23} />
              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <div className="mt-10 flex items-center gap-3">

          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              filter === "ALL"
                ? "border-[#1F3D2E] bg-[#1F3D2E] text-white"
                : "border-[#D9DDCE] bg-white text-[#4D5C4B] hover:border-[#71834F]"
            }`}
          >
            All Assessments
          </button>

          <button
            type="button"
            onClick={() => setFilter("LATEST")}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              filter === "LATEST"
                ? "border-[#1F3D2E] bg-[#1F3D2E] text-white"
                : "border-[#D9DDCE] bg-white text-[#4D5C4B] hover:border-[#71834F]"
            }`}
          >
            Latest
          </button>

        </div>

        {/* ================================================= */}
        {/* PROGRESS TIMELINE */}
        {/* ================================================= */}

        <div className="mt-6 rounded-3xl border border-[#D9DDCE] bg-white">

          <div className="border-b border-[#E6E8DF] px-7 py-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.22em] text-[#71834F]">
                  TREATMENT JOURNEY
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#123C2E]">
                  Progress Assessments
                </h2>

              </div>

              <div className="hidden items-center gap-2 rounded-full bg-[#EDF2E7] px-4 py-2 text-sm text-[#526645] sm:flex">
                <Activity size={16} />

                {progress.length}{" "}
                {progress.length === 1
                  ? "assessment"
                  : "assessments"}
              </div>

            </div>

          </div>

          <div className="divide-y divide-[#E6E8DF]">

            {displayedProgress.map((item, index) => {

              const improvement =
                item.improvementPercentage;

              return (
                <div
                  key={item.id}
                  className="px-7 py-7"
                >

                  {/* ===================================== */}
                  {/* ASSESSMENT HEADER */}
                  {/* ===================================== */}

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="flex gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDF2E7] text-[#71834F]">
                        <CalendarDays size={22} />
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-xl font-semibold text-[#123C2E]">
                            Day {item.dayNumber}
                          </h3>

                          {index === 0 && (
                            <span className="rounded-full bg-[#EDF2E7] px-3 py-1 text-xs font-medium text-[#526645]">
                              Latest
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-sm text-[#65716A]">
                          Assessment on{" "}
                          {formatDate(
                            item.assessmentDate
                          )}
                        </p>

                      </div>

                    </div>

                    {/* Improvement */}

                    <div className="min-w-[190px] rounded-2xl bg-[#F5F6F0] px-5 py-4">

                      <div className="flex items-center justify-between">

                        <span className="text-xs uppercase tracking-[0.15em] text-[#8A927B]">
                          Improvement
                        </span>

                        <TrendingUp
                          size={17}
                          className="text-[#71834F]"
                        />

                      </div>

                      <div className="mt-2 flex items-end justify-between">

                        <span className="text-2xl font-semibold text-[#123C2E]">
                          {improvement ?? "—"}
                          {improvement !== undefined &&
                          improvement !== null
                            ? "%"
                            : ""}
                        </span>

                        {improvement !==
                          undefined &&
                          improvement !== null && (
                            <span className="text-xs text-[#71834F]">
                              {getImprovementLabel(
                                improvement
                              )}
                            </span>
                          )}

                      </div>

                      {improvement !==
                        undefined &&
                        improvement !== null && (
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#DDE3D5]">

                            <div
                              className="h-full rounded-full bg-[#71834F] transition-all"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    improvement,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />

                          </div>
                        )}

                    </div>

                  </div>

                  {/* ===================================== */}
                  {/* DETAILS */}
                  {/* ===================================== */}

                  <div className="mt-7 grid gap-5 lg:grid-cols-2">

                    {/* Symptoms */}

                    <div className="rounded-2xl bg-[#F8F6F0] p-5">

                      <div className="flex items-center gap-2">

                        <Activity
                          size={18}
                          className="text-[#71834F]"
                        />

                        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#526645]">
                          Symptoms
                        </h4>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#53635A]">
                        {item.symptoms ||
                          "No symptoms recorded."}
                      </p>

                    </div>

                    {/* Observations */}

                    <div className="rounded-2xl bg-[#F8F6F0] p-5">

                      <div className="flex items-center gap-2">

                        <FileText
                          size={18}
                          className="text-[#71834F]"
                        />

                        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#526645]">
                          Observations
                        </h4>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#53635A]">
                        {item.observations ||
                          "No observations recorded."}
                      </p>

                    </div>

                    {/* Therapy Response */}

                    <div className="rounded-2xl bg-[#F8F6F0] p-5">

                      <div className="flex items-center gap-2">

                        <HeartPulse
                          size={18}
                          className="text-[#71834F]"
                        />

                        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#526645]">
                          Therapy Response
                        </h4>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#53635A]">
                        {item.therapyResponse ||
                          "No therapy response recorded."}
                      </p>

                    </div>

                    {/* Practitioner Notes */}

                    <div className="rounded-2xl bg-[#F8F6F0] p-5">

                      <div className="flex items-center gap-2">

                        <MessageSquareText
                          size={18}
                          className="text-[#71834F]"
                        />

                        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#526645]">
                          Practitioner Notes
                        </h4>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#53635A]">
                        {item.practitionerNotes ||
                          "No practitioner notes recorded."}
                      </p>

                    </div>

                  </div>

                  {/* ===================================== */}
                  {/* NEXT RECOMMENDATION */}
                  {/* ===================================== */}

                  <div className="mt-5 rounded-2xl border border-[#D9DDCE] bg-white p-5">

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={18}
                        className="text-[#71834F]"
                      />

                      <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#526645]">
                        Next Recommendation
                      </h4>

                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#53635A]">
                      {item.nextRecommendation ||
                        "No recommendation recorded."}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientProgressPage;