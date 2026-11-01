import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { PageHeader, Reveal } from "@/components/lab/Layout";
import { ErrorNote, Skeleton, SmilesPicker, Structure2D, useAnalysis } from "@/components/lab/Molecule";
import { metricList, type Descriptors } from "@/lib/chem";
import { setSmiles, useSmiles } from "@/lib/lab-store";

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "Molecular Properties Report — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "MW, LogP, TPSA, H-bonding, rotatable bonds, rings and σ/π bonds with Lipinski Rule-of-Five check." },
      { property: "og:title", content: "Molecular Properties Report" },
      { property: "og:description", content: "Descriptor cards, radar chart and a Lipinski pass/fail badge for any molecule." },
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

function Properties() {
  const smiles = useSmiles();
  const { data, error, loading } = useAnalysis(smiles);
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
              <div className="mr-auto"><p className="font-mono text-sm text-muted-foreground">{data.smiles}</p><p className="font-display text-2xl font-bold text-gold">{data.formula}</p></div>
              <LipinskiBadge violations={data.lipinskiViolations} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricList(data).map((m, i) => (
                <Reveal key={m.k} delay={i * 60}>
                  <div className="glass lift h-full rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{m.k}</p>
                    <p className="mt-2 font-display text-3xl font-bold text-gradient">{m.v}<span className="ml-1 text-sm text-muted-foreground">{m.u}</span></p>
                    <p className="mt-2 text-sm text-muted-foreground">{m.t}</p>
                  </div>
                </Reveal>
              ))}
            </div>
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
