import { useState } from "react";
import {
  ChevronDown,
  Gamepad2,
  Keyboard,
  Smartphone,
  Timer,
  Upload,
  Zap,
} from "lucide-react";
import { cn } from "../utils/cn";

const steps = [
  {
    n: "01",
    title: "Pick a game",
    body: "Browse the binder of 52 GBA, GBC, and GB titles. Click any cart to seat it instantly.",
    icon: Gamepad2,
  },
  {
    n: "02",
    title: "Wait for loading",
    body: "The handheld boots in the browser from a local session. Usually 5–15 seconds on a typical connection.",
    icon: Timer,
  },
  {
    n: "03",
    title: "Start playing",
    body: "Use the keyboard or the on-screen pad. Save states, fast-forward, and fullscreen are built in.",
    icon: Zap,
  },
];

const reasons = [
  { t: "52 built-in games", d: "Pokemon, Zelda, Mario, Metroid, and a full gray-brick shelf besides." },
  { t: "No download required", d: "Play directly in Chrome, Safari, Firefox, or Edge." },
  { t: "Save states", d: "Ten slots. F5 saves, F9 loads, F7 cycles the active slot." },
  { t: "Fast forward", d: "Hold the speed toggle when the grass is just grass." },
  { t: "Mobile support", d: "Touch controls modeled on the original pad, shoulders, and face buttons." },
  { t: "Works everywhere", d: "Progress lives in this browser. No account, no cloud." },
];

const faqs = [
  {
    q: "Is it legal to play GBA games online?",
    a: "Playing your own legally obtained ROM files is legal in most countries. EggerMath provides the emulator software only — you supply the ROM files.",
  },
  {
    q: "Does it work on iPhone?",
    a: "Yes. The handheld works on iOS Safari with touch controls. No App Store download needed.",
  },
  {
    q: "Can I play Pokemon GBA games?",
    a: "Yes. Pokemon Emerald, FireRed, LeafGreen, Ruby, Sapphire, and more sit in the binder. Click to play.",
  },
  {
    q: "How do I save my game?",
    a: "Press F5 to save, F9 to load. You have 10 save slots — press F7 to switch between them. Saves are stored in your browser.",
  },
];

const keys = [
  ["D-Pad", "Arrow keys"],
  ["A button", "K"],
  ["B button", "J"],
  ["Start", "Enter"],
  ["Select", "Shift"],
  ["L / R", "U / I"],
  ["Save state", "F5"],
  ["Load state", "F9"],
  ["Next slot", "F7"],
  ["Fast forward", "Space"],
];

export function HowToPlay() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.2em] text-led uppercase">How to play</p>
      <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Three clicks to a lit screen</h2>
      <p className="mt-2 max-w-xl text-sm text-mute">Get your favorite GBA games running without leaving the tab.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <article
            key={s.n}
            className="rounded-2xl border border-mist/10 bg-den-2 p-5 transition-transform hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-led/30 font-mono text-sm font-bold text-led">
                {s.n}
              </span>
              <s.icon size={18} className="text-mute" />
            </div>
            <h3 className="font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">{s.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 flex gap-3 rounded-xl border border-shell-2/30 bg-shell/15 px-4 py-3 text-sm text-mute">
        <Upload size={16} className="mt-0.5 shrink-0 text-mist" />
        <span>
          <strong className="text-cream">Tip:</strong> You can also drag & drop your own .gba, .zip, .gb, or
          .gbc files into the slot. Saves stay locally in your browser — no account needed. Works best on
          Chrome and Edge.
        </span>
      </p>
    </section>
  );
}

export function Why() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.2em] text-led uppercase">Why EggerMath?</p>
      <h2 className="mt-1 font-display text-3xl font-black tracking-tight">What is a GBA emulator?</h2>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-mute">
        A GBA emulator lets you play Game Boy Advance games directly in your web browser without downloading
        any software. Our emulator uses mGBA WebAssembly, the same engine used by professional emulation
        projects. It supports GBA, GBC, and GB games with save states, fast forward, and keyboard/touch
        controls.
      </p>
      <ol className="mt-5 max-w-3xl list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mute">
        <li>Click any game from the library, or drag-and-drop your own .gba ROM file</li>
        <li>The game loads instantly in your browser — no installation required</li>
        <li>Use keyboard controls: Arrow keys = D-Pad, K = A button, J = B button, Enter = Start</li>
        <li>Save your progress anytime with F5, load with F9, switch slots with F7</li>
      </ol>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r) => (
          <article key={r.t} className="rounded-2xl border border-mist/10 bg-den-2 p-4">
            <h3 className="font-display font-bold">{r.t}</h3>
            <p className="mt-1 text-sm text-mute">{r.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ControlsGuide() {
  return (
    <section id="controls" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 sm:px-6">
      <div className="rounded-[28px] border border-mist/10 bg-den-2 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-led uppercase">Mapped like the plastic</p>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Controls</h2>
          </div>
          <div className="flex gap-2 text-mute">
            <Keyboard size={18} />
            <Smartphone size={18} />
          </div>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {keys.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border-b border-mist/5 py-2 text-sm text-mute"
            >
              <span>{k}</span>
              <kbd className="rounded-md border border-led/20 bg-den px-2 py-0.5 font-mono text-[12px] text-led">
                {v}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-mute">
          Touch controls activate on phones and tablets. Connect a keyboard or controller for the better
          commute.
        </p>
      </div>
    </section>
  );
}

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-10 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.2em] text-led uppercase">FAQ</p>
      <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Frequently asked</h2>
      <div className="mt-6 divide-y divide-mist/10 border-y border-mist/10">
        {faqs.map((f, i) => {
          const on = open === i;
          return (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                onClick={() => setOpen(on ? -1 : i)}
                aria-expanded={on}
              >
                <span className="font-display text-base font-bold">{f.q}</span>
                <ChevronDown
                  size={18}
                  className={cn("shrink-0 text-mute transition-transform", on && "rotate-180")}
                />
              </button>
              {on && <p className="pb-4 text-sm leading-relaxed text-mute">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
