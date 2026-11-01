import { lazy, Suspense, useEffect, useState } from "react";
import { PARACETAMOL_ATOMS, PARACETAMOL_BONDS, ATOM_STYLE } from "@/lib/paracetamol";

const HeroMolecule3D = lazy(() => import("./HeroMolecule3D"));

export function StaticMolecule() {
  const s = 32, cx = 200, cy = 200;
  const P = PARACETAMOL_ATOMS.map((a) => ({ ...a, x: cx + a.x * s, y: cy - a.y * s }));
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Paracetamol molecule">
      {PARACETAMOL_BONDS.flatMap(([i, j, o], k) => {
        const a = P[i]!, b = P[j]!, L = Math.hypot(b.x - a.x, b.y - a.y), nx = -(b.y - a.y) / L * 4, ny = (b.x - a.x) / L * 4;
        const offs = o === 2 ? [1, -1] : [0];
        return offs.map((f) => <line key={k + "-" + f} x1={a.x + nx * f} y1={a.y + ny * f} x2={b.x + nx * f} y2={b.y + ny * f} stroke="#c9d3e6" strokeWidth={o === 2 ? 3 : 5} />);
      })}
      {P.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={ATOM_STYLE[p.el].r * s} fill={ATOM_STYLE[p.el].color} />)}
    </svg>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

export function HeroMolecule() {
  const [mode, setMode] = useState<"pending" | "3d" | "svg">("pending");
  useEffect(() => setMode(hasWebGL() ? "3d" : "svg"), []);
  return (
    <div className="relative z-10 h-[420px] w-full md:h-[560px]">
      {mode === "3d" ? (
        <Suspense fallback={<StaticMolecule />}><HeroMolecule3D /></Suspense>
      ) : <StaticMolecule />}
    </div>
  );
}
