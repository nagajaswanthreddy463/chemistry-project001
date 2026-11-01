import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/lab/Layout";
import { ErrorNote, Skeleton, SmilesPicker, Structure2D, useAnalysis } from "@/components/lab/Molecule";
import { EXAMPLES, metricList, type Descriptors } from "@/lib/chem";
import { setSmiles, useSmiles } from "@/lib/lab-store";
import logo from "@/assets/srm-logo.asset.json";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Final Project Report — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "Generate a downloadable PDF lab report with the molecule image, descriptors and interpretation." },
      { property: "og:title", content: "Final Project Report" },
      { property: "og:description", content: "Download a clean PDF lab report for your molecule." },
    ],
  }),
  component: Report,
});

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
async function toPng(src: string, w: number, h: number) {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/png");
}

async function buildPdf(d: Descriptors, student: string, reg: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  doc.setFillColor(20, 66, 143); doc.rect(0, 0, W, 34, "F");
  doc.setFillColor(201, 162, 39); doc.rect(0, 34, W, 1.5, "F");
  try { doc.addImage(await toPng(logo.url, 400, 200), "PNG", 150, 6, 46, 23); } catch { /* logo optional */ }
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("Cheminformatics Virtual Laboratory", 14, 16);
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.text("Final Project Report", 14, 24);

  doc.setTextColor(20, 30, 60); doc.setFontSize(10);
  const name = EXAMPLES.find((e) => e.smiles === d.smiles)?.name;
  const info = [["Student", student], ["Registration No.", reg], ["Date", new Date().toLocaleDateString()],
    ["Molecule", name ?? "Custom"], ["SMILES", d.smiles], ["Formula", d.formula]];
  info.forEach(([k, v], i) => { doc.setFont("helvetica", "bold"); doc.text(k, 14, 46 + i * 7); doc.setFont("helvetica", "normal"); doc.text(String(v), 50, 46 + i * 7, { maxWidth: 80 }); });

  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(d.svg);
  doc.addImage(await toPng(svgUrl, 600, 600), "PNG", 140, 40, 56, 56);

  let y = 100;
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text("Molecular Descriptors & Interpretation", 14, y); y += 6;
  doc.setFontSize(9.5);
  metricList(d).forEach((m, i) => {
    if (i % 2 === 0) { doc.setFillColor(238, 242, 250); doc.rect(14, y - 4, W - 28, 12, "F"); }
    doc.setFont("helvetica", "bold"); doc.text(m.k, 16, y + 1);
    doc.text(`${m.v} ${m.u === "Å²" ? "A^2" : m.u}`, 62, y + 1);
    doc.setFont("helvetica", "normal"); doc.text(m.t.replace(/[≤]/g, "<=").replace(/[σ]/g, "sigma").replace(/[π]/g, "pi").replace(/[—–]/g, "-"), 92, y + 1, { maxWidth: 102 });
    y += 12;
  });
  y += 4;
  const pass = d.lipinskiViolations <= 1;
  pass ? doc.setFillColor(34, 150, 90) : doc.setFillColor(200, 60, 50);
  doc.roundedRect(14, y, W - 28, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
  doc.text(`Lipinski Rule of Five: ${pass ? "PASS" : "FAIL"} (${d.lipinskiViolations} violation${d.lipinskiViolations === 1 ? "" : "s"})`, 18, y + 7.5);

  doc.setTextColor(110, 120, 140); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("Developed by Ustelamuri Naga Jaswanth Reddy, CSE (AI & ML), Section C, SRM Institute of Science and Technology, Trichy", W / 2, 287, { align: "center" });
  doc.save(`Cheminformatics_Report_${(reg || "student").replace(/\W+/g, "_")}.pdf`);
}

function Report() {
  const smiles = useSmiles();
  const { data, error, loading } = useAnalysis(smiles);
  const [student, setStudent] = useState("");
  const [reg, setReg] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const go = async () => {
    if (!data) return;
    if (!student.trim() || !reg.trim()) { setMsg("Please enter your name and registration number."); return; }
    setMsg(null); setBusy(true);
    try { await buildPdf(data, student.trim(), reg.trim()); }
    catch { setMsg("The PDF couldn't be created. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader eyebrow="Module 06" title="Final project report">Fill in your details and download a polished PDF of your experiment.</PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <SmilesPicker value={smiles} onChange={setSmiles} />
        {error && <ErrorNote message={error} />}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="glass space-y-4 rounded-3xl p-6">
            <h2 className="flex items-center gap-2 font-semibold"><FileText className="size-5 text-gold" /> Student details</h2>
            {[["Student name", student, setStudent, "e.g. Ustelamuri Naga Jaswanth Reddy"], ["Registration number", reg, setReg, "e.g. RA2311026050XXX"]].map(([l, v, set, ph]) => (
              <label key={l as string} className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{l as string}</span>
                <input value={v as string} placeholder={ph as string} onChange={(e) => (set as (s: string) => void)(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
            ))}
            {msg && <p className="text-sm text-destructive">{msg}</p>}
            <button disabled={!data || busy} onClick={go} className="bg-hero-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:opacity-50">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download PDF report
            </button>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="font-semibold">Preview</h2>
            {loading && !data ? <Skeleton className="mt-4 h-72" /> : data && (
              <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
                <Structure2D svg={data.svg} className="aspect-square" />
                <ul className="space-y-1.5 text-sm">
                  <li className="font-mono text-gold">{data.formula}</li>
                  {metricList(data).map((m) => <li key={m.k} className="flex justify-between border-b border-border/50 pb-1"><span className="text-muted-foreground">{m.k}</span><span>{m.v} {m.u}</span></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
