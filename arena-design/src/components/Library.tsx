import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { GAMES, GENRES, PLATFORMS } from "../data/games";
import type { ContinueEntry, Game, Genre, Platform } from "../types";
import { cn } from "../utils/cn";
import { GameCard } from "./GameCard";

export function Library({
  onPlay,
  onPreview,
  continueList,
  onClearContinue,
}: {
  onPlay: (game: Game) => void;
  onPreview: (game: Game | undefined) => void;
  continueList: ContinueEntry[];
  onClearContinue: () => void;
}) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<Genre | "All">("All");
  const [platform, setPlatform] = useState<Platform | "All">("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GAMES.filter((g) => {
      if (genre !== "All" && g.genre !== genre) return false;
      if (platform !== "All" && g.platform !== platform) return false;
      if (needle && !g.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, genre, platform]);

  const continues = continueList
    .map((c) => GAMES.find((g) => g.slug === c.slug))
    .filter(Boolean) as Game[];

  return (
    <section id="library" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6">
      {continues.length > 0 && (
        <div className="mb-10 overflow-hidden rounded-2xl border border-lcd/25 bg-linear-to-r from-lcd/10 to-shell/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-bold">Continue playing</p>
              <p className="text-xs text-mute">Pick up where you left the handheld</p>
            </div>
            <button
              onClick={onClearContinue}
              className="rounded-md border border-mist/15 px-2 py-1 text-xs text-mute hover:border-magenta/40 hover:text-magenta"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {continues.map((g) => (
              <button
                key={g.id}
                onClick={() => onPlay(g)}
                className="flex min-w-[220px] items-center gap-3 rounded-xl border border-mist/10 bg-den-2 px-3 py-2 text-left hover:border-led/40"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md font-display text-xs font-black"
                  style={{ background: g.paper, color: g.ink }}
                >
                  {g.platform}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{g.title}</span>
                  <span className="font-mono text-[10px] tracking-wider text-led uppercase">
                    {g.genre}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl font-black tracking-tight">The binder</h2>
            <span className="rounded-full border border-led/30 bg-led/10 px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-led uppercase">
              {filtered.length} carts
            </span>
          </div>
          <p className="mt-1 text-sm text-mute">
            Click to play. Hover to seat a preview in the handheld above.
          </p>
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a title"
            className="w-full rounded-full border border-mist/15 bg-den-2 py-2 pr-9 pl-9 text-sm text-cream placeholder:text-mute focus:border-led/50"
          />
          {q && (
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 text-mute"
              onClick={() => setQ("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(["All", ...GENRES] as const).map((g) => (
          <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>
            {g}
          </Chip>
        ))}
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {(["All", ...PLATFORMS] as const).map((p) => (
          <Chip key={p} active={platform === p} onClick={() => setPlatform(p)} tone="shell">
            {p === "All" ? "All systems" : p}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-mist/10 bg-den-2 px-6 py-16 text-center text-mute">
          No carts match that search. Try another title or clear the filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlay} onPreview={onPreview} />
          ))}
        </div>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone = "led",
}: {
  active: boolean;
  onClick: () => void;
  children: string;
  tone?: "led" | "shell";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors",
        active
          ? tone === "led"
            ? "border-led bg-led text-ink"
            : "border-shell-2 bg-shell text-cream"
          : "border-mist/15 bg-den-2 text-mute hover:text-cream",
      )}
    >
      {children}
    </button>
  );
}
