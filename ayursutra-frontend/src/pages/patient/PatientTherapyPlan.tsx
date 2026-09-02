import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Stethoscope,
} from "lucide-react";

import { getMyTherapyPlans } from "../../services/therapyPlan/therapyPlanService";
import type { TherapyPlan } from "../../services/therapyPlan/therapyPlanService";

function PatientTherapyPlan() {
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyTherapyPlans();

        setPlans(data);
      } catch (err) {
        console.error("Unable to fetch therapy plans:", err);
        setError(
          "Unable to load your therapy plan. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-[#E7F1E8] text-[#2F6545]";

      case "COMPLETED":
        return "bg-[#E8EEE9] text-[#486452]";

      case "CANCELLED":
        return "bg-[#F6E8E6] text-[#8B4A42]";

      case "PLANNED":
        return "bg-[#F1F0E5] text-[#7A7442]";

      default:
        return "bg-[#F1F2ED] text-[#727A72]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F0] px-6 py-10 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="flex items-center gap-3 text-[#5E6C61]">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <span className="text-sm">
              Loading your therapy plan...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="mb-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#71834F]">
            Your Ayurvedic Care
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#173D2D] sm:text-4xl">
            My Therapy Plan
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736C] sm:text-base">
            View your personalized Panchakarma treatment plan,
            therapies, and treatment schedule.
          </p>
        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-[#E4C9C5] bg-[#FBF0EE] px-5 py-4 text-sm text-[#8B4A42]">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {!error && plans.length === 0 && (
          <section className="rounded-3xl border border-[#DDDCD3] bg-white p-8 sm:p-10">
            <div className="mx-auto max-w-xl text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">
                <FileText size={28} />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-[#173D2D]">
                No therapy plan yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#718078]">
                Your personalized Ayurvedic therapy plan will
                appear here once your doctor creates and assigns
                one to you.
              </p>

              <div className="mt-6 rounded-2xl bg-[#F7F6F0] px-5 py-4 text-left">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71834F]">
                  What happens next
                </p>

                <p className="mt-2 text-sm leading-6 text-[#68736C]">
                  Your doctor will create a treatment plan based
                  on your consultation and Ayurvedic assessment.
                  Once assigned, you will be able to view your
                  therapies and schedule here.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* THERAPY PLANS */}
        {/* ================================================= */}

        {plans.length > 0 && (
          <div className="space-y-6">

            {plans.map((plan) => (
              <section
                key={plan.id}
                className="overflow-hidden rounded-3xl border border-[#DDDCD3] bg-white"
              >

                {/* Plan Header */}

                <div className="border-b border-[#E8E8E1] p-6 sm:p-7">

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div>

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1E8] text-[#71834F]">
                          <Stethoscope size={21} />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                            Therapy Plan
                          </p>

                          <h2 className="mt-1 text-xl font-semibold text-[#173D2D] sm:text-2xl">
                            {plan.planName}
                          </h2>
                        </div>

                      </div>

                      {plan.diagnosis && (
                        <div className="mt-5">

                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71834F]">
                            Diagnosis
                          </p>

                          <p className="mt-1 text-sm text-[#68736C]">
                            {plan.diagnosis}
                          </p>

                        </div>
                      )}

                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.1em] ${getStatusStyle(
                        plan.status
                      )}`}
                    >
                      {plan.status}
                    </span>

                  </div>

                  {/* Dates */}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="flex items-center gap-3 rounded-2xl bg-[#F7F6F0] px-4 py-3">

                      <CalendarDays
                        size={19}
                        className="text-[#71834F]"
                      />

                      <div>
                        <p className="text-xs text-[#8A918A]">
                          Start Date
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-[#173D2D]">
                          {formatDate(plan.startDate)}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-[#F7F6F0] px-4 py-3">

                      <CalendarDays
                        size={19}
                        className="text-[#71834F]"
                      />

                      <div>
                        <p className="text-xs text-[#8A918A]">
                          End Date
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-[#173D2D]">
                          {formatDate(plan.endDate)}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Therapies */}

                <div className="p-6 sm:p-7">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71834F]">
                        Treatment Schedule
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-[#173D2D]">
                        Planned Therapies
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#F1F2ED] px-3 py-1 text-xs font-medium text-[#68736C]">
                      {plan.therapies.length}{" "}
                      {plan.therapies.length === 1
                        ? "therapy"
                        : "therapies"}
                    </span>

                  </div>

                  {plan.therapies.length === 0 ? (
                    <div className="rounded-2xl bg-[#F7F6F0] px-5 py-6 text-center">
                      <p className="text-sm text-[#718078]">
                        No therapies have been added to this plan
                        yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {plan.therapies
                        .sort(
                          (a, b) =>
                            a.day - b.day ||
                            a.sequenceOrder -
                              b.sequenceOrder
                        )
                        .map((therapy, index) => (
                          <div
                            key={`${therapy.therapyId}-${therapy.day}-${index}`}
                            className="rounded-2xl border border-[#E3E4DC] bg-[#FCFCF9] p-4 sm:p-5"
                          >

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                              <div className="flex items-start gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1E8] text-sm font-semibold text-[#71834F]">
                                  {therapy.day}
                                </div>

                                <div>
                                  <p className="text-xs uppercase tracking-[0.12em] text-[#8A918A]">
                                    Day {therapy.day}
                                  </p>

                                  <h4 className="mt-1 text-base font-semibold text-[#173D2D]">
                                    {therapy.therapyName}
                                  </h4>

                                  <p className="mt-1 text-xs text-[#7A827C]">
                                    Sequence{" "}
                                    {therapy.sequenceOrder}
                                  </p>
                                </div>

                              </div>

                              <div className="flex items-center gap-2 text-sm text-[#68736C]">

                                <Clock3
                                  size={17}
                                  className="text-[#71834F]"
                                />

                                <span>
                                  {therapy.durationMinutes}{" "}
                                  minutes
                                </span>

                              </div>

                            </div>

                          </div>
                        ))}

                    </div>
                  )}

                </div>

              </section>
            ))}

          </div>
        )}

        {/* ================================================= */}
        {/* FOOTER NOTE */}
        {/* ================================================= */}

        {plans.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#EEF1E8] px-5 py-4">

            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-[#71834F]"
            />

            <p className="text-sm leading-6 text-[#5F6D64]">
              Your therapy plan is personalized by your care
              team. Follow the recommended schedule and consult
              your doctor if you have any concerns about your
              treatment.
            </p>

          </div>
        )}

      </main>
    </div>
  );
}

export default PatientTherapyPlan;