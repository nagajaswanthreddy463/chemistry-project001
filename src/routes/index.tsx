import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Atom, Boxes, Calculator, GitCompare, GraduationCap, Sparkles } from "lucide-react";
import { Logo, Reveal } from "@/components/lab/Layout";
import { HeroMolecule } from "@/components/lab/HeroMolecule";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cheminformatics Virtual Laboratory — SRM Trichy" },
      { name: "description", content: "Explore SMILES, 2D/3D molecules, descriptors and drug-likeness in an interactive browser lab." },
      { property: "og:title", content: "Cheminformatics Virtual Laboratory" },
      { property: "og:description", content: "An interactive browser lab for SMILES, molecular visualisation and descriptors." },
    ],
  }),
  component: Home,
});

const OBJECTIVES = [
  { icon: Atom, title: "Represent", text: "Convert molecular structures to and from SMILES notation." },
  { icon: Boxes, title: "Visualise", text: "Explore molecules as 2D drawings and interactive 3D models." },
  { icon: Calculator, title: "Calculate", text: "Compute descriptors like MW, LogP, TPSA and H-bonding." },
  { icon: GitCompare, title: "Relate", text: "Connect structure to physical and drug-like properties." },
];

const STATS = [
  { n: 6, s: "", label: "Example molecules" },
  { n: 10, s: "+", label: "Descriptors computed" },
  { n: 3, s: "", label: "3D render styles" },
  { n: 100, s: "%", label: "Runs in your browser" },
];


function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / 1400, 1);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 37) % 100, top: (i * 53) % 100, size: 4 + (i % 4) * 3, delay: (i % 6) * 0.9,
  }));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span key={i} className={"absolute rounded-full animate-floaty " + (i % 3 === 0 ? "bg-gold/50 glow-gold" : "bg-glow/40")}
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s` }} />
      ))}
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="relative">
        <Particles />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ring-gold/40 text-gold">
              <Sparkles className="size-3.5" /> SRM IST Tiruchirappalli · Virtual Lab
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] md:text-7xl">
              <span className="text-gradient">Cheminformatics</span><br />Virtual Laboratory
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Type a molecule as text, watch it come alive in 3D, and decode what its structure says about how it behaves.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/visualization" className="bg-hero-btn inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition hover:scale-[1.03]">
                Start Experiment <ArrowRight className="size-4" />
              </Link>
              <Link to="/theory" className="inline-flex items-center rounded-full px-6 py-3 ring-1 ring-border transition hover:ring-gold">Read the theory</Link>
            </div>
            <p className="mt-10 text-sm text-muted-foreground">
              By <span className="text-foreground">Ustelamuri Naga Jaswanth Reddy</span> · B.Tech CSE (AI &amp; ML), Section C
            </p>
          </div>
          <div className="relative z-10 mx-auto h-[420px] w-full max-w-[560px] md:h-[560px]">
            <div className="pointer-events-none absolute inset-[12%] rounded-full bg-glow/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-[22%] translate-x-6 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-full max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-gold/20" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-primary/20" />
            <HeroMolecule />
            <span className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full glass px-3 py-1 font-mono text-xs">Paracetamol (C₈H₉NO₂)</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal><h2 className="text-3xl font-bold md:text-4xl">Learning objectives</h2></Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OBJECTIVES.map((o, i) => (
            <Reveal key={o.title} delay={i * 100}>
              <div className="glass lift h-full rounded-2xl p-6">
                <div className="grid size-12 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/30"><o.icon className="size-6 text-primary" /></div>
                <h3 className="mt-5 text-xl font-semibold">{o.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{o.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <div className="glass grid gap-8 rounded-3xl p-8 sm:grid-cols-2 md:grid-cols-4 md:p-12">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-5xl font-bold text-gradient"><Counter to={s.n} suffix={s.s} /></div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-12">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">About the developer</p>
            <div className="mt-6 grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
              <div className="grid size-24 place-items-center rounded-2xl bg-hero-btn"><GraduationCap className="size-10" /></div>
              <div>
                <h2 className="text-3xl font-bold">Ustelamuri Naga Jaswanth Reddy</h2>
                <p className="mt-2 text-muted-foreground">B.Tech Computer Science &amp; Engineering (AI &amp; ML) · Section C</p>
                <p className="text-muted-foreground">SRM Institute of Science and Technology, Tiruchirappalli</p>
              </div>
              <Logo className="h-16" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
