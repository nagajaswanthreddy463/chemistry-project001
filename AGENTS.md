<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Chemistry (visualization page) runs fully in the browser: RDKit.js and RDKit.js loads from CDN and 3Dmol from the npm package (pinned 2.0.4; 2.4.0 rendered blank) in `src/lib/chem.ts`; example molecules get PubChem 3D SDF by name, cached in localStorage, with a 2D RDKit fallback. Why: no backend required.
- The selected molecule is shared across lab pages via `src/lib/lab-store.ts`. Why: users carry one molecule from visualization to report.
- Home hero molecule is a hard-coded Three.js (R3F) model in `src/lib/paracetamol.ts` with an SVG fallback. Why: must render with no network.
