import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import relaxingWater from "./audio/relaxing-water.mp3";
import heroRiver from "./images/hero-river2.jpg";
import ayurvedicHerbs from "./images/ayurvedic-herbs.jpg";
import meditation from "./images/meditation.jpg";
import panchakarmaTreatment from "./images/panchakarma-treatment.jpg";
import doctorConsultation from "./images/ayursutra-doctor-consultation.png";
import therapistPatient from "./images/ayursutra-therapist-patient.jpg";
import wellnessRetreat from "./images/ayurvedic-wellness-retreat.jpg";
import wellnessBackwaters from "./images/wellness-cta-backwaters.jpg";

// Additional Ayurvedic / nature visuals
import abhyanga from "./images/abhyanga.jpg";
import heroRiverOne from "./images/hero-river.png";
import medicinalHerbsNaturalGarden from "./images/medicinal-herbs-natural-garden.jpg";
import panchakarma from "./images/panchakarma.jpg";
import shirodhara from "./images/shirodhara.jpg";


function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.35;

    return () => {
      audio.pause();
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Unable to play audio:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">

      {/* ========================================================= */}
      {/* AUDIO */}
      {/* ========================================================= */}

      <audio
        ref={audioRef}
        src={relaxingWater}
        preload="auto"
      />

      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-[#F7F6F0]/90 backdrop-blur-md">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo */}

          <a
            href="#home"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#71834F] text-[#71834F]">
              <span className="text-lg">A</span>
            </div>

            <div>
              <p className="text-lg font-semibold tracking-[0.18em] text-[#173D2D]">
                AYURSUTRA
              </p>

              <p className="text-[10px] uppercase tracking-[0.25em] text-[#71834F]">
                Panchakarma & Wellness
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-8 md:flex">

            <a
              href="#home"
              className="text-sm font-medium text-[#173D2D] transition hover:text-[#71834F]"
            >
              Home
            </a>

            <a
              href="#panchakarma"
              className="text-sm font-medium text-[#173D2D] transition hover:text-[#71834F]"
            >
              Panchakarma
            </a>

            <a
              href="#therapies"
              className="text-sm font-medium text-[#173D2D] transition hover:text-[#71834F]"
            >
              Therapies
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-[#173D2D] transition hover:text-[#71834F]"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-[#173D2D] transition hover:text-[#71834F]"
            >
              Contact
            </a>

          </nav>

          {/* Desktop Actions */}

          <div className="hidden items-center gap-3 md:flex">

            <Link
              to="/login"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-[#173D2D] transition hover:bg-[#E7EBDD]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-[#173D2D] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#24513D]"
            >
              Register
            </Link>

          </div>

          {/* Mobile Menu Button */}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-[#D7D9CE] px-3 py-2 text-[#173D2D] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Mobile Navigation */}

        {mobileMenuOpen && (
          <div className="border-t border-[#E1E2D8] bg-[#F7F6F0] px-6 py-5 md:hidden">

            <nav className="flex flex-col gap-4">

              <a
                href="#home"
                onClick={closeMobileMenu}
                className="text-sm font-medium"
              >
                Home
              </a>

              <a
                href="#panchakarma"
                onClick={closeMobileMenu}
                className="text-sm font-medium"
              >
                Panchakarma
              </a>

              <a
                href="#therapies"
                onClick={closeMobileMenu}
                className="text-sm font-medium"
              >
                Therapies
              </a>

              <a
                href="#about"
                onClick={closeMobileMenu}
                className="text-sm font-medium"
              >
                About
              </a>

              <a
                href="#contact"
                onClick={closeMobileMenu}
                className="text-sm font-medium"
              >
                Contact
              </a>

              <div className="mt-2 flex gap-3 border-t border-[#E1E2D8] pt-4">

                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex-1 rounded-full border border-[#173D2D] px-4 py-2.5 text-center text-sm font-medium"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex-1 rounded-full bg-[#173D2D] px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Register
                </Link>

              </div>

            </nav>

          </div>
        )}

      </header>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <main>

        <section
          id="home"
          className="relative flex min-h-screen items-center overflow-hidden"
        >

          {/* Hero Image */}

          <div className="absolute inset-0">

            <img
              src={heroRiver}
              alt="Peaceful river surrounded by lush greenery"
              className="h-full w-full object-cover"
            />

            {/* Overlay */}

            <div className="absolute inset-0 bg-gradient-to-r from-[#071B13]/90 via-[#102B20]/65 to-[#102B20]/20" />

          </div>

          {/* Hero Content */}

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-32 lg:px-10">

            <div className="max-w-2xl">

              <p className="mb-5 text-sm font-medium uppercase tracking-[0.35em] text-[#D9D7A6]">
                Ayurvedic Healing • Panchakarma • Wellness
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Return to your
                <span className="block text-[#D9D7A6]">
                  natural balance.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
                Discover the timeless wisdom of Panchakarma through
                personalized Ayurvedic care, thoughtful therapy planning,
                and a journey designed around your well-being.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <a
                  href="#panchakarma"
                  className="rounded-full bg-[#E6E4B4] px-7 py-3.5 text-center text-sm font-semibold text-[#173D2D] transition hover:bg-white"
                >
                  Explore Panchakarma
                </a>

                <Link
                  to="/login"
                  className="rounded-full border border-white/60 bg-white/10 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#173D2D]"
                >
                  Begin Your Journey
                </Link>

              </div>

            </div>

          </div>

          {/* Scroll indicator */}

          <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex">

            <span className="text-[10px] uppercase tracking-[0.3em]">
              Explore
            </span>

            <div className="h-10 w-px bg-white/50" />

          </div>

        </section>

        {/* ======================================================= */}
        {/* PANCHAKARMA INTRODUCTION */}
        {/* ======================================================= */}

        <section
          id="panchakarma"
          className="px-6 py-24 lg:px-10 lg:py-32"
        >

          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">

            {/* Image */}

            <div className="relative">

              <div className="overflow-hidden rounded-[2rem]">

                <img
                  src={ayurvedicHerbs}
                  alt="Ayurvedic herbs and traditional ingredients"
                  className="h-[520px] w-full object-cover"
                />

              </div>

              <div className="absolute -bottom-7 -right-5 hidden rounded-2xl bg-[#173D2D] px-7 py-5 text-white shadow-xl sm:block">

                <p className="text-2xl font-semibold">
                  5
                </p>

                <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                  Classical actions
                </p>

              </div>

            </div>

            {/* Text */}

            <div>

              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#71834F]">
                The Ayurvedic way
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#173D2D] sm:text-5xl">
                What is
                <span className="block text-[#71834F]">
                  Panchakarma?
                </span>
              </h2>

              <p className="mt-6 text-base leading-8 text-[#59665C]">
                Panchakarma is a classical Ayurvedic approach centered on
                carefully planned therapeutic procedures. Traditionally,
                it is designed according to an individual's condition,
                constitution, and therapeutic needs.
              </p>

              <p className="mt-5 text-base leading-8 text-[#59665C]">
                AyurSutra brings this traditional process into a structured
                digital environment where practitioners can plan therapies,
                organize sessions, coordinate resources, and follow patient
                progress throughout the care journey.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <span className="rounded-full bg-[#E8EBDD] px-4 py-2 text-xs font-medium text-[#4D613D]">
                  Personalized care
                </span>

                <span className="rounded-full bg-[#E8EBDD] px-4 py-2 text-xs font-medium text-[#4D613D]">
                  Structured therapies
                </span>

                <span className="rounded-full bg-[#E8EBDD] px-4 py-2 text-xs font-medium text-[#4D613D]">
                  Progress tracking
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* FIVE PANCHAKARMA */}
        {/* ======================================================= */}

        <section
          id="therapies"
          className="bg-[#EDEFE5] px-6 py-24 lg:px-10 lg:py-32"
        >

          <div className="mx-auto max-w-7xl">

            <div className="max-w-2xl">

              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#71834F]">
                Traditional therapies
              </p>

              <h2 className="mt-4 text-4xl font-semibold text-[#173D2D] sm:text-5xl">
                The five classical
                <span className="text-[#71834F]"> Panchakarma actions</span>
              </h2>

              <p className="mt-5 leading-8 text-[#59665C]">
                Panchakarma traditionally encompasses five therapeutic
                actions. Their application is individualized and should
                be determined by a qualified Ayurvedic practitioner.
              </p>

            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

              {[
                {
                  number: "01",
                  name: "Vamana",
                  description:
                    "A classical therapeutic procedure traditionally associated with controlled therapeutic emesis.",
                },
                {
                  number: "02",
                  name: "Virechana",
                  description:
                    "A classical therapeutic procedure traditionally associated with therapeutic purgation.",
                },
                {
                  number: "03",
                  name: "Basti",
                  description:
                    "A traditional Ayurvedic procedure involving medicated preparations administered through the rectal route.",
                },
                {
                  number: "04",
                  name: "Nasya",
                  description:
                    "A traditional therapy involving the administration of selected preparations through the nasal route.",
                },
                {
                  number: "05",
                  name: "Raktamokshana",
                  description:
                    "A classical procedure traditionally involving therapeutic bloodletting in selected cases.",
                },
              ].map((therapy) => (
                <div
                  key={therapy.number}
                  className="group rounded-[1.5rem] border border-[#DCE0D3] bg-[#F8F8F3] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold tracking-[0.2em] text-[#8B9877]">
                      {therapy.number}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E9DB] text-sm text-[#4E633E]">
                      ✦
                    </span>

                  </div>

                  <h3 className="mt-8 text-xl font-semibold text-[#173D2D]">
                    {therapy.name}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#667168]">
                    {therapy.description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* AYURVEDIC EXPERIENCES */}
        {/* ======================================================= */}

        <section className="bg-[#F7F6F0] px-6 py-24 lg:px-10 lg:py-32">

          <div className="mx-auto max-w-7xl">

            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#71834F]">
                Ayurvedic experiences
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#173D2D] sm:text-5xl">
                Tradition expressed through
                <span className="block text-[#71834F]">
                  thoughtful therapies.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl leading-8 text-[#59665C]">
                Explore some of the traditional practices and natural elements
                that shape the Ayurvedic wellness experience at AyurSutra.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {[
                {
                  image: abhyanga,
                  eyebrow: "Abhyanga",
                  title: "Oil-based Ayurvedic care",
                  text: "A traditional wellness practice centered around warm herbal oils and a calm therapeutic setting.",
                  alt: "Ayurvedic Abhyanga oil therapy",
                },
                {
                  image: shirodhara,
                  eyebrow: "Shirodhara",
                  title: "A deeply calming ritual",
                  text: "A traditional Ayurvedic practice known for its gentle, continuous oil-flow experience.",
                  alt: "Traditional Shirodhara Ayurvedic therapy",
                },
                {
                  image: panchakarma,
                  eyebrow: "Panchakarma",
                  title: "A structured care journey",
                  text: "A carefully planned Ayurvedic approach where therapies are selected according to individual needs.",
                  alt: "Ayurvedic Panchakarma wellness setting",
                },
                {
                  image: medicinalHerbsNaturalGarden,
                  eyebrow: "Herbal traditions",
                  title: "Nature at the heart of care",
                  text: "Ayurvedic wellness draws on traditional herbs, plants and natural ingredients as part of its heritage.",
                  alt: "Medicinal herbs in a natural Ayurvedic garden",
                },
              ].map((item) => (
                <article
                  key={item.eyebrow}
                  className="group overflow-hidden rounded-[1.75rem] border border-[#DCE0D3] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#71834F]">
                      {item.eyebrow}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-[#173D2D]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#667168]">
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}

            </div>

            <div className="relative mt-6 overflow-hidden rounded-[2rem]">

              <img
                src={heroRiverOne}
                alt="Peaceful river surrounded by tropical greenery"
                className="h-[360px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#071B13]/80 via-[#102B20]/45 to-transparent" />

              <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                <div className="max-w-xl text-white">
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D9D7A6]">
                    The Ayurvedic environment
                  </p>

                  <h3 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                    Wellness begins with
                    <span className="block text-[#D9D7A6]">
                      a peaceful space.
                    </span>
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                    A calm natural environment can complement a thoughtful
                    wellness journey, creating space to pause, reconnect and
                    focus on care.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* WELLNESS IMAGE SECTION */}
        {/* ======================================================= */}

        <section
          id="about"
          className="px-6 py-24 lg:px-10 lg:py-32"
        >

          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

            <div>

              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#71834F]">
                Beyond treatment
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#173D2D] sm:text-5xl">
                Healing is a
                <span className="block text-[#71834F]">
                  journey, not a moment.
                </span>
              </h2>

              <p className="mt-6 leading-8 text-[#59665C]">
                AyurSutra connects traditional Ayurvedic care with a
                structured patient journey. From consultation and therapy
                planning to scheduled sessions and progress assessment,
                every stage can be organized in one place.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Personalized",
                    text: "Care plans can be organized around each patient's needs.",
                  },
                  {
                    title: "Connected",
                    text: "Doctors, therapists and support staff work with shared information.",
                  },
                  {
                    title: "Trackable",
                    text: "Therapy sessions and patient progress can be followed over time.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4"
                  >

                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4E9DB] text-sm text-[#4E633E]">
                      ✓
                    </div>

                    <div>

                      <h3 className="font-semibold text-[#173D2D]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#667168]">
                        {item.text}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

            </div>

            <div className="relative overflow-hidden rounded-[2rem]">

              <img
                src={meditation}
                alt="Peaceful meditation in nature"
                className="h-[600px] w-full object-cover"
              />

              <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-[#173D2D]/85 p-6 text-white backdrop-blur-md">

                <p className="text-xs uppercase tracking-[0.25em] text-[#D9D7A6]">
                  AyurSutra philosophy
                </p>

                <p className="mt-2 text-lg leading-7">
                  A thoughtful approach to traditional care, supported by
                  modern organization.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* HOW IT WORKS */}
        {/* ======================================================= */}

        <section className="bg-[#173D2D] px-6 py-24 text-white lg:px-10 lg:py-32">

          <div className="mx-auto max-w-7xl">

            <div className="max-w-2xl">

              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#D9D7A6]">
                Your journey
              </p>

              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
                A simpler path to
                <span className="block text-[#D9D7A6]">
                  organized Ayurvedic care.
                </span>
              </h2>

            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-4">

              {[
                {
                  number: "01",
                  title: "Consult",
                  text: "Begin with an Ayurvedic consultation and understand your care needs.",
                },
                {
                  number: "02",
                  title: "Plan",
                  text: "Create a structured therapy plan based on the practitioner's recommendations.",
                },
                {
                  number: "03",
                  title: "Schedule",
                  text: "Organize therapy sessions, therapists, rooms and treatment sequences.",
                },
                {
                  number: "04",
                  title: "Progress",
                  text: "Record observations and follow the patient's journey throughout treatment.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-7"
                >

                  <span className="text-xs font-semibold tracking-[0.2em] text-[#D9D7A6]">
                    {step.number}
                  </span>

                  <h3 className="mt-7 text-xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/65">
                    {step.text}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* THERAPY / CARE IMAGE */}
        {/* ======================================================= */}

        <section className="px-6 py-24 lg:px-10 lg:py-32">

          <div className="mx-auto max-w-7xl">

            <div className="grid overflow-hidden rounded-[2rem] bg-[#EDEFE5] lg:grid-cols-2">

              <div className="relative min-h-[420px]">

                <img
                  src={panchakarmaTreatment}
                  alt="Ayurvedic Panchakarma treatment"
                  className="absolute inset-0 h-full w-full object-cover"
                />

              </div>

              <div className="flex items-center p-9 sm:p-14 lg:p-16">

                <div>

                  <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#71834F]">
                    Thoughtful care
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#173D2D] sm:text-4xl">
                    Traditional wisdom,
                    <span className="block text-[#71834F]">
                      thoughtfully organized.
                    </span>
                  </h2>

                  <p className="mt-6 leading-8 text-[#59665C]">
                    AyurSutra is designed to help Panchakarma centres
                    coordinate patients, practitioners, therapies, rooms,
                    equipment and multi-day treatment schedules in a
                    structured environment.
                  </p>

                  <a
                    href="#contact"
                    className="mt-8 inline-flex rounded-full bg-[#173D2D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24513D]"
                  >
                    Learn More
                  </a>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* CARE TEAM */}
        {/* ======================================================= */}

        <section className="bg-[#F0EFE7] px-6 py-24 lg:px-10 lg:py-32">

          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">

            <div className="overflow-hidden rounded-[1.75rem] bg-white">

              <img
                src={doctorConsultation}
                alt="Ayurvedic doctor consulting with a patient"
                className="h-80 w-full object-cover"
              />

              <div className="p-6">

                <p className="text-xs uppercase tracking-[0.2em] text-[#71834F]">
                  Consultation
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#173D2D]">
                  Practitioner-led care
                </h3>

              </div>

            </div>

            <div className="overflow-hidden rounded-[1.75rem] bg-white">

              <img
                src={therapistPatient}
                alt="Therapist providing patient care"
                className="h-80 w-full object-cover"
              />

              <div className="p-6">

                <p className="text-xs uppercase tracking-[0.2em] text-[#71834F]">
                  Therapy
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#173D2D]">
                  Coordinated treatment
                </h3>

              </div>

            </div>

            <div className="overflow-hidden rounded-[1.75rem] bg-white">

              <img
                src={wellnessRetreat}
                alt="Peaceful Ayurvedic wellness environment"
                className="h-80 w-full object-cover"
              />

              <div className="p-6">

                <p className="text-xs uppercase tracking-[0.2em] text-[#71834F]">
                  Wellness
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#173D2D]">
                  A calming environment
                </h3>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================= */}
        {/* AUDIO / PEACEFUL SECTION */}
        {/* ======================================================= */}

        <section className="relative overflow-hidden">

          <div className="absolute inset-0">

            <img
              src={wellnessBackwaters}
              alt=""
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#102B20]/70" />

          </div>

          <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">

            <p className="text-sm font-medium uppercase tracking-[0.35em] text-[#D9D7A6]">
              Pause. Breathe. Reconnect.
            </p>

            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Take a moment for
              <span className="block text-[#D9D7A6]">
                yourself.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-white/80">
              Let the sound of flowing water create a gentle atmosphere
              while you explore the AyurSutra approach to wellness.
            </p>

            <button
              type="button"
              onClick={toggleAudio}
              className="mt-9 flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#173D2D] transition hover:bg-[#E6E4B4]"
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4E9DB]">
                {isPlaying ? "❚❚" : "▶"}
              </span>

              {isPlaying ? "Pause Relaxing Sound" : "Play Relaxing Sound"}

            </button>

          </div>

        </section>

        {/* ======================================================= */}
        {/* CTA */}
        {/* ======================================================= */}

        <section
          id="contact"
          className="px-6 py-24 lg:px-10 lg:py-32"
        >

          <div className="mx-auto max-w-5xl text-center">

            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#71834F]">
              Begin your journey
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#173D2D] sm:text-5xl lg:text-6xl">
              Discover a more
              <span className="block text-[#71834F]">
                balanced approach to care.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-8 text-[#59665C]">
              Explore Panchakarma, learn about Ayurvedic therapies, and
              connect with an organized care journey through AyurSutra.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/login"
                className="rounded-full bg-[#173D2D] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#24513D]"
              >
                Login to AyurSutra
              </Link>

              <a
                href="#panchakarma"
                className="rounded-full border border-[#AEB6A2] px-8 py-3.5 text-sm font-semibold text-[#173D2D] transition hover:bg-[#E8EBDD]"
              >
                Explore Panchakarma
              </a>

            </div>

          </div>

        </section>

      </main>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="border-t border-[#DCDDD3] bg-[#EEF0E8]">

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 lg:px-10">

          <div>

            <p className="text-lg font-semibold tracking-[0.18em] text-[#173D2D]">
              AYURSUTRA
            </p>

            <p className="mt-4 max-w-sm text-sm leading-7 text-[#667168]">
              An intelligent patient management and therapy scheduling
              platform inspired by the principles of Ayurvedic care.
            </p>

          </div>

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#173D2D]">
              Explore
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#667168]">

              <a
                href="#panchakarma"
                className="hover:text-[#71834F]"
              >
                Panchakarma
              </a>

              <a
                href="#therapies"
                className="hover:text-[#71834F]"
              >
                Therapies
              </a>

              <a
                href="#about"
                className="hover:text-[#71834F]"
              >
                About AyurSutra
              </a>

              <a
                href="#contact"
                className="hover:text-[#71834F]"
              >
                Contact
              </a>

            </div>

          </div>

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#173D2D]">
              Account
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#667168]">

              <Link
                to="/login"
                className="hover:text-[#71834F]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="hover:text-[#71834F]"
              >
                Register
              </Link>

            </div>

          </div>

        </div>

        <div className="border-t border-[#DCDDD3] px-6 py-5">

          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-[#7B8279] sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} AyurSutra. All rights reserved.
            </p>

            <p>
              Traditional wisdom • Modern organization
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default HomePage;