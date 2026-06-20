import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import {
  TextHoverEffect,
  FooterBackgroundGradient,
} from "@/components/ui/hover-footer";

export default function Home() {
  return (
    <div className="relative bg-paper text-ink-900">
      <LandingNav />

      <main className="relative">
        <Hero />
        <SplitStatsToolkit />
        <ProductPreview />
        <SplitTestimonialsVisual />
        <HowItWorks />
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
      className="relative flex h-screen min-h-[640px] w-full flex-col justify-center pt-28 md:pt-24"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(248,246,241,0.95) 0%, rgba(248,246,241,0.78) 30%, rgba(248,246,241,0.35) 60%, rgba(248,246,241,0.1) 100%), url('/hero-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
      }}
    >

      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl text-left">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-coral-300/50 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-coral-accent shadow-sm backdrop-blur-sm">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                auto_awesome
              </span>
              <span>Free during beta · No credit card</span>
            </span>
          </div>
          <h1 className="mb-8 text-5xl font-bold leading-tight text-ink-900 md:text-6xl lg:text-7xl">
            Nurturing India&apos;s <br />
            brightest minds.{" "}
           <br/> <span className="text-[#1F8765]">From step one</span><br/> to
            your dream career. <br />
           
          </h1>
          <p className="mb-6 text-lg text-ink-700 md:text-xl">
            Compassionate mentoring · Stress-free tests · Supportive community…
          </p>
          <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-700">
            <TrustItem icon="groups" label="12,000+ students" />
            <span className="text-ink-300">·</span>
            <TrustItem icon="school" label="50+ boards & exams" />
            <span className="text-ink-300">·</span>
            <TrustItem icon="lock" label="Private by default" />
          </div>
          <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-coral-accent px-8 py-4 font-bold text-white shadow-xl transition-all hover:opacity-95 active:scale-95"
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
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-900"
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
    </section>
  );
}

function TrustItem({
  icon,
  label,
}: Readonly<{ icon: string; label: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="material-symbols-outlined text-primary-700"
        style={{ fontSize: "18px" }}
      >
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
    </span>
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
          alt="Young student preparing for exam at home study desk"
          src="/student-study.png"
          className="absolute inset-0 h-full w-full object-cover"
        />
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span
                    className="material-symbols-outlined text-primary-700"
                    style={{ fontSize: "24px" }}
                  >
                    auto_awesome
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-primary-900">
                      AI Recommendation
                    </div>
                    <p className="mt-1 text-sm text-ink-700">
                      You&apos;re ready for a mock test on Quadratic Equations. Estimated 18 minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="whitespace-nowrap self-start rounded-full bg-primary-700 px-4 py-2 text-xs font-bold text-white sm:self-center"
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

/* ---------------------- FOOTER --------------------- */

function SiteFooter() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "What's Inside", href: "#product" },
        { label: "Philosophy", href: "#philosophy" },
        { label: "How it works", href: "#how-it-works" },
      ],
    },
    {
      title: "Learn",
      links: [
        { label: "Stories", href: "#stories" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Sign up", href: "/signup" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: "mail",
      text: "hello@preplyfly.com",
      href: "mailto:hello@preplyfly.com",
    },
    {
      icon: "language",
      text: "alphabetmobility.org",
      href: "https://alphabetmobility.org/",
    },
    {
      icon: "place",
      text: "Made in India",
    },
  ];

  return (
    <footer className="relative m-4 h-fit overflow-hidden rounded-2xl bg-primary-950 text-paper md:m-6">
      <FooterBackgroundGradient />

      <div className="relative z-40 mx-auto max-w-7xl p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8 pb-6 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-10">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-coral-accent">
                ✦
              </span>
              <span className="text-2xl font-bold text-white">Preplyfly</span>
            </div>
            <p className="text-sm leading-relaxed text-paper/70">
              Compassionate mentoring, stress-free tests, supportive community —
              for every Indian learner.
            </p>
            <a
              href="https://alphabetmobility.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary-200 hover:text-coral-accent"
            >
              <span>A product of Alphabet Mobility</span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                arrow_outward
              </span>
            </a>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-base font-semibold text-white">
                {section.title}
              </h4>
              <ul className="space-y-2 text-sm text-paper/70">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-coral-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-sm text-paper/70">
              {contactInfo.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center space-x-3"
                >
                  <span
                    className="material-symbols-outlined text-coral-accent"
                    style={{ fontSize: "18px" }}
                  >
                    {item.icon}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={
                        item.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="transition-colors hover:text-coral-accent"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-5 border-t border-paper/15" />

        <div className="flex flex-col items-center justify-between space-y-4 text-sm text-paper/60 md:flex-row md:space-y-0">
          <div className="flex space-x-5">
            <Link
              href="/login"
              aria-label="Sign in"
              className="transition-colors hover:text-coral-accent"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                login
              </span>
            </Link>
            <Link
              href="/signup"
              aria-label="Sign up"
              className="transition-colors hover:text-coral-accent"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                person_add
              </span>
            </Link>
            <Link
              href="#product"
              aria-label="Product"
              className="transition-colors hover:text-coral-accent"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                widgets
              </span>
            </Link>
          </div>

          <p className="text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://alphabetmobility.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-coral-accent"
            >
              Alphabet Mobility
            </a>
            <span>. All rights reserved.</span>
          </p>
        </div>
      </div>

      <div className="-mb-24 -mt-32 hidden h-[20rem] lg:flex">
        <TextHoverEffect text="Preplyfly" className="z-50" />
      </div>
    </footer>
  );
}
