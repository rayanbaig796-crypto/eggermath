import { Play } from "lucide-react";
import type { Game } from "../types";
import { cn } from "../utils/cn";

export function GameCard({
  game,
  onPlay,
  onPreview,
}: {
  game: Game;
  onPlay: (game: Game) => void;
  onPreview: (game: Game | undefined) => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onPreview(game)}
      onFocus={() => onPreview(game)}
      onClick={() => onPlay(game)}
      className="group relative text-left"
      style={{ animation: "cart-seat 0.5s ease both" }}
    >
      <article
        className={cn(
          "relative flex aspect-[3/4.15] flex-col overflow-hidden rounded-[14px] border border-black/40",
          "bg-[#9aa0a8] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform duration-200",
          "group-hover:-translate-y-1.5 group-hover:rotate-[-1.2deg] group-hover:shadow-[0_18px_32px_rgba(0,0,0,0.45)]",
        )}
      >
        <span className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#6f747c]" />
        <span className="absolute top-3 bottom-3 left-0 w-2.5 bg-[#565960]" />

        <div
          className="relative m-2.5 ml-4 flex flex-1 flex-col rounded-[6px] border border-black/10 p-3 shadow-inner"
          style={{ background: game.paper, color: game.ink }}
        >
          <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-[6px]" style={{ background: game.stripe }} />
          <p className="mt-1 font-mono text-[9px] tracking-[0.2em] uppercase opacity-70">
            {game.platform} · {game.year}
          </p>
          <h3 className="mt-2 font-display text-[15px] leading-tight font-extrabold tracking-tight">
            {game.title}
          </h3>
          <p className="mt-auto font-mono text-[10px] tracking-wider uppercase opacity-80">{game.genre}</p>
          <span
            className="mt-2 inline-flex w-fit items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase"
            style={{ background: game.stripe, color: "#17141F" }}
          >
            Sealed
          </span>
        </div>

        <div className="mx-3 mb-2 flex h-3 items-end justify-between gap-[3px]">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="h-full w-[3px] rounded-t-sm bg-[#4c5056]" />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 grid place-items-end justify-center bg-linear-to-t from-ink/50 to-transparent p-3 opacity-100 transition-all sm:place-items-center sm:bg-ink/0 sm:opacity-0 sm:group-hover:bg-ink/35 sm:group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-led px-3 py-1.5 font-display text-[11px] font-extrabold tracking-wide text-ink uppercase shadow-lg">
            <Play size={12} fill="currentColor" />
            Play now
          </span>
        </div>
      </article>
    </button>
  );
}
