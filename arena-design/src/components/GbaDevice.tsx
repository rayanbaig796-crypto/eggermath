import type { Game } from "../types";
import { cn } from "../utils/cn";

export function GbaDevice({
  game,
  className,
}: {
  game?: Game;
  className?: string;
}) {
  const world = game?.world ?? ["#14532D", "#34D399", "#0F172A", "#FBBF24"];

  return (
    <div className={cn("relative mx-auto w-full max-w-[540px]", className)}>
      <div className="absolute -inset-8 -z-10 rounded-full bg-shell/30 blur-3xl" />
      <div className="relative" style={{ animation: "floaty 7s ease-in-out infinite" }}>
        <div className="mb-[-6px] flex justify-between px-10">
          <Shoulder label="L" />
          <Shoulder label="R" />
        </div>

        <div className="relative overflow-hidden rounded-[42px] border border-mist/20 bg-linear-to-br from-shell-2 via-shell to-[#2a2668] p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)]">
          <img
            src="/images/plastic-shell.jpg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
          />

          <div className="relative grid grid-cols-[56px_1fr_64px] items-center gap-3 sm:grid-cols-[72px_1fr_80px] sm:gap-4">
            <div className="flex flex-col items-center gap-6">
              <span
                className="h-2 w-2 rounded-full bg-led"
                style={{ animation: "led-pulse 2.2s ease-in-out infinite" }}
                aria-hidden
              />
              <DPad />
            </div>

            <div className="relative">
              <div className="rounded-[18px] bg-[#1a1730] p-2 shadow-[inset_0_8px_16px_rgba(0,0,0,0.55)]">
                <div
                  className="lcd-glow relative aspect-[240/160] overflow-hidden rounded-[8px] bg-ink"
                  style={{ animation: "screen-on 0.9s ease-out both" }}
                >
                  <ScreenWorld colors={world} title={game?.title} platform={game?.platform} />
                  <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/30" />
                </div>
              </div>
              <p className="mt-1.5 text-center font-mono text-[9px] tracking-[0.35em] text-mist/50 uppercase">
                EggerMath · 32bit
              </p>
            </div>

            <div className="flex flex-col items-center gap-5">
              <div className="relative h-[72px] w-[64px]">
                <FaceBtn label="B" className="absolute bottom-1 left-0 bg-[#6b5078]" />
                <FaceBtn label="A" className="absolute top-1 right-0 bg-magenta" />
              </div>
              <div className="flex gap-3">
                <Pill>SEL</Pill>
                <Pill>STA</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shoulder({ label }: { label: string }) {
  return (
    <div className="h-3.5 w-16 rounded-t-lg border border-b-0 border-mist/15 bg-linear-to-b from-[#6d68c4] to-shell text-center font-mono text-[9px] leading-[14px] text-mist/70">
      {label}
    </div>
  );
}

function DPad() {
  return (
    <div className="relative h-16 w-16">
      <span className="absolute top-1/2 left-0 h-5 w-16 -translate-y-1/2 rounded-sm bg-[#2a2438] shadow-inner" />
      <span className="absolute top-0 left-1/2 h-16 w-5 -translate-x-1/2 rounded-sm bg-[#2a2438] shadow-inner" />
      <span className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1523]" />
    </div>
  );
}

function FaceBtn({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border border-white/15 font-mono text-[10px] font-bold text-cream/90 shadow-[0_4px_0_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {label}
    </span>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[#2a2438] px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-mist/60">
      {children}
    </span>
  );
}

function ScreenWorld({
  colors,
  title,
  platform,
}: {
  colors: string[];
  title?: string;
  platform?: string;
}) {
  return (
    <div className="absolute inset-0" style={{ background: colors[0] }}>
      {!title ? (
        <img
          src="/images/lcd-world.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
      ) : (
        <>
          <div
            className="absolute inset-x-0 bottom-0 h-2/5"
            style={{ background: colors[1], clipPath: "polygon(0 28%, 100% 0, 100% 100%, 0 100%)" }}
          />
          <div
            className="absolute bottom-[18%] left-[12%] h-[22%] w-[18%] rounded-sm"
            style={{ background: colors[2] }}
          />
          <div
            className="absolute bottom-[22%] left-[16%] h-[10%] w-[10%] rounded-sm"
            style={{ background: colors[3] }}
          />
          <div
            className="absolute top-[18%] right-[20%] h-8 w-8 rounded-full opacity-80"
            style={{ background: colors[3] }}
          />
        </>
      )}
      <div className="absolute right-2 bottom-2 left-2 rounded-sm bg-black/45 px-2 py-1">
        <p className="truncate font-mono text-[10px] tracking-wide text-cream uppercase">
          {title ?? "EggerMath BIOS"}
        </p>
        <p className="font-mono text-[9px] text-lcd">{platform ?? "READY"} · PRESS START</p>
      </div>
    </div>
  );
}
