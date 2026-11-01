import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Atom, Boxes, CheckCircle2, Circle, CircleDashed, Droplet, Droplets, Equal, FlaskConical, Gem,
  Hexagon, Link2, Magnet, Minus, Orbit, Pentagon, Percent, Pill, RotateCw, Ruler, Scale, Scan,
  ShieldCheck, Sigma, Split, Waves, Weight, XCircle, Zap, type LucideIcon,
} from "lucide-react";
import { Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader, Reveal } from "@/components/lab/Layout";
import { ErrorNote, Skeleton, SmilesPicker, Structure2D, useAnalysis, Viewer3D } from "@/components/lab/Molecule";
import { exampleFor, metricSections, type Descriptors } from "@/lib/chem";
import { setSmiles, useSmiles } from "@/lib/lab-store";

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "Molecular Properties Report — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "MW, LogP, TPSA, H-bonding, charge, solubility, elemental composition and drug-likeness checks for any molecule." },
      { property: "og:title", content: "Molecular Properties Report" },
      { property: "og:description", content: "Descriptor cards, charts and Lipinski/Veber/ESOL verdicts for any molecule." },
    ],
  }),
  component: Properties,
});

export function radarData(d: Descriptors) {
  // normalised against Lipinski-style limits (100 = at the limit)
  const n = (v: number, max: number) => Math.max(0, Math.min(120, (v / max) * 100));
  return [
    { axis: "MW", value: n(d.mw, 500) }, { axis: "LogP", value: n(Math.max(d.logp, 0), 5) },
    { axis: "TPSA", value: n(d.tpsa, 140) }, { axis: "HBD", value: n(d.hbd, 5) },
    { axis: "HBA", value: n(d.hba, 10) }, { axis: "RotB", value: n(d.rotb, 10) },
  ];
}

export function LipinskiBadge({ violations }: { violations: number }) {
  const pass = violations <= 1;
  return (
    <span className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 " +
      (pass ? "bg-success/15 text-success ring-success/40" : "bg-destructive/15 text-destructive ring-destructive/40")}>
      {pass ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      Lipinski Rule of Five: {pass ? "PASS" : "FAIL"} · {violations} violation{violations === 1 ? "" : "s"}
    </span>
  );
}

export function VeberBadge({ pass }: { pass: boolean }) {
  return (
    <span className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 " +
      (pass ? "bg-success/15 text-success ring-success/40" : "bg-destructive/15 text-destructive ring-destructive/40")}>
      {pass ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      Veber Rule: {pass ? "PASS" : "FAIL"}
    </span>
  );
}

const ICONS: Record<string, LucideIcon> = {
  "Molecular Formula": FlaskConical, "Molecular Weight": Weight, "Exact Molecular Weight": Scale,
  "Number of Atoms": Atom, "Heavy Atoms": Boxes,
  "Ring Count": Circle, "Aromatic Rings": Hexagon, "Aliphatic Rings": CircleDashed, "Heterocycles": Pentagon,
  "Heavy Atom Bonds": Link2, "Sigma Bonds": Minus, "Pi Bonds": Equal, "Total Bonds": Sigma,
  "Rotatable Bonds": RotateCw, "Fraction Csp3": Percent, "Stereocenters": Split,
  "Net Formal Charge": Zap, "Valence Electrons": Orbit, "H-bond Donors": Droplet, "H-bond Acceptors": Magnet,
  "LogP": Droplets, "TPSA": Scan, "Molar Refractivity": Gem, "Labute ASA": Ruler,
  "Lipinski Violations": ShieldCheck, "Veber Rule": Pill,
  "ESOL logS": Waves, "Solubility Class": Waves, "Heteroatom Count": Atom,
};

const SECTIONS = ["Basic", "Structure & Bonds", "Electronic & Charge", "Drug-likeness", "Solubility & Composition"];
const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--gold)"];

function MetricCard({ k, v, u, t, delay }: { k: string; v: string; u: string; t: string; delay: number }) {
  const Icon = ICONS[k] ?? FlaskConical;
  return (
    <Reveal delay={delay}>
      <div className="glass lift h-full rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{k}</p>
          <Icon className="size-4 text-gold" />
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-gradient">{v}<span className="ml-1 text-sm text-muted-foreground">{u}</span></p>
        <p className="mt-2 text-sm text-muted-foreground">{t}</p>
      </div>
    </Reveal>
  );
}

function CompositionChart({ d }: { d: Descriptors }) {
  return (
    <div className="glass rounded-3xl p-5">
      <h2 className="font-semibold">Elemental composition (% by mass)</h2>
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={d.composition} dataKey="pct" nameKey="el" innerRadius="55%" outerRadius="85%" strokeWidth={2} stroke="var(--background)">
                {d.composition.map((c, i) => <Cell key={c.el} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
                formatter={(v) => `${Number(v).toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
              <th className="py-2">Element</th><th>Atoms</th><th className="text-right">Mass %</th>
            </tr>
          </thead>
          <tbody>
            {d.composition.map((c, i) => (
              <tr key={c.el} className="border-b border-border/50">
                <td className="flex items-center gap-2 py-2">
                  <span className="inline-block size-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{c.el}
                </td>
                <td>{c.count}</td>
                <td className="text-right font-semibold">{c.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Properties() {
  const smiles = useSmiles();
  const { data, error, loading } = useAnalysis(smiles);
  const [tab, setTab] = useState(SECTIONS[0]);
  const sections = data ? metricSections(data) : [];
  const active = sections.find((s) => s.section === tab);
  const example = data ? exampleFor(data.smiles) : undefined;

  return (
    <>
      <PageHeader eyebrow="Module 03" title="Molecular properties report">Every descriptor, explained in plain English.</PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <SmilesPicker value={smiles} onChange={setSmiles} />
        {error && <ErrorNote message={error} />}
        {loading && !data && <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>}
        {data && (
          <>
            <div className="glass flex flex-wrap items-center gap-4 rounded-3xl p-5">
              <Structure2D svg={data.svg} className="size-28" />
              <div className="mr-auto">
                <p className="font-mono text-sm text-muted-foreground">{data.smiles}</p>
                <p className="font-display text-2xl font-bold text-gold">{data.formula}</p>
                <p className="text-sm text-muted-foreground">Drug-likeness summary</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LipinskiBadge violations={data.lipinskiViolations} />
                <VeberBadge pass={data.veberPass} />
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/40">
                  <Waves className="size-4" /> {data.esolLabel} (logS {data.esol.toFixed(2)})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => setTab(s)}
                  className={"rounded-full px-4 py-1.5 text-sm ring-1 transition " +
                    (tab === s ? "bg-primary text-primary-foreground ring-primary" : "ring-border hover:ring-gold")}>
                  {s}
                </button>
              ))}
            </div>

            <div className={"grid gap-4 " + (example ? "lg:grid-cols-[1fr_320px]" : "")}>
              {active && (
                <div className={"grid content-start gap-4 sm:grid-cols-2 " + (example ? "xl:grid-cols-3" : "lg:grid-cols-4")}>
                  {active.items.map((m, i) => <MetricCard key={m.k} {...m} delay={i * 60} />)}
                </div>
              )}
              {example && (
                <div className="glass h-fit rounded-3xl p-4 lg:sticky lg:top-24">
                  <h2 className="font-semibold">{example.name} in 3D</h2>
                  <Viewer3D smiles={data.smiles} molblock={data.molblock} svg={data.svg} className="mt-3 aspect-square bg-background/30" />
                  <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {[["Carbon", "#909090"], ["Oxygen", "#FF0D0D"], ["Nitrogen", "#3050F8"], ["Hydrogen", "#FFFFFF"]].map(([n, c]) => (
                      <li key={n} className="flex items-center gap-2"><span className="size-3 rounded-full ring-1 ring-border" style={{ background: c }} />{n}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">Drag to rotate · scroll to zoom</p>
                </div>
              )}
            </div>

            {tab === "Solubility & Composition" && <CompositionChart d={data} />}

            <div className="glass rounded-3xl p-5">
              <h2 className="font-semibold">Drug-likeness profile</h2>
              <p className="text-xs text-muted-foreground">Each axis shows % of the Lipinski/Veber limit — 100% marks the limit.</p>
              <div className="h-80">
                <ResponsiveContainer>
                  <RadarChart data={radarData(data)}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 120]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} isAnimationActive />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
