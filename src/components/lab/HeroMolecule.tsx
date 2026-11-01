import { lazy, Suspense, useEffect, useState } from "react";
import { CAFFEINE_ATOMS, CAFFEINE_BONDS, ATOM_STYLE } from "@/lib/caffeine";

const HeroMolecule3D = lazy(() => import("./HeroMolecule3D"));

export function StaticMolecule() {
  const s = 38, cx = 200, cy = 200;
  const P = CAFFEINE_ATOMS.map((a) => ({ ...a, x: cx + a.x * s, y: cy - a.y * s }));
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Caffeine molecule">
      {CAFFEINE_BONDS.map(([i, j], k) => <line key={k} x1={P[i]!.x} y1={P[i]!.y} x2={P[j]!.x} y2={P[j]!.y} stroke="#c9d3e6" strokeWidth={5} />)}
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
