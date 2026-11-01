import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Beaker } from "lucide-react";
import { analyze, EXAMPLES, get3Dmol, get3DStructure, type Descriptors } from "@/lib/chem";

export function useAnalysis(smiles: string) {
  const [data, setData] = useState<Descriptors | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    analyze(smiles)
      .then((d) => alive && setData(d))
      .catch((e) => { if (alive) { setData(null); setError(e.message ?? "Something went wrong."); } })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [smiles]);
  return { data, error, loading };
}

export function SmilesPicker({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="glass rounded-2xl p-4 md:flex md:items-end md:gap-3">
      <label className="block flex-1">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">SMILES string</span>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onChange(draft)}
          className="mt-1 w-full rounded-xl border border-input bg-background/50 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" />
      </label>
      <label className="mt-3 block md:mt-0 md:w-56">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Examples</span>
        <select value={EXAMPLES.find((e) => e.smiles === value)?.smiles ?? ""} onChange={(e) => e.target.value && onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-input bg-popover px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="">Choose…</option>
          {EXAMPLES.map((e) => <option key={e.name} value={e.smiles}>{e.name}</option>)}
        </select>
      </label>
      <button onClick={() => onChange(draft)} className="bg-hero-btn mt-3 w-full rounded-xl px-6 py-3 text-sm font-semibold md:mt-0 md:w-auto">
        Analyse
      </button>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm animate-rise">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div><p className="font-semibold">That molecule didn't parse</p><p className="text-muted-foreground">{message}</p></div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-2xl bg-muted/60 " + className} />;
}

export function Structure2D({ svg, className = "" }: { svg: string; className?: string }) {
  return <div className={"rounded-2xl bg-structure p-3 [&_svg]:h-full [&_svg]:w-full " + className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export type Style3D = "stick" | "ballstick" | "sphere";

export function Viewer3D({ smiles, molblock, style = "ballstick", surface = false, spin = true, className = "", svg, compact = false, interactive = true }:
  { smiles: string; molblock: string; style?: Style3D; surface?: boolean; spin?: boolean; className?: string; svg?: string | undefined; compact?: boolean; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const viewer = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [note, setNote] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [flat, setFlat] = useState(false);

  useEffect(() => {
    let alive = true;
    setReady(false);
    setFlat(false);
    (async () => {
      const [$3Dmol, s] = await Promise.all([get3Dmol(), get3DStructure(smiles, molblock)]);
      if (!alive || !ref.current) return;
      if (!s.is3D && svg) { setFlat(true); setNote(compact ? null : "3D data couldn't be loaded from PubChem — showing the 2D structure instead."); return; }
      ref.current.innerHTML = "";
      const v = $3Dmol.createViewer(ref.current, { backgroundColor: "white", backgroundAlpha: 0, ...(interactive ? {} : { nomouse: true }) } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      v.addModel(s.data, "sdf");
      viewer.current = v;
      setNote(s.is3D ? null : "Showing a flat 2D layout — a 3D conformer wasn't available for this molecule.");
      setReady(true);
    })().catch(() => alive && setNote("The 3D viewer couldn't load. Check your connection."));
    return () => { alive = false; };
  }, [smiles, molblock, svg]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const v = viewer.current;
    if (!v || !ready) return;
    v.removeAllSurfaces();
    const st = style === "stick" ? { stick: { radius: 0.18, colorscheme: "Jmol" } }
      : style === "sphere" ? { sphere: { colorscheme: "Jmol" } }
      : { stick: { radius: 0.14, colorscheme: "Jmol" }, sphere: { scale: 0.28, colorscheme: "Jmol" } };
    v.setStyle({}, st);
    if (surface) v.addSurface((window as any).$3Dmol.SurfaceType.VDW, { opacity: 0.55, color: "#7fb2ff" }); // eslint-disable-line @typescript-eslint/no-explicit-any
    v.zoomTo();
    v.spin(spin ? "y" : false, 0.6);
    v.render();
  }, [style, surface, spin, ready]);

  return (
    <div className={"relative overflow-hidden rounded-2xl " + className}>
      {!ready && !flat && <div className="absolute inset-0 animate-pulse bg-muted/50 grid place-items-center"><Beaker className={(compact ? "size-4" : "size-8") + " text-primary"} /></div>}
      <div ref={ref} className={"absolute inset-0 " + (flat ? "hidden" : "")} />
      {flat && svg && <Structure2D svg={svg} className="absolute inset-0" />}
      {note && <p className="absolute bottom-2 left-2 right-2 rounded-lg bg-popover/80 px-3 py-1.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
