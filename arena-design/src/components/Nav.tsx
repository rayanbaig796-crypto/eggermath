import { Gamepad2 } from "lucide-react";
import { cn } from "../utils/cn";

const links = [
  { href: "#library", label: "Library" },
  { href: "#how", label: "How to play" },
  { href: "#controls", label: "Controls" },
  { href: "#faq", label: "FAQ" },
];

export function Nav({ onHome }: { onHome: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-mist/10 bg-den/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={onHome}
          className="group flex items-center gap-3 text-left"
          aria-label="EggerMath home"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-lg border border-led/30 bg-linear-to-br from-shell/40 to-magenta/20 text-led shadow-[0_0_18px_rgba(245,185,66,0.25)] transition-transform group-hover:-rotate-6">
            <Gamepad2 size={20} strokeWidth={2.2} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-led" style={{ animation: "led-pulse 2s ease-in-out infinite" }} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[1.15rem] font-extrabold tracking-tight text-cream">
              EggerMath
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-mute uppercase sm:block">
              Arcade · mGBA
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-mute transition-colors hover:bg-den-3 hover:text-cream"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#library"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-led/30 bg-led px-3.5 py-1.5",
            "font-display text-xs font-extrabold tracking-wide text-ink uppercase",
            "shadow-[0_8px_20px_rgba(245,185,66,0.25)] transition-transform hover:-translate-y-0.5",
          )}
        >
          Insert a cart
        </a>
      </div>
    </header>
  );
}
