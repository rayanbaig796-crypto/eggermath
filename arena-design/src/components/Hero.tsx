import { ChevronDown, Zap } from "lucide-react";
import type { Game } from "../types";
import { GbaDevice } from "./GbaDevice";

export function Hero({ preview, onBrowse }: { preview?: Game; onBrowse: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <img
        src="/images/hero-handheld.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-linear-to-b from-den/70 via-den/85 to-den" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-led/25 bg-led/10 px-3 py-1 font-mono text-[11px] tracking-[0.16em] text-led uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-led" style={{ animation: "led-pulse 2s ease-in-out infinite" }} />
            52 carts seated · no install
          </p>
          <h1 className="font-display text-[clamp(2.3rem,6vw,4.4rem)] leading-[0.95] font-black tracking-tight text-cream">
            GBA emulator
            <span className="block text-mist">online — play 52 games free.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
            Play Pokemon, Zelda, Mario, Metroid and 48 more classic GBA games free in your browser.
            No download needed. Hover a cart — the handheld lights it up.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onBrowse}
              className="inline-flex items-center gap-2 rounded-full bg-led px-5 py-2.5 font-display text-sm font-extrabold tracking-wide text-ink uppercase shadow-[0_12px_30px_rgba(245,185,66,0.28)] transition-transform hover:-translate-y-0.5"
            >
              Open the binder
              <ChevronDown size={16} />
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-mist/15 bg-den-2/80 px-5 py-2.5 text-sm font-semibold text-cream hover:border-mist/30"
            >
              <Zap size={15} className="text-led" />
              Three steps to play
            </a>
          </div>
          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 border-t border-mist/10 pt-6">
            {[
              ["52", "built-in games"],
              ["0", "downloads"],
              ["10", "save slots"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-black text-led">{n}</dt>
                <dd className="font-mono text-[10px] tracking-wider text-mute uppercase">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <GbaDevice game={preview} />
          {preview && (
            <p className="mt-4 text-center font-mono text-[11px] tracking-[0.18em] text-mute uppercase">
              Seated · {preview.title} · {preview.platform}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
