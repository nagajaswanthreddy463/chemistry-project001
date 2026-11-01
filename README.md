# Cheminformatics Virtual Laboratory

An interactive, multi-page educational web app for learning cheminformatics. Type a SMILES string (or pick one of 10 example molecules), see it in 2D and 3D, read 29 calculated molecular properties explained in plain English, compare molecules, take a quiz and download a PDF report. All chemistry runs in the browser — there is no backend.

## Features

- **3D molecule viewer** – rotating Three.js Paracetamol model on the home page (works offline), plus an interactive 3Dmol.js viewer with stick, ball-and-stick and sphere styles, surface and spin.
- **10 example molecules** – Paracetamol, Ibuprofen, Nicotine, Vanillin, Naphthalene, Glucose, Dopamine, Menthol, Urea and Toluene, each with a live 3D preview.
- **29 molecular properties** – weight, LogP, TPSA, H-bond donors/acceptors, rings, σ/π bonds, stereocentres, Labute ASA, elemental composition, Lipinski and Veber rules, ESOL solubility and more, grouped into sections with charts.
- **Structure–property analysis** – compare 2 or 3 molecules side by side with bar charts.
- **Quiz** – five questions with instant feedback and score.
- **PDF report** – download a full properties report with the SRM logo.
- Dark / light theme, responsive layout.

## Tech stack

- React 19 + TanStack Start / TanStack Router, Vite, TypeScript
- Tailwind CSS v4
- RDKit.js (`@rdkit/rdkit`, WebAssembly) – descriptors and 2D drawings
- 3Dmol.js (`3dmol`) – interactive 3D viewer
- Three.js, @react-three/fiber, @react-three/drei – home-page 3D model
- Recharts – charts · jsPDF – PDF export · lucide-react – icons
- Fonts bundled via @fontsource (Inter, Poppins)

## Run locally

Requires Node.js 20+.

```bash
npm install      # also copies the RDKit WASM files into public/rdkit
npm run dev      # open the URL shown (usually http://localhost:8080)
```

## Build

```bash
npm run build    # production build
npm run preview  # serve the build locally
```

If `public/rdkit/` is ever missing, run `npm run copy-rdkit`.

## External services

Everything is bundled in the project (images, logo, fonts, RDKit, 3Dmol) except one optional service:

- **PubChem PUG REST** (`https://pubchem.ncbi.nlm.nih.gov/rest/pug/...`) – supplies real 3D coordinates for molecules. Results are cached in the browser's localStorage. Without internet, the app shows the 2D structure instead.

No environment variables or API keys are needed.

## Folder structure

```text
public/
  favicon.png, srm-logo.jpeg, robots.txt
  rdkit/                 RDKit_minimal.js + RDKit_minimal.wasm
src/
  routes/                one file per page
    __root.tsx           layout, header, footer, fonts
    index.tsx            Home
    theory.tsx           Theory
    visualization.tsx    Molecular Visualization
    properties.tsx       Molecular Properties Report
    analysis.tsx         Structure–Property Analysis
    assessment.tsx       Quiz
    report.tsx           PDF Report
  components/lab/        Layout, Molecule viewers, Example table, hero 3D model
  components/ui/         accordion
  lib/
    chem.ts              RDKit / 3Dmol / PubChem helpers, descriptors, examples
    lab-store.ts         selected molecule shared across pages
    paracetamol.ts       hard-coded hero model geometry
    quiz.ts              quiz questions and scoring
  styles.css             theme tokens and utilities
  test/                  vitest tests
package.json, vite.config.ts, tsconfig.json
```

## Credits

Developed by Ustelamuri Naga Jaswanth Reddy, B.Tech CSE (AI & ML), Section C, SRM Institute of Science and Technology, Tiruchirappalli
