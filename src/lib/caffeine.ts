// Hard-coded caffeine (C8H10N4O2) geometry for the offline hero model.
export type El = "C" | "N" | "O" | "H";
export const ATOM_STYLE: Record<El, { color: string; r: number }> = {
  C: { color: "#7d8fa8", r: 0.34 },
  N: { color: "#3b6cf0", r: 0.33 },
  O: { color: "#e5484d", r: 0.32 },
  H: { color: "#f4f6fa", r: 0.2 },
};

const heavy: [El, number, number][] = [
  ["C", 0, 1.4], ["N", -1.21, 0.7], ["C", -1.21, -0.7], ["N", 0, -1.4], ["C", 1.21, -0.7], ["C", 1.21, 0.7], // 0-5 six ring
  ["N", 2.5, 1.1], ["C", 3.3, 0], ["N", 2.5, -1.1], // 6-8 five ring
  ["O", 0, 2.65], ["O", -2.3, -1.33], // 9-10
  ["C", -2.45, 1.42], ["C", 0, -2.88], ["C", 3.0, 2.48], // 11-13 methyls
];
const atoms: { el: El; x: number; y: number; z: number }[] = heavy.map(([el, x, y]) => ({ el, x: x - 0.6, y, z: 0 }));
const bonds: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [5, 6], [6, 7], [7, 8], [8, 4], [0, 9], [2, 10], [1, 11], [3, 12], [6, 13]];

function addH(parent: number, dx: number, dy: number, dz: number) {
  const p = atoms[parent]!;
  atoms.push({ el: "H", x: p.x + dx, y: p.y + dy, z: p.z + dz });
  bonds.push([parent, atoms.length - 1]);
}
addH(7, 1.05, 0, 0);
for (const [m, ux, uy] of [[11, -0.7, 0.4], [12, 0, -0.8], [13, 0.4, 0.7]] as const) {
  addH(m, ux * 1.1, uy * 1.1, 0);
  addH(m, ux * 0.3 - uy * 0.3, uy * 0.3 + ux * 0.3, 0.95);
  addH(m, ux * 0.3 + uy * 0.3, uy * 0.3 - ux * 0.3, -0.95);
}

export const CAFFEINE_ATOMS = atoms;
export const CAFFEINE_BONDS = bonds;
