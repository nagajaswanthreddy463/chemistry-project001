import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/lab/Layout";
import { ErrorNote, Skeleton, Structure2D } from "@/components/lab/Molecule";
import { analyze, EXAMPLES, type Descriptors } from "@/lib/chem";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Structure–Property Analysis — Cheminformatics Virtual Laboratory" },
      { name: "description", content: "Compare two or three molecules side by side with descriptor charts." },
      { property: "og:title", content: "Structure–Property Analysis" },
      { property: "og:description", content: "Side-by-side molecule comparison with charts." },
    ],
  }),
  component: Analysis,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function Analysis() {
  const [list, setList] = useState(["CC(=O)Nc1ccc(O)cc1", "CC(C)Cc1ccc(cc1)C(C)C(=O)O", "c1ccc2ccccc2c1"]);
  const [count, setCount] = useState(3);
  const [results, setResults] = useState<(Descriptors | string | null)[]>([null, null, null]);

  useEffect(() => {
    let alive = true;
    Promise.all(list.slice(0, count).map((s) => analyze(s, 220).catch((e: Error) => e.message))).then((r) => alive && setResults(r));
    return () => { alive = false; };
  }, [list, count]);

  const ok = results.slice(0, count).filter((r): r is Descriptors => !!r && typeof r !== "string");
  const name = (s: string) => EXAMPLES.find((e) => e.smiles === s)?.name ?? s;
  const chart1 = ["MW", "TPSA"].map((k) => Object.fromEntries([["k", k], ...ok.map((d) => [name(d.smiles), +(k === "MW" ? d.mw : d.tpsa).toFixed(1)])]));
  const chart2 = ["LogP", "HBD", "HBA", "RotB", "Rings", "π"].map((k) => Object.fromEntries([["k", k], ...ok.map((d) => {
    const v = { LogP: d.logp, HBD: d.hbd, HBA: d.hba, RotB: d.rotb, Rings: d.rings, "π": d.pi }[k]!;
    return [name(d.smiles), +v.toFixed(2)];
  })]));

  return (
    <>
      <PageHeader eyebrow="Module 04" title="Structure–property analysis">See how changing a structure shifts its properties.</PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <div className="flex gap-2">
          {[2, 3].map((n) => (
            <button key={n} onClick={() => setCount(n)} className={"rounded-full px-4 py-1.5 text-sm ring-1 " + (count === n ? "bg-primary text-primary-foreground ring-primary" : "ring-border")}>Compare {n}</button>
          ))}
        </div>
        <div className={"grid gap-4 " + (count === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
          {list.slice(0, count).map((s, i) => {
            const r = results[i] ?? null;
            return (
              <div key={i} className="glass rounded-3xl p-4" style={{ boxShadow: `inset 0 3px 0 ${COLORS[i]}` }}>
                <select value={EXAMPLES.some((e) => e.smiles === s) ? s : ""} onChange={(e) => e.target.value && setList(list.map((x, j) => j === i ? e.target.value : x))}
                  className="w-full rounded-xl border border-input bg-popover px-3 py-2 text-sm">
                  <option value="">Custom</option>
                  {EXAMPLES.map((e) => <option key={e.name} value={e.smiles}>{e.name}</option>)}
                </select>
                <input defaultValue={s} key={s} onBlur={(e) => setList(list.map((x, j) => j === i ? e.target.value : x))}
                  className="mt-2 w-full rounded-xl border border-input bg-background/50 px-3 py-2 font-mono text-xs" />
                {r === null ? <Skeleton className="mt-3 aspect-square" /> : typeof r === "string" ? <div className="mt-3"><ErrorNote message={r} /></div> : (
                  <>
                    <Structure2D svg={r.svg} className="mt-3 aspect-square" />
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      {[["MW", r.mw.toFixed(1)], ["LogP", r.logp.toFixed(2)], ["TPSA", r.tpsa.toFixed(1)]].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-background/40 p-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
                      ))}
                    </dl>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {ok.length > 1 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {[{ t: "Size & polarity", d: chart1 }, { t: "Lipophilicity, H-bonding & bonds", d: chart2 }].map((c) => (
              <div key={c.t} className="glass rounded-3xl p-5">
                <h2 className="mb-4 font-semibold">{c.t}</h2>
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={c.d}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="k" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} cursor={{ fill: "var(--muted)" }} />
                      <Legend />
                      {ok.map((d, i) => <Bar key={d.smiles + i} dataKey={name(d.smiles)} fill={COLORS[i]} radius={[6, 6, 0, 0]} />)}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
