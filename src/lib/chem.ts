// Browser-only chemistry helpers: RDKit.js + 3Dmol loaded from CDN on demand.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const EXAMPLES = [
  { name: "Ethanol", smiles: "CCO" },
  { name: "Benzene", smiles: "c1ccccc1" },
  { name: "Phenol", smiles: "Oc1ccccc1" },
  { name: "Acetic Acid", smiles: "CC(=O)O" },
  { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
  { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
];

const RDKIT_VER = "2024.3.5-1.0.0";
const scripts: Record<string, Promise<void>> = {};
function loadScript(src: string) {
  if (!scripts[src]) {
    scripts[src] = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => res();
      s.onerror = () => { delete scripts[src]; rej(new Error("Could not load " + src)); };
      document.head.appendChild(s);
    });
  }
  return scripts[src];
}

let rdkitP: Promise<any> | null = null;
export function getRDKit(): Promise<any> {
  if (!rdkitP) {
    const base = `https://unpkg.com/@rdkit/rdkit@${RDKIT_VER}/dist/`;
    rdkitP = loadScript(base + "RDKit_minimal.js").then(() =>
      (window as any).initRDKitModule({ locateFile: () => base + "RDKit_minimal.wasm" }),
    );
    rdkitP.catch(() => (rdkitP = null));
  }
  return rdkitP;
}

export async function get3Dmol(): Promise<any> {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.0.4/3Dmol-min.js");
  return (window as any).$3Dmol;
}

export type Descriptors = {
  smiles: string;
  formula: string;
  mw: number;
  logp: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotb: number;
  rings: number;
  aromaticRings: number;
  heavyAtoms: number;
  sigma: number;
  pi: number;
  lipinskiViolations: number;
  svg: string;
  molblock: string;
};

function bondCounts(molblockH: string) {
  const lines = molblockH.split("\n");
  const counts = lines[3] ?? "";
  const nAtoms = parseInt(counts.slice(0, 3));
  const nBonds = parseInt(counts.slice(3, 6));
  let sigma = 0, pi = 0;
  for (let i = 0; i < nBonds; i++) {
    const l = lines[4 + nAtoms + i] ?? "";
    const order = parseInt(l.slice(6, 9));
    sigma += 1;
    if (order === 2) pi += 1;
    if (order === 3) pi += 2;
  }
  return { sigma, pi };
}

function formulaFromMolblock(mb: string) {
  const lines = mb.split("\n");
  const n = parseInt((lines[3] ?? "").slice(0, 3));
  const c: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const el = (lines[4 + i] ?? "").slice(31, 34).trim();
    if (el) c[el] = (c[el] ?? 0) + 1;
  }
  const order = ["C", "H", ...Object.keys(c).filter((k) => k !== "C" && k !== "H").sort()];
  return order.filter((k) => c[k]).map((k) => k + ((c[k] ?? 0) > 1 ? c[k] : "")).join("");
}

export async function analyze(smiles: string, svgSize = 360): Promise<Descriptors> {
  const RDKit = await getRDKit();
  const clean = smiles.trim();
  if (!clean) throw new Error("Please enter a SMILES string.");
  let mol: any = null;
  try { mol = RDKit.get_mol(clean); } catch { mol = null; }
  if (!mol || !mol.is_valid()) {
    mol?.delete();
    throw new Error(`"${clean}" isn't a valid SMILES string. Check brackets, ring numbers and atom symbols.`);
  }
  try {
    const d = JSON.parse(mol.get_descriptors());
    const svg = mol.get_svg_with_highlights(
      JSON.stringify({ width: svgSize, height: svgSize, bondLineWidth: 2, backgroundColour: [1, 1, 1, 0], addStereoAnnotation: true }),
    );
    const molblockH = mol.get_molblock ? (() => {
      const mh = RDKit.get_mol(mol.add_hs());
      const mb = mh.get_molblock();
      mh.delete();
      return mb;
    })() : "";
    const { sigma, pi } = bondCounts(molblockH);
    const mw = d.amw, logp = d.CrippenClogP, hbd = d.NumHBD, hba = d.NumHBA;
    const lipinskiViolations = [mw > 500, logp > 5, hbd > 5, hba > 10].filter(Boolean).length;
    return {
      smiles: clean,
      formula: formulaFromMolblock(molblockH),
      mw, logp, tpsa: d.tpsa, hbd, hba,
      rotb: d.NumRotatableBonds,
      rings: d.NumRings,
      aromaticRings: d.NumAromaticRings,
      heavyAtoms: d.NumHeavyAtoms,
      sigma, pi, lipinskiViolations, svg,
      molblock: molblockH,
    };
  } finally {
    mol.delete();
  }
}

/** 3D coordinates: try PubChem's 3D conformer, fall back to the 2D molblock. */
export async function get3DStructure(smiles: string, fallback: string): Promise<{ data: string; is3D: boolean }> {
  try {
    const r = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`,
    );
    if (r.ok) return { data: await r.text(), is3D: true };
  } catch { /* offline */ }
  return { data: fallback, is3D: false };
}

export const interpret = {
  mw: (v: number) => v < 160 ? "Small, light molecule — likely volatile and easily absorbed." : v <= 500 ? "Within the drug-like range (≤ 500 Da)." : "Heavy molecule — may struggle with oral absorption.",
  logp: (v: number) => v < 0 ? "Hydrophilic — prefers water over fats." : v <= 3 ? "Balanced polarity — good for membrane permeability." : v <= 5 ? "Lipophilic — dissolves well in fats." : "Very lipophilic — poor water solubility.",
  tpsa: (v: number) => v < 60 ? "Low polarity — can cross the blood–brain barrier." : v <= 140 ? "Moderate polarity — typical for oral drugs." : "Highly polar — poor cell permeability.",
  hbd: (v: number) => v === 0 ? "No H-bond donors present." : v <= 5 ? `${v} donor group(s) — within Lipinski's limit.` : "Too many donors for good absorption.",
  hba: (v: number) => v <= 10 ? `${v} acceptor site(s) — within Lipinski's limit.` : "Too many acceptors for good absorption.",
  rotb: (v: number) => v <= 3 ? "Rigid structure with few rotatable bonds." : v <= 10 ? "Moderately flexible molecule." : "Highly flexible — may reduce bioavailability.",
  rings: (v: number) => v === 0 ? "Acyclic (open chain) molecule." : `${v} ring(s) in the scaffold.`,
  bonds: (s: number, p: number) => `${s} σ bonds form the skeleton; ${p} π bond(s) indicate unsaturation.`,
};

export function metricList(d: Descriptors) {
  return [
    { k: "Molecular Weight", v: d.mw.toFixed(2), u: "g/mol", t: interpret.mw(d.mw) },
    { k: "LogP", v: d.logp.toFixed(2), u: "", t: interpret.logp(d.logp) },
    { k: "TPSA", v: d.tpsa.toFixed(1), u: "Å²", t: interpret.tpsa(d.tpsa) },
    { k: "H-bond Donors", v: String(d.hbd), u: "", t: interpret.hbd(d.hbd) },
    { k: "H-bond Acceptors", v: String(d.hba), u: "", t: interpret.hba(d.hba) },
    { k: "Rotatable Bonds", v: String(d.rotb), u: "", t: interpret.rotb(d.rotb) },
    { k: "Ring Count", v: String(d.rings), u: "", t: interpret.rings(d.rings) },
    { k: "σ / π Bonds", v: `${d.sigma} / ${d.pi}`, u: "", t: interpret.bonds(d.sigma, d.pi) },
  ];
}

