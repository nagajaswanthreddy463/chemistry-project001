import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import { PageHeader } from "@/components/lab/Layout";
import { QUESTIONS, scoreQuiz } from "@/lib/quiz";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "A five-question quiz on SMILES, descriptors and bonding with instant feedback." },
      { property: "og:title", content: "Cheminformatics Assessment" },
      { property: "og:description", content: "Test your understanding with instant feedback." },
    ],
  }),
  component: Assessment,
});

function Assessment() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const done = i >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(i, QUESTIONS.length - 1)]!;
  const picked = answers[i];
  const score = scoreQuiz(answers);

  const reset = () => { setI(0); setAnswers(QUESTIONS.map(() => null)); };

  return (
    <>
      <PageHeader eyebrow="Module 05" title="Assessment">Five questions. Instant feedback.</PageHeader>
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-hero-btn transition-all duration-500" style={{ width: `${(Math.min(i, QUESTIONS.length) / QUESTIONS.length) * 100}%` }} />
        </div>
        {done ? (
          <div className="glass rounded-3xl p-10 text-center animate-rise">
            <Trophy className="mx-auto size-14 text-gold" />
            <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">Your score</p>
            <p className="font-display text-7xl font-bold text-gradient">{score}/{QUESTIONS.length}</p>
            <p className="mt-2 text-muted-foreground">{score === 5 ? "Perfect — you've mastered the basics!" : score >= 3 ? "Good work! Review the theory for the ones you missed." : "Keep going — revisit the Theory module and try again."}</p>
            <button onClick={reset} className="bg-hero-btn mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"><RotateCcw className="size-4" /> Try again</button>
          </div>
        ) : (
          <div key={i} className="glass rounded-3xl p-6 md:p-10 animate-rise">
            <p className="text-sm text-gold">Question {i + 1} of {QUESTIONS.length}</p>
            <h2 className="mt-2 text-2xl font-semibold">{q.q}</h2>
            <div className="mt-6 grid gap-3">
              {q.options.map((o, j) => {
                const state = picked === null ? "" : j === q.answer ? "ring-success bg-success/10" : j === picked ? "ring-destructive bg-destructive/10" : "opacity-50";
                return (
                  <button key={j} disabled={picked !== null} onClick={() => setAnswers(answers.map((a, k) => k === i ? j : a))}
                    className={"flex items-center justify-between rounded-2xl px-5 py-4 text-left ring-1 ring-border transition hover:ring-primary " + state}>
                    {o}
                    {picked !== null && j === q.answer && <CheckCircle2 className="size-5 text-success" />}
                    {picked === j && j !== q.answer && <XCircle className="size-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 animate-rise">
                <p className="text-sm text-muted-foreground"><b className={picked === q.answer ? "text-success" : "text-destructive"}>{picked === q.answer ? "Correct! " : "Not quite. "}</b>{q.why}</p>
                <button onClick={() => setI(i + 1)} className="bg-hero-btn rounded-full px-6 py-2.5 text-sm font-semibold">{i === QUESTIONS.length - 1 ? "See score" : "Next"}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
