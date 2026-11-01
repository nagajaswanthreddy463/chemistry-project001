# Cheminformatics Virtual Laboratory

An interactive, browser-based virtual lab for learning cheminformatics: write molecules as SMILES, see them in 2D and 3D, compute molecular descriptors, test your understanding and export a lab report.

## Features

- **3D molecule viewer** – offline Three.js caffeine model on the home page, plus an interactive 2D/3D viewer (stick, ball-and-stick, space-filling, surface) for any SMILES.
- **Descriptors report** – molecular weight, LogP, TPSA, H-bond donors/acceptors, rotatable bonds and Lipinski Rule of Five check.
- **Quiz** – self-assessment questions with instant scoring.
- **PDF report** – download a lab report for the selected molecule.
- Theory pages, dark/light theme and a responsive layout.

## Tech stack

- React 19 + TypeScript
- TanStack Start / TanStack Router, Vite
- Tailwind CSS v4
- Three.js, @react-three/fiber, @react-three/drei (home hero molecule)
- RDKit.js and 3Dmol.js (loaded in the browser for chemistry and the visualization page)
- PubChem public API for 3D conformers
- jsPDF for report export

## Run locally

Requires Node.js 20+.

```sh
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:8080).

## Build

```sh
npm run build
npm run preview   # serve the production build locally
```

## Credits

Developed by Ustelamuri Naga Jaswanth Reddy, B.Tech CSE (AI & ML), Section C, SRM Institute of Science and Technology, Tiruchirappalli
