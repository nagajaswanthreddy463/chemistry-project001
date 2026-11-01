// Hard-coded paracetamol (C8H9NO2, CC(=O)Nc1ccc(O)cc1) geometry for the offline hero model.
export type El = "C" | "N" | "O" | "H";
export const ATOM_STYLE: Record<El, { color: string; r: number }> = {
  C: { color: "#7d8fa8", r: 0.34 },
  N: { color: "#3b6cf0", r: 0.33 },
  O: { color: "#e5484d", r: 0.32 },
  H: { color: "#f4f6fa", r: 0.2 },
};

// [element, x, y, z]
const raw: [El, number, number, number][] = [
  ["C", 0, 1.4, 0], ["C", 1.21, 0.7, 0], ["C", 1.21, -0.7, 0], ["C", 0, -1.4, 0], ["C", -1.21, -0.7, 0], ["C", -1.21, 0.7, 0], // 0-5 benzene ring
  ["N", 0, 2.8, 0], ["C", 1.21, 3.5, 0], ["O", 2.42, 2.8, 0], ["C", 1.21, 4.9, 0], // 6-9 amide N, C=O carbon, O, CH3
  ["O", 0, -2.76, 0], // 10 hydroxyl O
  ["H", -0.9, -3.3, 0], ["H", -0.93, 3.33, 0], // 11 OH, 12 NH
  ["H", 2.15, 1.24, 0], ["H", 2.15, -1.24, 0], ["H", -2.15, -1.24, 0], ["H", -2.15, 1.24, 0], // 13-16 ring H
  ["H", 2.2, 5.3, 0], ["H", 0.7, 5.25, 0.88], ["H", 0.7, 5.25, -0.88], // 17-19 methyl H
];
const cy = raw.reduce((s, a) => s + a[2], 0) / raw.length;
export const PARACETAMOL_ATOMS = raw.map(([el, x, y, z]) => ({ el, x: x - 0.6, y: y - cy, z }));
// [a, b, order]
export const PARACETAMOL_BONDS: [number, number, 1 | 2][] = [
  [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
  [0, 6, 1], [6, 7, 1], [7, 8, 2], [7, 9, 1], [3, 10, 1], [10, 11, 1], [6, 12, 1],
  [1, 13, 1], [2, 14, 1], [4, 15, 1], [5, 16, 1], [9, 17, 1], [9, 18, 1], [9, 19, 1],
];
