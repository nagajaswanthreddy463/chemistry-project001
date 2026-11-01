import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, Moon, Sun, X, FlaskConical } from "lucide-react";
import logo from "@/assets/srm-logo.asset.json";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/theory", label: "Theory" },
  { to: "/visualization", label: "Visualization" },
  { to: "/properties", label: "Properties" },
  { to: "/analysis", label: "Analysis" },
  { to: "/assessment", label: "Assessment" },
  { to: "/report", label: "Report" },
] as const;

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <span className="inline-flex rounded-lg bg-popover px-2 py-1 ring-1 ring-border">
      <img src={logo.url} alt="SRM Institute of Science and Technology, Tiruchirappalli" className={className + " w-auto"} />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setDark(false);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="h-8" />
          <span className="hidden font-display text-sm font-semibold leading-tight xl:block">
            Cheminformatics<br /><span className="text-gold">Virtual Lab</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "bg-primary/15 !text-foreground ring-1 ring-primary/30" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button aria-label="Toggle colour theme" onClick={() => setDark(!dark)}
          className="ml-auto grid size-9 place-items-center rounded-full ring-1 ring-border transition hover:ring-gold lg:ml-2">
          {dark ? <Sun className="size-4 text-gold" /> : <Moon className="size-4 text-primary" />}
        </button>
        <button aria-label="Open menu" className="grid size-9 place-items-center rounded-full ring-1 ring-border lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-border px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2 text-sm" activeProps={{ className: "bg-primary/15" }}>{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border glass">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:items-center">
        <div className="flex items-center gap-3">
          <FlaskConical className="size-6 text-gold" />
          <span className="font-display font-semibold">Cheminformatics Virtual Laboratory</span>
        </div>
        <p className="text-sm text-muted-foreground md:text-center">
          Developed by <span className="text-foreground font-medium">Ustelamuri Naga Jaswanth Reddy</span>, CSE (AI &amp; ML), Section C,
          SRM Institute of Science and Technology, Trichy
        </p>
        <div className="md:justify-self-end"><Logo className="h-12" /></div>
      </div>
    </footer>
  );
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={"reveal " + className} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 animate-rise">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold md:text-6xl text-gradient">{title}</h1>
      {children && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}
