import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

export default function Home() {
  return (
    <div className="bg-paper text-ink-900">
      <LandingNav />

      <main className="relative">
        <Hero />
        <SplitStatsToolkit />
        <SplitTestimonialsVisual />
        <HowItWorks />
        <BetaBanner />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------------------------- NAV ---------------------------- */

/* ---------------------------- HERO ---------------------------- */

function Hero() {
  return (
    <section
      className="relative flex h-screen min-h-[640px] w-full flex-col justify-center pt-20"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(28,28,23,0.3), rgba(28,28,23,0.6)), url('https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      <div className="relative mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="max-w-3xl text-left">
          <h1 className="font-serif-warm mb-6 text-5xl leading-tight text-white md:text-6xl">
            Nurturing India&apos;s <br />
            brightest minds.{" "}
            <span className="text-primary-200 italic">From step one</span> to
            your <br />
            dream career.
          </h1>
          <p className="font-serif-warm mb-10 text-2xl italic text-coral-100">
            Compassionate mentoring · Stress-free tests · Supportive community…
          </p>
          <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="font-sans-rounded group inline-flex items-center justify-center gap-2 rounded-full bg-coral-accent px-8 py-4 font-bold text-white shadow-xl transition-all hover:opacity-95 active:scale-95"
            >
              Begin your journey
              <span
                className="material-symbols-outlined transition-transform group-hover:scale-110"
                style={{ fontSize: "20px" }}
              >
                favorite
              </span>
            </Link>
            <Link
              href="#mentors"
              className="font-sans-rounded group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white"
            >
              Meet our Mentors
              <span
                className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                style={{ fontSize: "18px" }}
              >
                arrow_right_alt
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stage strip floating bottom */}
      <div className="relative z-10 mt-auto w-full border-t border-white/20 bg-white/10 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 overflow-x-auto whitespace-nowrap px-6 md:px-8">
          <StageTab label="Foundation" active />
          <StageTab label="Middle Years" />
          <StageTab label="Senior School" />
          <StageTab label="Undergrad" />
          <StageTab label="Graduate Life" />
        </div>
      </div>
    </section>
  );
}

function StageTab({
  label,
  active,
}: Readonly<{ label: string; active?: boolean }>) {
  if (active) {
    return (
      <button
        type="button"
        className="font-sans-rounded flex-1 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-900 shadow-lg"
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="font-sans-rounded flex-1 rounded-full border border-white/30 px-6 py-3 text-sm text-white transition-all hover:bg-white/20"
    >
      {label}
    </button>
  );
}

/* ------------------ STATS + TOOLKIT TEASER ------------------- */

function SplitStatsToolkit() {
  const stats = [
    { value: "14", label: "Growth Stages" },
    { value: "100%", label: "Personalized Care" },
    { value: "12k+", label: "Mentored Hearts" },
    { value: "24/7", label: "Wellness Support" },
  ];

  return (
    <section id="philosophy" className="grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center border-b border-ink-200 bg-ink-100 px-6 py-24 md:px-8 lg:border-b-0 lg:border-r">
        <div className="mx-auto max-w-md lg:ml-auto lg:mr-12">
          <div className="grid grid-cols-2 gap-x-12 gap-y-16">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-sans-rounded mb-2 text-5xl font-bold text-primary-900">
                  {s.value}
                </div>
                <div className="mb-4 h-1 w-12 rounded-full bg-coral-accent" />
                <p className="font-sans-rounded text-xs font-semibold uppercase tracking-widest text-ink-700">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-paper px-6 py-24 md:px-8">
        <div className="mx-auto max-w-md lg:ml-12 lg:mr-auto">
          <span className="font-sans-rounded text-xs font-semibold uppercase tracking-widest text-coral-accent">
            Our Philosophy
          </span>
          <h2 className="font-serif-warm mb-8 mt-4 text-3xl text-ink-900">
            Personalized care for every student&apos;s wellbeing.
          </h2>
          <div className="space-y-6">
            <ToolkitRow
              icon="psychology"
              title="Stress-Free Mock Tests"
              body="Designed to build confidence, not just measure scores."
            />
            <ToolkitRow
              icon="diversity_3"
              title="Empathetic Voice Feedback"
              body="Softly-guided AI interactions that encourage growth."
            />
          </div>
          <Link
            href="/signup"
            className="font-sans-rounded group mt-10 inline-flex items-center gap-2 font-bold text-primary-700"
          >
            Learn about our holistic approach
            <span
              className="material-symbols-outlined transition-transform group-hover:translate-x-1"
              style={{ fontSize: "18px" }}
            >
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ToolkitRow({
  icon,
  title,
  body,
}: Readonly<{ icon: string; title: string; body: string }>) {
  return (
    <div className="flex gap-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
      <span
        className="material-symbols-outlined text-coral-accent"
        style={{ fontSize: "30px" }}
      >
        {icon}
      </span>
      <div>
        <h4 className="font-sans-rounded font-bold text-ink-900">{title}</h4>
        <p className="font-sans-rounded mt-1 text-sm text-ink-700">{body}</p>
      </div>
    </div>
  );
}

/* ---------------- TESTIMONIALS + VISUAL PANEL ---------------- */

function SplitTestimonialsVisual() {
  return (
    <section id="stories" className="grid grid-cols-1 bg-white lg:grid-cols-2">
      <div className="relative min-h-[450px] overflow-hidden lg:h-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Cozy home study environment with warm sunlight"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEaSsNPKgaLYsnQW6VBbyQVUqz0HQcxUFRDIJoJqkugEXmaAtJe-k8Zmq6T9up1bgY_Q79fcNufw5e0b8oHF_6HEEdinNS0yinK9CW8YXe64ydk-qqNeBKNPN8CbA3D9NsekbUyrMOmutmdIT0teByII-pVbY9ahtmrWkK2R5VSNFuNvMNZzNQ5RocWj3OC51CMjYRjB8-ULCb4I5mPnsWg2ZldIUTn2y1zUjujK2_SxvGaMGTOORqvEONz1lKatLG4Z4gx2lVJYDH"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-900/10 backdrop-blur-[2px]" />
      </div>

      <div className="border-t border-ink-200 bg-ink-100 px-6 py-24 md:px-8 lg:border-l lg:border-t-0">
        <div className="mx-auto max-w-xl lg:ml-12">
          <span className="font-sans-rounded text-xs font-semibold uppercase tracking-widest text-primary-700">
            Shared Journeys
          </span>
          <h2 className="font-serif-warm mb-12 mt-4 text-5xl text-ink-900">
            Believing in you.
          </h2>
          <div className="space-y-12">
            <Testimonial
              quote="The personalized mentorship helped me find my voice. I didn't just learn subjects; I learned how to believe in my own potential."
              initials="AA"
              name="Ananya A."
              location="Bengaluru, Karnataka"
              badge="COLLEGE"
              badgeTone="primary"
            />
            <div className="h-px w-full bg-ink-200" />
            <Testimonial
              quote="Preplyfly made studying feel like a conversation with a friend. My anxiety levels dropped, and my grades followed naturally."
              initials="SM"
              name="Siddharth M."
              location="Pune, Maharashtra"
              badge="SCHOOL"
              badgeTone="coral"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonial({
  quote,
  initials,
  name,
  location,
  badge,
  badgeTone,
}: Readonly<{
  quote: string;
  initials: string;
  name: string;
  location: string;
  badge: string;
  badgeTone: "primary" | "coral";
}>) {
  const badgeClass =
    badgeTone === "primary"
      ? "bg-primary-100 text-primary-700"
      : "bg-coral-100 text-coral-accent";
  return (
    <div className="relative">
      <p className="font-serif-warm mb-6 text-2xl italic text-ink-900">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-4">
        <div className="font-sans-rounded flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
          {initials}
        </div>
        <div>
          <div className="font-sans-rounded text-sm font-bold text-ink-900">
            {name}
          </div>
          <div className="font-sans-rounded text-[10px] font-semibold uppercase tracking-wider text-ink-700">
            {location}
          </div>
        </div>
        <span
          className={`font-sans-rounded ml-auto rounded-full px-3 py-1 text-[10px] font-bold ${badgeClass}`}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

/* -------------------- HOW IT WORKS -------------------- */

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-white py-32">
      <div className="mx-auto mb-20 max-w-[1280px] px-6 text-center md:px-8">
        <h2 className="font-serif-warm text-4xl text-ink-900">
          A kinder way to excel.
        </h2>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-16 px-6 md:grid-cols-3 md:px-8">
        <Step
          num="1"
          title="Find your Path"
          body="From early education to professional mastery, we tailor your learning environment to your personal pace and mental wellbeing."
        />
        <Step
          num="2"
          title="Nurtured Learning"
          body="Engage with empathetic AI and mentors who focus on conceptual clarity and emotional resilience during exam seasons."
        />
        <Step
          num="3"
          title="Celebrate Progress"
          body="Your dashboard doesn't just track marks; it celebrates milestones in your confidence and mastery across every subject."
        />
      </div>
    </section>
  );
}

function Step({
  num,
  title,
  body,
}: Readonly<{ num: string; title: string; body: string }>) {
  return (
    <div className="group text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-ink-100 shadow-inner transition-transform group-hover:scale-110">
        <span className="font-serif-warm coral-accent-text text-4xl italic">
          {num}
        </span>
      </div>
      <h3 className="font-serif-warm mb-4 text-2xl text-ink-900">{title}</h3>
      <p className="font-sans-rounded px-4 text-base text-ink-700">{body}</p>
    </div>
  );
}

/* -------------------- BETA BANNER -------------------- */

function BetaBanner() {
  return (
    <section id="join" className="px-6 py-24 md:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary-900 p-12 text-center text-white shadow-2xl">
        <div className="compass-rose-pattern pointer-events-none absolute inset-0 brightness-0 invert" />
        <div className="relative z-10">
          <h2 className="font-serif-warm mb-4 text-5xl">
            You&apos;re not alone.
          </h2>
          <p className="font-serif-warm mb-10 text-2xl italic opacity-90">
            Join our supportive community today. Early access is free.
          </p>
          <form
            action="/signup"
            method="get"
            className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 md:flex-row"
          >
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              required
              className="font-sans-rounded w-full rounded-full border-none px-6 py-4 text-ink-900 focus:ring-2 focus:ring-coral-300"
            />
            <button
              type="submit"
              className="font-sans-rounded inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-coral-accent px-8 py-4 font-bold text-white transition-all hover:shadow-xl active:scale-95 md:w-auto"
            >
              Reserve My Spot
            </button>
          </form>
          <p className="font-sans-rounded mt-6 text-xs font-semibold uppercase tracking-widest opacity-70">
            12,000+ students supporting each other
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- FOOTER --------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-paper">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-6 py-16 md:grid-cols-4 md:px-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif-warm mb-4 text-2xl font-bold text-ink-900">
            Preplyfly
          </div>
          <p className="font-sans-rounded max-w-xs text-sm text-ink-700">
            Transforming the academic journey through empathy and personalized
            technology.
          </p>
        </div>
        <FooterCol
          heading="Product"
          links={[
            ["Mentorship", "/signup"],
            ["Wellbeing Hub", "/signup"],
            ["Curriculum", "/dashboard"],
          ]}
        />
        <FooterCol
          heading="Company"
          links={[
            ["Our Story", "#"],
            ["Careers", "#"],
            ["Support", "#"],
          ]}
        />
        <FooterCol
          heading="Community"
          links={[
            ["Privacy", "#"],
            ["Student Safety", "#"],
          ]}
        />
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-ink-200 px-6 py-8 text-xs font-semibold uppercase tracking-wider text-ink-700 md:flex-row md:px-8">
        <span className="font-sans-rounded">
          © 2026 Preplyfly · Rooted in Empathy · Made in India
        </span>
        <div className="flex gap-6">
          <Link href="#" className="font-sans-rounded hover:text-coral-accent">
            Twitter
          </Link>
          <Link href="#" className="font-sans-rounded hover:text-coral-accent">
            LinkedIn
          </Link>
          <Link href="#" className="font-sans-rounded hover:text-coral-accent">
            Instagram
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: Readonly<{ heading: string; links: [string, string][] }>) {
  return (
    <div>
      <div className="font-sans-rounded mb-6 text-xs font-bold uppercase tracking-widest text-ink-900">
        {heading}
      </div>
      <ul className="space-y-4">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="font-sans-rounded text-xs font-semibold uppercase tracking-wider text-ink-700 transition-colors hover:text-coral-accent"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
