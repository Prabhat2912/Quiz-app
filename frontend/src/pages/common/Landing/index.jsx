import React from "react";
import { Link } from "react-router-dom";
import ThemeBtn from "../../../components/ThemeBtn";

function LandingPage() {
  return (
    <div className="nb-page min-h-screen text-ink">
      <header className="bg-sheet border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <span className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-lg tracking-tight">
              Quiz App
            </span>
            <span className="nb-data hidden sm:inline text-xs text-soft">
              experiment logbook
            </span>
          </span>
          <nav className="flex items-center gap-2" aria-label="Account">
            <Link to="/login" className="nb-btn-ghost !py-2 !px-4 text-sm">
              Log in
            </Link>
            <Link to="/register" className="nb-btn !py-2 !px-4 text-sm">
              Open a page
            </Link>
            <ThemeBtn />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-12 sm:pt-16">
          <div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.05]">
              Run quizzes like experiments.
            </h1>
            <p className="text-soft mt-4 text-lg max-w-xl">
              Every attempt is a filed run: timed questions, instant verdicts,
              and XP that levels you from 1 to 100 while specimens pile up in
              your cabinet.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <Link to="/register" className="nb-btn">
                Start running — free
              </Link>
              <Link to="/login" className="nb-btn-ghost">
                Sign the logbook
              </Link>
            </div>
            <dl className="nb-data flex flex-wrap gap-x-6 gap-y-1 text-sm mt-6">
              <div>
                <dt className="sr-only">Levels</dt>
                <dd>
                  <span className="font-bold text-lg">100</span>{" "}
                  <span className="text-soft">levels</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Badges</dt>
                <dd>
                  <span className="font-bold text-lg">17</span>{" "}
                  <span className="text-soft">specimens</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">XP per correct answer</dt>
                <dd>
                  <span className="font-bold text-lg">+10</span>{" "}
                  <span className="text-soft">XP per correct</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="nb-sheet p-6" aria-label="Sample run record">
            <div className="flex items-center justify-between gap-3">
              <p className="nb-data text-xs text-soft">EXP-03 · JavaScript Basics</p>
              <span className="nb-stamp nb-stamp-pass">Pass</span>
            </div>
            <p className="nb-data text-4xl font-bold text-accent mt-2">
              +93 <span className="text-base font-medium">XP</span>
            </p>
            <p className="nb-data text-xs text-soft mt-1">
              correct +80 · pass +10 · streak +3
            </p>
            <div className="nb-meter h-2.5 mt-4" aria-hidden="true">
              <div style={{ "--fill": 0.72 }} />
            </div>
            <p className="nb-data text-xs text-soft mt-2">
              142 / 200 XP to Level 6
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="nb-specimen px-3 py-1.5 text-sm font-semibold">
                ⭐ Rising Star
              </span>
              <span className="nb-specimen px-3 py-1.5 text-sm font-semibold">
                🧠 Sharp Mind
              </span>
            </div>
          </div>
        </section>

        <section aria-label="How a run works" className="mt-14">
          <h2 className="font-display font-extrabold text-2xl">How a run works</h2>
          <ol className="nb-sheet mt-4 grid grid-cols-1 md:grid-cols-3">
            <li className="p-6 md:border-r border-rule">
              <p className="nb-data text-xs text-soft">01</p>
              <h3 className="font-display font-bold mt-1">Pick an experiment</h3>
              <p className="text-sm text-soft mt-1">
                Browse the bench by subject. Each file lists its questions,
                marks, and minutes.
              </p>
            </li>
            <li className="p-6 md:border-r border-rule border-t md:border-t-0">
              <p className="nb-data text-xs text-soft">02</p>
              <h3 className="font-display font-bold mt-1">Answer against the clock</h3>
              <p className="text-sm text-soft mt-1">
                Single- and multiple-correct questions with instant per-answer
                readings.
              </p>
            </li>
            <li className="p-6 border-t md:border-t-0">
              <p className="nb-data text-xs text-soft">03</p>
              <h3 className="font-display font-bold mt-1">Get stamped</h3>
              <p className="text-sm text-soft mt-1">
                Verdict, XP breakdown, level movement, and new specimens —
                then a full review with explanations.
              </p>
            </li>
          </ol>
        </section>

        <section aria-label="Progression" className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="nb-sheet p-6">
            <h2 className="font-display font-extrabold text-xl">The long game</h2>
            <dl className="nb-data text-sm mt-3 space-y-1.5">
              <div className="flex justify-between border-b border-rule pb-1.5">
                <dt className="text-soft">correct answer</dt>
                <dd className="font-bold">+10 XP</dd>
              </div>
              <div className="flex justify-between border-b border-rule pb-1.5">
                <dt className="text-soft">passing a quiz</dt>
                <dd className="font-bold">+10 XP</dd>
              </div>
              <div className="flex justify-between border-b border-rule pb-1.5">
                <dt className="text-soft">perfect run</dt>
                <dd className="font-bold">+20 XP</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-soft">daily streak</dt>
                <dd className="font-bold">up to +7 XP</dd>
              </div>
            </dl>
            <p className="text-sm text-soft mt-3">
              Streaks, accuracy cabinets, subject readings, and standings
              ranked by total XP keep the bench competitive.
            </p>
          </div>
          <div className="nb-sheet p-6">
            <h2 className="font-display font-extrabold text-xl">For authors</h2>
            <ul className="text-sm text-soft mt-3 space-y-2">
              <li>File exams with categories, durations, and pass marks.</li>
              <li>Draft questions with AI help, including explanations.</li>
              <li>Review every attempt and preview any exam by running it.</li>
              <li>Open any learner's profile and logbook from the standings.</li>
            </ul>
            <Link to="/register" className="nb-btn inline-block mt-4 !py-2 !px-4 text-sm">
              Register as author or learner
            </Link>
          </div>
        </section>

        <footer className="mt-14 pt-4 border-t border-rule flex flex-wrap justify-between gap-2">
          <p className="nb-data text-xs text-soft">Quiz App · experiment logbook</p>
          <p className="text-xs text-soft">
            <Link to="/login" className="text-accent font-semibold hover:underline">Log in</Link>
            {" · "}
            <Link to="/register" className="text-accent font-semibold hover:underline">Register</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
