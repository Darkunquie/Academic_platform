import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

export default function Home() {
  return (
    <div className="bg-paper text-ink-900">
      <LandingNav />

      <main className="relative">
        <Hero />
        <SplitStatsToolkit />
        <ProductPreview />
        <SplitTestimonialsVisual />
        <HowItWorks />
        <FAQSection />
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

      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl text-left">
          <h1 className="mb-6 text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            Nurturing India&apos;s <br />
            brightest minds.{" "}
            <span className="text-[#4CBB17]">From step one</span> to
            your <br />
            dream career.
          </h1>
          <p className="mb-10 text-2xl text-coral-100 md:text-3xl">
            Compassionate mentoring · Stress-free tests · Supportive community…
          </p>
          <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-paper px-8 py-4 font-bold text-ink-900 shadow-xl transition-all hover:bg-white active:scale-95"
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
              href="#product"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white"
            >
              See how it works
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
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 overflow-x-auto whitespace-nowrap px-4 md:px-6 lg:px-8">
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
        className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-900 shadow-lg"
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="flex-1 rounded-full border border-white/30 px-6 py-3 text-sm text-white transition-all hover:bg-white/20"
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
      <div className="flex flex-col justify-start border-b border-ink-200 bg-ink-100 px-6 pb-20 pt-12 md:px-12 lg:border-b-0 lg:border-r lg:px-16 lg:pt-20">
        <div className="w-full max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-coral-accent">
            Our Impact
          </span>
          <h2 className="mb-10 mt-4 text-4xl font-bold leading-tight text-ink-900 md:text-5xl">
            Built for every<br />learner&apos;s journey.
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Students collaborating with mentors"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
            className="mb-10 h-48 w-full rounded-2xl object-cover shadow-md"
          />
          <div className="grid grid-cols-2 gap-x-10 gap-y-12">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="mb-2 text-6xl font-bold text-primary-900 md:text-7xl">
                  {s.value}
                </div>
                <div className="mb-4 h-1 w-12 rounded-full bg-coral-accent" />
                <p className="text-sm font-semibold uppercase tracking-widest text-ink-700">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-paper px-6 py-20 md:px-12 lg:px-16">
        <div className="w-full max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-coral-accent">
            Our Philosophy
          </span>
          <h2 className="mb-10 mt-4 text-4xl font-bold leading-tight text-ink-900 md:text-5xl">
            Personalized care for every student&apos;s wellbeing.
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-ink-700">
            We combine adaptive AI with human mentorship to meet students where they are — academically, emotionally, and creatively.
          </p>
          <div className="space-y-6">
            <ToolkitRow
              icon="psychology"
              title="Stress-Free Mock Tests"
              body="Designed to build confidence, not just measure scores."
            />
            <ToolkitRow
              icon="record_voice_over"
              title="Empathetic Voice Feedback"
              body="Softly-guided AI interactions that encourage growth."
            />
            <ToolkitRow
              icon="code"
              title="Hands-On Coding Studio"
              body="Real LeetCode-style problems with friendly nudges, not red Xs."
            />
            <ToolkitRow
              icon="upload_file"
              title="Self-Upload Library"
              body="Drop in your own PDFs and notes — we generate quizzes from them."
            />
          </div>
          <Link
            href="/signup"
            className="group mt-10 inline-flex items-center gap-2 text-lg font-bold text-primary-700"
          >
            Learn about our holistic approach
            <span
              className="material-symbols-outlined transition-transform group-hover:translate-x-1"
              style={{ fontSize: "22px" }}
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
    <div className="flex gap-5 rounded-2xl border border-ink-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
      <span
        className="material-symbols-outlined text-coral-accent"
        style={{ fontSize: "36px" }}
      >
        {icon}
      </span>
      <div>
        <h4 className="text-lg font-bold text-ink-900">{title}</h4>
        <p className="mt-2 text-base text-ink-700">{body}</p>
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
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-700">
            Beta Testers · Early Voices
          </span>
          <h2 className="mb-12 mt-4 text-5xl font-bold text-ink-900">
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
      <p className="mb-6 text-2xl italic text-ink-900">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
          {initials}
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900">
            {name}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-700">
            {location}
          </div>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-[10px] font-bold ${badgeClass}`}
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
        <h2 className="text-4xl text-ink-900">
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
        <span className="coral-accent-text text-4xl italic">
          {num}
        </span>
      </div>
      <h3 className="mb-4 text-2xl text-ink-900">{title}</h3>
      <p className="px-4 text-base text-ink-700">{body}</p>
    </div>
  );
}

/* -------------------- PRODUCT PREVIEW -------------------- */

function ProductPreview() {
  return (
    <section id="product" className="relative bg-paper py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-coral-accent">
            What&apos;s Inside
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink-900 md:text-5xl">
            Your entire prep journey in one calm dashboard.
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-2xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-ink-200 bg-ink-100 px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-coral-300" />
            <span className="h-3 w-3 rounded-full bg-primary-200" />
            <span className="h-3 w-3 rounded-full bg-ink-300" />
            <div className="ml-4 rounded-md bg-white px-3 py-1 text-xs text-ink-500">
              preplyfly.com/dashboard
            </div>
          </div>

          {/* App body */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="border-b border-ink-200 bg-paper p-6 md:border-b-0 md:border-r">
              <div className="mb-6 text-xs font-bold uppercase tracking-widest text-ink-500">
                My Subjects
              </div>
              <ul className="space-y-2">
                <SidebarItem icon="calculate" label="Mathematics" active />
                <SidebarItem icon="science" label="Physics" />
                <SidebarItem icon="biotech" label="Chemistry" />
                <SidebarItem icon="code" label="Coding Studio" />
                <SidebarItem icon="record_voice_over" label="Voice Interview" />
                <SidebarItem icon="upload_file" label="My Uploads" />
              </ul>
            </aside>

            {/* Main */}
            <div className="bg-white p-6 md:p-10">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-coral-accent">
                    Class 10 · CBSE
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-ink-900">
                    Mathematics · Continue where you left off
                  </h3>
                </div>
                <div className="hidden text-right md:block">
                  <div className="text-3xl font-bold text-primary-700">68%</div>
                  <div className="text-xs uppercase tracking-wider text-ink-500">
                    Term progress
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TopicMockCard
                  title="Quadratic Equations"
                  chapter="Chapter 4"
                  progress={82}
                  difficulty="Medium"
                  difficultyTone="coral"
                />
                <TopicMockCard
                  title="Trigonometry Basics"
                  chapter="Chapter 8"
                  progress={45}
                  difficulty="Easy"
                  difficultyTone="primary"
                />
                <TopicMockCard
                  title="Statistics"
                  chapter="Chapter 14"
                  progress={12}
                  difficulty="Medium"
                  difficultyTone="coral"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-5">
                <div className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-primary-700"
                    style={{ fontSize: "24px" }}
                  >
                    auto_awesome
                  </span>
                  <div>
                    <div className="text-sm font-bold text-primary-900">
                      AI Recommendation
                    </div>
                    <p className="mt-1 text-sm text-ink-700">
                      You&apos;re ready for a mock test on Quadratic Equations. Estimated 18 minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-auto whitespace-nowrap rounded-full bg-primary-700 px-4 py-2 text-xs font-bold text-white"
                  >
                    Start mock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarItem({
  icon,
  label,
  active,
}: Readonly<{ icon: string; label: string; active?: boolean }>) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
        active
          ? "bg-coral-100 font-bold text-coral-accent"
          : "text-ink-700 hover:bg-ink-100"
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {icon}
      </span>
      {label}
    </li>
  );
}

function TopicMockCard({
  title,
  chapter,
  progress,
  difficulty,
  difficultyTone,
}: Readonly<{
  title: string;
  chapter: string;
  progress: number;
  difficulty: string;
  difficultyTone: "primary" | "coral";
}>) {
  const badge =
    difficultyTone === "primary"
      ? "bg-primary-100 text-primary-700"
      : "bg-coral-100 text-coral-accent";
  return (
    <div className="rounded-2xl border border-ink-200 bg-paper p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
          {chapter}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}
        >
          {difficulty}
        </span>
      </div>
      <h4 className="mb-4 text-base font-bold leading-tight text-ink-900">
        {title}
      </h4>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
        <div
          className="h-full rounded-full bg-primary-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-ink-500">{progress}% complete</div>
    </div>
  );
}

/* -------------------- FAQ -------------------- */

function FAQSection() {
  const items: { q: string; a: string }[] = [
    {
      q: "Who is Preplyfly for?",
      a: "Indian students from CBSE Class 1 all the way to graduate-level professional certifications. Pick your stage, board, and we tailor everything.",
    },
    {
      q: "Is it free to use?",
      a: "Yes — early access is completely free during beta. Paid plans will roll out later with a generous free tier always preserved for students.",
    },
    {
      q: "What makes Preplyfly different from other prep apps?",
      a: "Three things: voice interview coach with real-time empathetic feedback, hands-on coding studio with LeetCode-style problems, and self-upload — drop your own PDFs and we generate quizzes from them.",
    },
    {
      q: "Do I need a webcam or microphone?",
      a: "Only for the voice interview feature, which uses your browser microphone. Everything else works on any device with a browser.",
    },
    {
      q: "Is my data safe?",
      a: "All uploads stay private to your account. We never share your study material, performance, or personal data with third parties.",
    },
    {
      q: "Can I cancel any time?",
      a: "Absolutely. No lock-in. Beta is free and any future paid plan is month-to-month.",
    },
  ];

  return (
    <section id="faq" className="bg-ink-100 py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-coral-accent">
            Honest Answers
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-ink-900 md:text-5xl">
            Questions, answered.
          </h2>
        </div>
        <div className="space-y-4">
          {items.map((it) => (
            <details
              key={it.q}
              className="group rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition-shadow open:shadow-md"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-bold text-ink-900">
                {it.q}
                <span
                  className="material-symbols-outlined text-coral-accent transition-transform group-open:rotate-45"
                  style={{ fontSize: "24px" }}
                >
                  add
                </span>
              </summary>
              <p className="mt-4 text-base leading-relaxed text-ink-700">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- BETA BANNER -------------------- */

function BetaBanner() {
  return (
    <section id="join" className="px-6 py-24 md:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary-900 p-12 text-center text-white shadow-2xl">
        <div className="compass-rose-pattern pointer-events-none absolute inset-0 brightness-0 invert" />
        <div className="relative z-10">
          <h2 className="mb-4 text-5xl">
            You&apos;re not alone.
          </h2>
          <p className="mb-10 text-2xl italic opacity-90">
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
              className="w-full rounded-full border-none px-6 py-4 text-ink-900 focus:ring-2 focus:ring-coral-300"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-coral-accent px-8 py-4 font-bold text-white transition-all hover:shadow-xl active:scale-95 md:w-auto"
            >
              Reserve My Spot
            </button>
          </form>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest opacity-70">
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
          <div className="mb-4 text-2xl font-bold text-ink-900">
            Preplyfly
          </div>
          <p className="max-w-xs text-sm text-ink-700">
            Transforming the academic journey through empathy and personalized
            technology.
          </p>
        </div>
        <FooterCol
          heading="Product"
          links={[
            ["What's Inside", "#product"],
            ["Philosophy", "#philosophy"],
            ["How it works", "#how-it-works"],
          ]}
        />
        <FooterCol
          heading="Learn"
          links={[
            ["FAQ", "#faq"],
            ["Stories", "#stories"],
            ["Join beta", "#join"],
          ]}
        />
        <FooterCol
          heading="Account"
          links={[
            ["Sign in", "/login"],
            ["Sign up", "/signup"],
          ]}
        />
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-ink-200 px-6 py-8 text-xs font-semibold uppercase tracking-wider text-ink-700 md:flex-row md:px-8">
        <span className="">
          © 2026 Preplyfly · Rooted in Empathy · Made in India
        </span>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-coral-accent">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-coral-accent">
            Sign up
          </Link>
          <Link href="#faq" className="hover:text-coral-accent">
            FAQ
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
      <div className="mb-6 text-xs font-bold uppercase tracking-widest text-ink-900">
        {heading}
      </div>
      <ul className="space-y-4">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-xs font-semibold uppercase tracking-wider text-ink-700 transition-colors hover:text-coral-accent"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
