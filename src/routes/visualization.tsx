import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/lab/Layout";
import { ErrorNote, Skeleton, SmilesPicker, Structure2D, useAnalysis, Viewer3D, type Style3D } from "@/components/lab/Molecule";
import { setSmiles, useSmiles } from "@/lib/lab-store";

export const Route = createFileRoute("/visualization")({
  head: () => ({
    meta: [
      { title: "Molecular Visualization — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "Draw any SMILES as a 2D structure and an interactive 3D model with stick, ball-and-stick and sphere styles." },
      { property: "og:title", content: "Molecular Visualization" },
      { property: "og:description", content: "Interactive 2D and 3D molecule viewer powered by RDKit and 3Dmol." },
    ],
  }),
  component: Visualization,
});

const STYLES: { id: Style3D; label: string }[] = [
  { id: "stick", label: "Stick" }, { id: "ballstick", label: "Ball & Stick" }, { id: "sphere", label: "Space filling" },
];

function Visualization() {
  const smiles = useSmiles();
  const { data, error, loading } = useAnalysis(smiles);
  const [style, setStyle] = useState<Style3D>("ballstick");
  const [surface, setSurface] = useState(false);
  const [spin, setSpin] = useState(true);

  return (
    <>
      <PageHeader eyebrow="Module 02" title="Molecular visualization">Enter a SMILES string or pick an example to see it in 2D and 3D.</PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <SmilesPicker value={smiles} onChange={setSmiles} />
        {error && <ErrorNote message={error} />}
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">2D structure</h2>{data && <span className="font-mono text-sm text-gold">{data.formula}</span>}</div>
            {loading && !data ? <Skeleton className="mt-4 aspect-square" /> : data && <Structure2D svg={data.svg} className="mt-4 aspect-square" />}
          </div>
          <div className="glass rounded-3xl p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-auto font-semibold">3D model</h2>
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={"rounded-full px-3 py-1.5 text-xs ring-1 transition " + (style === s.id ? "bg-primary text-primary-foreground ring-primary" : "ring-border hover:ring-gold")}>{s.label}</button>
              ))}
              <button onClick={() => setSurface(!surface)} className={"rounded-full px-3 py-1.5 text-xs ring-1 " + (surface ? "bg-accent text-accent-foreground ring-accent" : "ring-border")}>Surface</button>
              <button onClick={() => setSpin(!spin)} className={"rounded-full px-3 py-1.5 text-xs ring-1 " + (spin ? "ring-gold text-gold" : "ring-border")}>Spin</button>
            </div>
            {loading && !data ? <Skeleton className="mt-4 aspect-[4/3]" /> : data &&
              <Viewer3D smiles={data.smiles} molblock={data.molblock} style={style} surface={surface} spin={spin} className="mt-4 aspect-[4/3] bg-background/30" />}
            <p className="mt-3 text-xs text-muted-foreground">Drag to rotate · scroll to zoom</p>
          </div>
        </div>
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-primary hover:text-gold">See the properties report <ArrowRight className="size-4" /></Link>
      </div>
    </>
  );
}
