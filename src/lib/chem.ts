// Browser-only chemistry helpers: RDKit.js (served from public/rdkit) and 3Dmol (npm), both loaded on demand.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const EXAMPLES = [
  { name: "Paracetamol", smiles: "CC(=O)Nc1ccc(O)cc1", type: "Drug", pubchem: "acetaminophen" },
  { name: "Ibuprofen", smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O", type: "Drug", pubchem: "ibuprofen" },
  { name: "Nicotine", smiles: "CN1CCCC1c1cccnc1", type: "Natural alkaloid", pubchem: "nicotine" },
  { name: "Vanillin", smiles: "COc1cc(C=O)ccc1O", type: "Flavour compound", pubchem: "vanillin" },
  { name: "Naphthalene", smiles: "c1ccc2ccccc2c1", type: "Aromatic", pubchem: "naphthalene" },
  { name: "Glucose", smiles: "OCC1OC(O)C(O)C(O)C1O", type: "Sugar", pubchem: "glucose" },
  { name: "Dopamine", smiles: "NCCc1ccc(O)c(O)c1", type: "Neurotransmitter", pubchem: "dopamine" },
  { name: "Menthol", smiles: "CC(C)C1CCC(C)CC1O", type: "Natural terpene", pubchem: "menthol" },
  { name: "Urea", smiles: "NC(N)=O", type: "Organic compound", pubchem: "urea" },
  { name: "Toluene", smiles: "Cc1ccccc1", type: "Aromatic", pubchem: "toluene" },
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
    const base = "/rdkit/"; // copied from node_modules/@rdkit/rdkit/dist by `npm run copy-rdkit`
    rdkitP = loadScript(base + "RDKit_minimal.js").then(() =>
      (window as any).initRDKitModule({ locateFile: () => base + "RDKit_minimal.wasm" }),
    );
    rdkitP.catch(() => (rdkitP = null));
  }
  return rdkitP;
}

export async function get3Dmol(): Promise<any> {
  const w = window as any;
  if (!w.$3Dmol) {
    const mod: any = await import("3dmol");
    w.$3Dmol = mod.createViewer ? mod : mod.default ?? mod;
  }
  return w.$3Dmol;
}

export type Composition = { el: string; count: number; pct: number };

export type Descriptors = {
  smiles: string;
  formula: string;
  mw: number;
  exactmw: number;
  logp: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotb: number;
  rings: number;
  aromaticRings: number;
  aliphaticRings: number;
  numAtoms: number;
  heavyAtoms: number;
  heavyBonds: number;
  sigma: number;
  pi: number;
  totalBonds: number;
  csp3: number;
  mr: number;
  formalCharge: number;
  heteroatoms: number;
  stereocenters: number;
  valenceElectrons: number;
  labuteASA: number;
  heterocyclesAromatic: number;
  heterocyclesAliphatic: number;
  composition: Composition[];
  lipinskiViolations: number;
  veberPass: boolean;
  esol: number;
  esolLabel: string;
  svg: string;
  molblock: string;
};

const VALENCE: Record<string, number> = { H: 1, B: 3, C: 4, N: 5, O: 6, F: 7, P: 5, S: 6, Cl: 7, Br: 7, I: 7, Si: 4 };
const ATOMIC_MASS: Record<string, number> = { H: 1.008, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, P: 30.974, S: 32.06, Cl: 35.45, Br: 79.904, I: 126.9, Si: 28.085 };

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

/** Elements, atom/bond counts and net formal charge (from "M  CHG" lines) of a molblock. */
function molblockInfo(mb: string) {
  const lines = mb.split("\n");
  const counts = lines[3] ?? "";
  const nAtoms = parseInt(counts.slice(0, 3)) || 0;
  const nBonds = parseInt(counts.slice(3, 6)) || 0;
  const c: Record<string, number> = {};
  for (let i = 0; i < nAtoms; i++) {
    const el = (lines[4 + i] ?? "").slice(31, 34).trim();
    if (el) c[el] = (c[el] ?? 0) + 1;
  }
  let charge = 0;
  for (const l of lines) {
    if (l.startsWith("M  CHG")) {
      const n = parseInt(l.slice(6, 9)) || 0;
      for (let i = 0; i < n; i++) charge += parseInt(l.slice(13 + i * 8, 17 + i * 8)) || 0;
    }
  }
  return { counts: c, nAtoms, nBonds, charge };
}

function formulaFromCounts(c: Record<string, number>) {
  const order = ["C", "H", ...Object.keys(c).filter((k) => k !== "C" && k !== "H").sort()];
  return order.filter((k) => c[k]).map((k) => k + ((c[k] ?? 0) > 1 ? c[k] : "")).join("");
}

function compositionFromCounts(c: Record<string, number>): Composition[] {
  const masses = Object.entries(c).map(([el, n]) => ({ el, count: n, mass: n * (ATOMIC_MASS[el] ?? 0) }));
  const total = masses.reduce((s, m) => s + m.mass, 0);
  if (!total) return [];
  return masses
    .map((m) => ({ el: m.el, count: m.count, pct: (m.mass / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
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
  let qmol: any = null;
  try {
    const d = JSON.parse(mol.get_descriptors());
    const svg = mol.get_svg_with_highlights(
      JSON.stringify({ width: svgSize, height: svgSize, bondLineWidth: 2, backgroundColour: [1, 1, 1, 0], addStereoAnnotation: true }),
    );
    const heavyInfo = molblockInfo(mol.get_molblock());
    const mh = RDKit.get_mol(mol.add_hs());
    const molblockH = mh.get_molblock();
    mh.delete();
    const info = molblockInfo(molblockH);
    const { sigma, pi } = bondCounts(molblockH);

    // Aromatic heavy atoms via an "[a]" substructure query (for the ESOL aromatic proportion).
    let aromaticHeavy = 0;
    try {
      qmol = RDKit.get_qmol("[a]");
      const matches = mol.get_substruct_matches(qmol);
      aromaticHeavy = Array.isArray(matches) ? matches.length : 0;
    } catch { aromaticHeavy = 0; }

    let valenceElectrons = 0;
    for (const [el, n] of Object.entries(info.counts)) {
      const v = VALENCE[el];
      if (v === undefined) { valenceElectrons = NaN; break; }
      valenceElectrons += v * n;
    }

    const mw = d.amw, logp = d.CrippenClogP, hbd = d.NumHBD, hba = d.NumHBA;
    const rotb = d.NumRotatableBonds, tpsa = d.tpsa, heavyAtoms = d.NumHeavyAtoms;
    const lipinskiViolations = [mw > 500, logp > 5, hbd > 5, hba > 10].filter(Boolean).length;
    const ap = heavyAtoms > 0 ? aromaticHeavy / heavyAtoms : 0;
    const esol = 0.16 - 0.63 * logp - 0.0062 * mw + 0.066 * rotb - 0.74 * ap;
    const esolLabel = esol > -2 ? "Highly soluble" : esol >= -4 ? "Moderately soluble" : "Poorly soluble";

    return {
      smiles: clean,
      formula: formulaFromCounts(info.counts),
      mw,
      exactmw: d.exactmw,
      logp, tpsa, hbd, hba, rotb,
      rings: d.NumRings,
      aromaticRings: d.NumAromaticRings,
      aliphaticRings: d.NumAliphaticRings,
      numAtoms: info.nAtoms,
      heavyAtoms,
      heavyBonds: heavyInfo.nBonds,
      sigma, pi,
      totalBonds: info.nBonds,
      csp3: d.FractionCSP3,
      mr: d.CrippenMR,
      formalCharge: info.charge,
      heteroatoms: d.NumHeteroatoms,
      stereocenters: d.NumAtomStereoCenters,
      valenceElectrons,
      labuteASA: d.labuteASA,
      heterocyclesAromatic: d.NumAromaticHeterocycles,
      heterocyclesAliphatic: d.NumAliphaticHeterocycles,
      composition: compositionFromCounts(info.counts),
      lipinskiViolations,
      veberPass: tpsa <= 140 && rotb <= 10,
      esol, esolLabel,
      svg,
      molblock: molblockH,
    };
  } finally {
    qmol?.delete?.();
    mol.delete();
  }
}

/** 3D coordinates: try PubChem's 3D conformer, fall back to the 2D molblock. */
export function exampleFor(smiles: string) {
  return EXAMPLES.find((e) => e.smiles === smiles);
}

const pc3d: Record<string, Promise<string | null>> = {};
/** 3D SDF for one of the examples, fetched by name from PubChem and cached in localStorage. */
export function getExample3D(name: string): Promise<string | null> {
  if (!pc3d[name]) {
    pc3d[name] = (async () => {
      const key = "pc3d:" + name;
      try { const c = localStorage.getItem(key); if (c) return c; } catch { /* storage blocked */ }
      try {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/SDF?record_type=3d`);
        if (!r.ok) return null;
        const t = await r.text();
        if (!t.includes("V2000") && !t.includes("V3000")) return null;
        try { localStorage.setItem(key, t); } catch { /* quota */ }
        return t;
      } catch { return null; }
    })();
    pc3d[name].then((v) => { if (!v) delete pc3d[name]; });
  }
  return pc3d[name];
}

export async function get3DStructure(smiles: string, fallback: string): Promise<{ data: string; is3D: boolean }> {
  const ex = exampleFor(smiles);
  if (ex) {
    const sdf = await getExample3D(ex.pubchem);
    return sdf ? { data: sdf, is3D: true } : { data: fallback, is3D: false };
  }
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
  exactmw: () => "Monoisotopic mass — what a mass spectrometer measures.",
  logp: (v: number) => v < 0 ? "Hydrophilic — prefers water over fats." : v <= 3 ? "Balanced polarity — good for membrane permeability." : v <= 5 ? "Lipophilic — dissolves well in fats." : "Very lipophilic — poor water solubility.",
  tpsa: (v: number) => v < 60 ? "Low polarity — can cross the blood–brain barrier." : v <= 140 ? "Moderate polarity — typical for oral drugs." : "Highly polar — poor cell permeability.",
  hbd: (v: number) => v === 0 ? "No H-bond donors present." : v <= 5 ? `${v} donor group(s) — within Lipinski's limit.` : "Too many donors for good absorption.",
  hba: (v: number) => v <= 10 ? `${v} acceptor site(s) — within Lipinski's limit.` : "Too many acceptors for good absorption.",
  rotb: (v: number) => v <= 3 ? "Rigid structure with few rotatable bonds." : v <= 10 ? "Moderately flexible molecule." : "Highly flexible — may reduce bioavailability.",
  rings: (v: number) => v === 0 ? "Acyclic (open chain) molecule." : `${v} ring(s) in the scaffold.`,
  aromaticRings: (v: number) => v === 0 ? "No aromatic rings." : `${v} aromatic ring(s) — flat, electron-rich systems.`,
  aliphaticRings: (v: number) => v === 0 ? "No non-aromatic rings." : `${v} non-aromatic ring(s).`,
  numAtoms: () => "All atoms in the molecule, including hydrogens.",
  heavyAtoms: () => "Non-hydrogen atoms — the molecular skeleton.",
  heavyBonds: () => "Bonds between heavy (non-hydrogen) atoms.",
  totalBonds: () => "Every bond in the molecule, including C–H bonds.",
  bonds: (s: number, p: number) => `${s} σ bonds form the skeleton; ${p} π bond(s) indicate unsaturation.`,
  csp3: (v: number) => `${Math.round(v * 100)}% of carbons are sp³ (saturated) — higher values often mean better solubility.`,
  mr: () => "Molar refractivity — linked to molecular volume and polarisability.",
  formalCharge: (v: number) => v === 0 ? "Net charge is zero — a neutral molecule." : `Net charge of ${v > 0 ? "+" : ""}${v} — this is an ion.`,
  heteroatoms: (v: number) => v === 0 ? "Only carbon and hydrogen — a hydrocarbon." : `${v} atom(s) other than C/H — they add polarity and H-bonding ability.`,
  stereocenters: (v: number) => v === 0 ? "Achiral — no mirror-image forms." : `${v} chiral centre(s) — up to ${2 ** v} possible stereoisomers.`,
  valenceElectrons: () => "Total outer-shell electrons available for bonding.",
  labuteASA: () => "Labute approximate surface area — a measure of size and exposed surface.",
  heterocycles: (a: number, al: number) => a + al === 0 ? "No rings containing a non-carbon atom." : `${a} aromatic and ${al} aliphatic ring(s) containing a non-carbon atom.`,
  lipinski: (v: number) => v === 0 ? "All four rules satisfied — excellent oral drug-likeness." : v === 1 ? "One rule broken — still considered drug-like." : `${v} rules broken — poor oral drug-likeness.`,
  veber: (pass: boolean) => pass ? "TPSA ≤ 140 Å² and ≤ 10 rotatable bonds — good oral bioavailability expected." : "TPSA or flexibility too high — oral bioavailability may suffer.",
  esol: (label: string) => label === "Highly soluble" ? "Dissolves readily in water." : label === "Moderately soluble" ? "Typical solubility for an oral drug." : "Low water solubility — formulation may be needed.",
};

export type Metric = { k: string; v: string; u: string; t: string };

const fmt = (v: number, p = 2) => (Number.isFinite(v) ? v.toFixed(p) : "N/A");

/** All metrics grouped into display sections (Basic, Structure & Bonds, …). */
export function metricSections(d: Descriptors): { section: string; items: Metric[] }[] {
  return [
    {
      section: "Basic",
      items: [
        { k: "Molecular Formula", v: d.formula, u: "", t: "The types and counts of atoms in one molecule." },
        { k: "Molecular Weight", v: fmt(d.mw), u: "g/mol", t: interpret.mw(d.mw) },
        { k: "Exact Molecular Weight", v: fmt(d.exactmw, 4), u: "g/mol", t: interpret.exactmw() },
        { k: "Number of Atoms", v: String(d.numAtoms), u: "", t: interpret.numAtoms() },
        { k: "Heavy Atoms", v: String(d.heavyAtoms), u: "", t: interpret.heavyAtoms() },
      ],
    },
    {
      section: "Structure & Bonds",
      items: [
        { k: "Ring Count", v: String(d.rings), u: "", t: interpret.rings(d.rings) },
        { k: "Aromatic Rings", v: String(d.aromaticRings), u: "", t: interpret.aromaticRings(d.aromaticRings) },
        { k: "Aliphatic Rings", v: String(d.aliphaticRings), u: "", t: interpret.aliphaticRings(d.aliphaticRings) },
        { k: "Heterocycles", v: `${d.heterocyclesAromatic} arom / ${d.heterocyclesAliphatic} aliph`, u: "", t: interpret.heterocycles(d.heterocyclesAromatic, d.heterocyclesAliphatic) },
        { k: "Heavy Atom Bonds", v: String(d.heavyBonds), u: "", t: interpret.heavyBonds() },
        { k: "Sigma Bonds", v: String(d.sigma), u: "", t: "σ bonds form the molecular skeleton." },
        { k: "Pi Bonds", v: String(d.pi), u: "", t: "π bonds indicate double/triple bonds and unsaturation." },
        { k: "Total Bonds", v: String(d.totalBonds), u: "", t: interpret.totalBonds() },
        { k: "Rotatable Bonds", v: String(d.rotb), u: "", t: interpret.rotb(d.rotb) },
        { k: "Fraction Csp3", v: fmt(d.csp3, 3), u: "", t: interpret.csp3(d.csp3) },
        { k: "Stereocenters", v: String(d.stereocenters), u: "", t: interpret.stereocenters(d.stereocenters) },
      ],
    },
    {
      section: "Electronic & Charge",
      items: [
        { k: "Net Formal Charge", v: String(d.formalCharge), u: "e", t: interpret.formalCharge(d.formalCharge) },
        { k: "Valence Electrons", v: Number.isFinite(d.valenceElectrons) ? String(d.valenceElectrons) : "N/A", u: "", t: interpret.valenceElectrons() },
        { k: "H-bond Donors", v: String(d.hbd), u: "", t: interpret.hbd(d.hbd) },
        { k: "H-bond Acceptors", v: String(d.hba), u: "", t: interpret.hba(d.hba) },
      ],
    },
    {
      section: "Drug-likeness",
      items: [
        { k: "LogP", v: fmt(d.logp), u: "", t: interpret.logp(d.logp) },
        { k: "TPSA", v: fmt(d.tpsa, 1), u: "Å²", t: interpret.tpsa(d.tpsa) },
        { k: "Molar Refractivity", v: fmt(d.mr, 1), u: "", t: interpret.mr() },
        { k: "Labute ASA", v: fmt(d.labuteASA, 1), u: "Å²", t: interpret.labuteASA() },
        { k: "Lipinski Violations", v: `${d.lipinskiViolations} / 4`, u: "", t: interpret.lipinski(d.lipinskiViolations) },
        { k: "Veber Rule", v: d.veberPass ? "PASS" : "FAIL", u: "", t: interpret.veber(d.veberPass) },
      ],
    },
    {
      section: "Solubility & Composition",
      items: [
        { k: "ESOL logS", v: fmt(d.esol), u: "", t: interpret.esol(d.esolLabel) },
        { k: "Solubility Class", v: d.esolLabel, u: "", t: "Delaney's ESOL estimate from LogP, MW, flexibility and aromaticity." },
        { k: "Heteroatom Count", v: String(d.heteroatoms), u: "", t: interpret.heteroatoms(d.heteroatoms) },
      ],
    },
  ];
}
