import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader, Reveal } from "@/components/lab/Layout";

export const Route = createFileRoute("/theory")({
  head: () => ({
    meta: [
      { title: "Theory — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "Learn cheminformatics, SMILES notation, molecular descriptors and structure–property relationships." },
      { property: "og:title", content: "Cheminformatics Theory" },
      { property: "og:description", content: "SMILES, descriptors and structure–property relationships explained simply." },
    ],
  }),
  component: Theory,
});

function SmilesDiagram() {
  const parts = [
    { t: "C", d: "carbon" }, { t: "C", d: "carbon" }, { t: "(=O)", d: "branch: C=O" }, { t: "O", d: "–OH" },
  ];
  return (
    <div className="mt-4 rounded-xl bg-background/40 p-4">
      <p className="text-xs text-muted-foreground">Acetic acid → <span className="font-mono text-foreground">CC(=O)O</span></p>
      <div className="mt-3 flex flex-wrap gap-2">
        {parts.map((p, i) => (
          <div key={i} className="rounded-lg px-3 py-2 text-center ring-1 ring-primary/30">
            <div className="font-mono text-lg text-primary">{p.t}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpectrumBar({ label, left, right }: { label: string; left: string; right: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground"><span>{left}</span><span className="text-foreground">{label}</span><span>{right}</span></div>
      <div className="mt-1 h-2 rounded-full" style={{ background: "linear-gradient(90deg, var(--glow), var(--gold))" }} />
    </div>
  );
}

const ITEMS = [
  {
    id: "what", title: "What is cheminformatics?",
    body: <>Cheminformatics combines chemistry, computer science and data science to store, search and analyse chemical information. It powers drug discovery, materials design and virtual screening — letting scientists evaluate millions of molecules on a computer before ever touching a flask.</>,
  },
  {
    id: "smiles", title: "SMILES notation",
    body: <>SMILES (Simplified Molecular Input Line Entry System) writes a molecule as a line of text. Atoms are letters, <b>=</b> and <b>#</b> are double and triple bonds, parentheses mark branches, digits close rings, and lowercase letters mean aromatic atoms (e.g. <span className="font-mono">c1ccccc1</span> is benzene).<SmilesDiagram /></>,
  },
  {
    id: "desc", title: "Molecular descriptors",
    body: <>Descriptors are numbers computed from a structure. <b>Molecular weight</b> measures size, <b>LogP</b> measures fat vs. water preference, <b>TPSA</b> sums the polar surface, and <b>H-bond donors/acceptors</b> count groups that can hydrogen-bond. <b>Rotatable bonds</b> reflect flexibility; <b>σ and π bonds</b> describe the bonding skeleton and unsaturation.
      <div className="mt-4 grid gap-3"><SpectrumBar label="LogP" left="hydrophilic" right="lipophilic" /><SpectrumBar label="TPSA" left="non-polar" right="polar" /></div></>,
  },
  {
    id: "spr", title: "Structure–property relationships",
    body: <>Small changes in structure shift properties predictably. Adding –OH to benzene (phenol) adds a donor and raises TPSA; adding an ester and acid (aspirin) increases weight and polarity. Lipinski's Rule of Five says an oral drug usually has MW ≤ 500, LogP ≤ 5, ≤ 5 donors and ≤ 10 acceptors.</>,
  },
];

function Theory() {
  return (
    <>
      <PageHeader eyebrow="Module 01" title="The theory behind the lab">Four core ideas you'll use in every experiment.</PageHeader>
      <div className="mx-auto max-w-4xl px-4">
        <Reveal>
          <Accordion type="single" collapsible defaultValue="what" className="glass rounded-3xl px-6">
            {ITEMS.map((it, i) => (
              <AccordionItem key={it.id} value={it.id}>
                <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">
                  <span><span className="mr-3 font-mono text-sm text-gold">0{i + 1}</span>{it.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">{it.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </>
  );
}
