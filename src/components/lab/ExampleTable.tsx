import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { analyze, EXAMPLES } from "@/lib/chem";
import { setSmiles } from "@/lib/lab-store";
import { Viewer3D, type Style3D } from "@/components/lab/Molecule";

type Example = (typeof EXAMPLES)[number];

/** 2D SVG for the fallback when PubChem 3D data is unavailable. */
function useSvg(smiles: string, enabled: boolean) {
  const [svg, setSvg] = useState<string>();
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    analyze(smiles, 200).then((d) => alive && setSvg(d.svg)).catch(() => {});
    return () => { alive = false; };
  }, [smiles, enabled]);
  return svg;
}

function MiniPreview({ ex }: { ex: Example }) {
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(!!e?.isIntersecting);
      if (e?.isIntersecting) setSeen(true);
    }, { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const svg = useSvg(ex.smiles, seen);
  return (
    <div ref={box} className="pointer-events-none size-[90px] rounded-xl bg-background/40">
      {seen && svg ? (
        <Viewer3D smiles={ex.smiles} molblock="" svg={svg} spin={visible} compact interactive={false} className="size-full" />
      ) : <div className="size-full animate-pulse rounded-xl bg-muted/60" />}
    </div>
  );
}

const STYLES: { id: Style3D; label: string }[] = [
  { id: "stick", label: "Stick" }, { id: "ballstick", label: "Ball & Stick" }, { id: "sphere", label: "Sphere" },
];

function Modal({ ex, onClose }: { ex: Example; onClose: () => void }) {
  const [style, setStyle] = useState<Style3D>("ballstick");
  const svg = useSvg(ex.smiles, true);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${ex.name} 3D viewer`}>
      <div className="glass w-full max-w-2xl rounded-3xl p-5 animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <h3 className="font-semibold">{ex.name}</h3>
            <p className="font-mono text-xs text-gold">{ex.smiles}</p>
          </div>
          {STYLES.map((s) => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className={"rounded-full px-3 py-1.5 text-xs ring-1 transition " + (style === s.id ? "bg-primary text-primary-foreground ring-primary" : "ring-border hover:ring-gold")}>{s.label}</button>
          ))}
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 ring-1 ring-border hover:ring-gold"><X className="size-4" /></button>
        </div>
        {svg ? <Viewer3D smiles={ex.smiles} molblock="" svg={svg} style={style} className="mt-4 aspect-[4/3] bg-background/30" />
          : <div className="mt-4 aspect-[4/3] animate-pulse rounded-2xl bg-muted/60" />}
        <p className="mt-3 text-xs text-muted-foreground">Drag to rotate · scroll to zoom · 3D data from PubChem</p>
      </div>
    </div>
  );
}

export function ExampleTable({ current }: { current: string }) {
  const [open, setOpen] = useState<Example | null>(null);
  const pick = (e: Example) => { setSmiles(e.smiles); setOpen(e); };
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <h2 className="px-5 pt-5 font-semibold">Example molecules</h2>
      <p className="px-5 text-xs text-muted-foreground">Click a row to load it and open the 3D viewer.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-5 py-2">3D</th><th className="px-5 py-2">Molecule</th><th className="px-5 py-2">SMILES</th><th className="px-5 py-2">Type</th></tr>
          </thead>
          <tbody>
            {EXAMPLES.map((e) => (
              <tr key={e.name} tabIndex={0} onClick={() => pick(e)} onKeyDown={(k) => k.key === "Enter" && pick(e)}
                className={"cursor-pointer border-t border-border transition hover:bg-primary/10 " + (e.smiles === current ? "bg-primary/15" : "")}>
                <td className="px-5 py-2"><MiniPreview ex={e} /></td>
                <td className="px-5 py-2.5 font-medium">{e.name}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-gold">{e.smiles}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{e.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <Modal ex={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
