import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row" style={{ backgroundColor: "#f1fbff" }}>
      {/* Left Panel — visual */}
      <section
        className="relative hidden w-1/2 items-center justify-center overflow-hidden md:flex"
        style={{ backgroundColor: "#002028" }}
      >
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/signup-bg.webp"
            alt="Students collaborating in a study space"
            className="h-full w-full object-cover opacity-60 mix-blend-overlay"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,32,40,0.8), rgba(60,100,113,0.4))",
            }}
          />
        </div>
        <div className="relative z-10 max-w-xl px-12 text-white">
          <div className="mb-6">
            <span
              className="rounded px-2 py-1 text-[11px] font-black uppercase tracking-[0.2em]"
              style={{
                backgroundColor: "#ffdf9b",
                color: "#251a00",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              SYSTEM: AUTH_NEW
            </span>
          </div>
          <h1
            className="mb-6 text-white"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "48px",
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
              fontWeight: 900,
            }}
          >
            Master the architecture of learning.
          </h1>
          <p
            className="leading-relaxed"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "17px",
              lineHeight: "30px",
              color: "#779fad",
            }}
          >
            Join preplyfly to access our technical curriculum and command center
            for academic excellence. Structured. Precise. Rigorous.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="border-l-2 pl-4" style={{ borderColor: "#785a00" }}>
              <div
                className="mb-2 text-[12px] font-medium uppercase"
                style={{
                  color: "#f2bf43",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.05em",
                }}
              >
                01. Curriculum
              </div>
              <p
                className="text-xs"
                style={{
                  color: "#cfe6ee",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "14px",
                  lineHeight: "22px",
                }}
              >
                Indian K-12 boards + state universities. Mock test, interview,
                and coding tracks per topic.
              </p>
            </div>
            <div className="border-l-2 pl-4" style={{ borderColor: "#785a00" }}>
              <div
                className="mb-2 text-[12px] font-medium uppercase"
                style={{
                  color: "#f2bf43",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.05em",
                }}
              >
                02. AI Examiner
              </div>
              <p
                className="text-xs"
                style={{
                  color: "#cfe6ee",
                  fontFamily: "Geist, sans-serif",
                  fontSize: "14px",
                  lineHeight: "22px",
                }}
              >
                Voice + text rehearsal with rubric-scored feedback the moment
                you finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel — form */}
      <section className="flex w-full items-center justify-center bg-white p-6 pb-32 md:w-1/2 md:p-12 md:pb-32">
        <div className="w-full max-w-md">
          {/* Top actions */}
          <div className="mb-10 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase"
              style={{
                color: "#41484b",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.05em",
              }}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              BACK TO HOME
            </Link>
            <div
              className="text-2xl font-black tracking-tighter"
              style={{ color: "#002028" }}
            >
              PREPLYFLY
            </div>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2
              className="mb-2"
              style={{
                color: "#071e24",
                fontFamily: "Geist, sans-serif",
                fontSize: "32px",
                lineHeight: 1.2,
                letterSpacing: "-0.04em",
                fontWeight: 900,
              }}
            >
              Create an Account
            </h2>
            <p
              style={{
                color: "#41484b",
                fontFamily: "Geist, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
              }}
            >
              Initialise your academic journey. Pick stage, board, and class —
              we will route the right syllabus to you.
            </p>
          </div>

          <SignupForm />

          <p
            className="mt-8 text-center"
            style={{
              color: "#41484b",
              fontFamily: "Geist, sans-serif",
              fontSize: "14px",
            }}
          >
            Already part of the fleet?{" "}
            <Link
              href="/login"
              className="font-bold hover:underline"
              style={{ color: "#785a00" }}
            >
              Access Command Center
            </Link>
          </p>
        </div>
      </section>

      {/* Fixed identity footer */}
      <footer className="pointer-events-none fixed bottom-0 left-0 hidden w-full p-6 md:block">
        <div className="flex items-end justify-between">
          <div className="pointer-events-auto">
            <div
              className="rounded p-2 backdrop-blur-sm"
              style={{
                color: "#c1c8cb",
                backgroundColor: "rgba(241,251,255,0.5)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              © 2026 PREPLYFLY ACADEMIC SYSTEMS
            </div>
          </div>
          <div className="pointer-events-auto flex gap-6">
            <div
              className="rounded p-2 backdrop-blur-sm"
              style={{
                color: "#c1c8cb",
                backgroundColor: "rgba(241,251,255,0.5)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              LATENCY: 14MS
            </div>
            <div
              className="rounded p-2 backdrop-blur-sm"
              style={{
                color: "#c1c8cb",
                backgroundColor: "rgba(241,251,255,0.5)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              STATUS: NOMINAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
