import {
  FastForward,
  Maximize2,
  Minimize2,
  Save,
  Volume2,
  VolumeX,
  ArrowLeft,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent,
} from "react";
import type { Game, PadKey, SaveSlot } from "../types";
import {
  readActiveSlot,
  readSaves,
  touchContinue,
  writeActiveSlot,
  writeSave,
} from "../lib/storage";
import { cn } from "../utils/cn";

const W = 240;
const H = 160;
const TILE = 8;
const COLS = W / TILE;
const ROWS = H / TILE;

type Pressed = Partial<Record<PadKey, boolean>>;

export function Player({
  game,
  romName,
  onBack,
}: {
  game: Game;
  romName?: string;
  onBack: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    x: 14,
    y: 10,
    collected: 0,
    playMs: 0,
    paused: false,
    booted: false,
  });
  const pressedRef = useRef<Pressed>({});
  const lastRef = useRef(0);
  const [pressed, setPressed] = useState<Pressed>({});
  const [booted, setBooted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [muted, setMuted] = useState(false);
  const [full, setFull] = useState(false);
  const [slot, setSlot] = useState(() => readActiveSlot(game.slug));
  const [saves, setSaves] = useState(() => readSaves(game.slug));
  const [toast, setToast] = useState<string | null>(null);
  const [playLabel, setPlayLabel] = useState("00:00");
  const wrapRef = useRef<HTMLDivElement>(null);

  const map = useMemo(() => buildMap(game), [game]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1400);
  }, []);

  const beep = useCallback(
    (freq = 440) => {
      if (muted) return;
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      o.type = "square";
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.06);
      o.onended = () => ctx.close();
    },
    [muted],
  );

  const persistContinue = useCallback(() => {
    touchContinue(game.slug, stateRef.current.playMs);
  }, [game.slug]);

  const doSave = useCallback(() => {
    const s = stateRef.current;
    const rec: SaveSlot = {
      slot,
      x: s.x,
      y: s.y,
      collected: s.collected,
      playMs: s.playMs,
      savedAt: Date.now(),
    };
    writeSave(game.slug, rec);
    setSaves(readSaves(game.slug));
    persistContinue();
    flash(`Saved slot ${slot}`);
    beep(660);
  }, [beep, flash, game.slug, persistContinue, slot]);

  const doLoad = useCallback(() => {
    const rec = readSaves(game.slug).find((s) => s.slot === slot);
    if (!rec) {
      flash(`Slot ${slot} empty`);
      return;
    }
    stateRef.current.x = rec.x;
    stateRef.current.y = rec.y;
    stateRef.current.collected = rec.collected;
    stateRef.current.playMs = rec.playMs;
    flash(`Loaded slot ${slot}`);
    beep(330);
  }, [beep, flash, game.slug, slot]);

  const cycleSlot = useCallback(() => {
    const next = (slot + 1) % 10;
    setSlot(next);
    writeActiveSlot(game.slug, next);
    flash(`Slot ${next}`);
  }, [flash, game.slug, slot]);

  const setKey = useCallback((key: PadKey, down: boolean) => {
    pressedRef.current[key] = down;
    setPressed({ ...pressedRef.current });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setBooted(true);
      stateRef.current.booted = true;
    }, 1100);
    return () => clearTimeout(t);
  }, [game.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const mapKeys: Record<string, PadKey> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        k: "a",
        j: "b",
        u: "l",
        i: "r",
        Enter: "start",
        Shift: "select",
      };
      const k = mapKeys[e.key] ?? mapKeys[e.key.toLowerCase()];
      if (k) {
        e.preventDefault();
        if (down && k === "start" && !e.repeat) {
          setPaused((p) => {
            const n = !p;
            stateRef.current.paused = n;
            return n;
          });
        }
        setKey(k, down);
        return;
      }
      if (!down) return;
      if (e.key === "F5") {
        e.preventDefault();
        doSave();
      } else if (e.key === "F9") {
        e.preventDefault();
        doLoad();
      } else if (e.key === "F7") {
        e.preventDefault();
        cycleSlot();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setFast((f) => !f);
      } else if (e.key === "Escape") {
        persistContinue();
        onBack();
      }
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [cycleSlot, doLoad, doSave, onBack, persistContinue, setKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    let raf = 0;
    let lastSec = -1;

    const tick = (t: number) => {
      const dt = Math.min(40, t - (lastRef.current || t));
      lastRef.current = t;
      const s = stateRef.current;
      if (s.booted && !s.paused) {
        const speed = (fast ? 0.014 : 0.007) * dt;
        const p = pressedRef.current;
        let nx = s.x;
        let ny = s.y;
        if (p.left) nx -= speed;
        if (p.right) nx += speed;
        if (p.up) ny -= speed;
        if (p.down) ny += speed;
        if (walkable(map, nx, s.y)) s.x = nx;
        if (walkable(map, s.x, ny)) s.y = ny;
        s.x = clamp(s.x, 1, COLS - 2);
        s.y = clamp(s.y, 1, ROWS - 2);
        s.playMs += dt * (fast ? 2 : 1);
        if (p.a) tryCollect(map, s);
      }
      draw(ctx, map, game, s, fast);
      const sec = Math.floor(s.playMs / 1000);
      if (sec !== lastSec) {
        lastSec = sec;
        setPlayLabel(
          `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`,
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fast, game, map]);

  useEffect(() => {
    const id = window.setInterval(persistContinue, 8000);
    return () => {
      clearInterval(id);
      persistContinue();
    };
  }, [persistContinue]);

  async function toggleFull() {
    if (!document.fullscreenElement) {
      await wrapRef.current?.requestFullscreen();
      setFull(true);
    } else {
      await document.exitFullscreen();
      setFull(false);
    }
  }

  return (
    <div ref={wrapRef} className="min-h-screen bg-den">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              persistContinue();
              onBack();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-mist/15 px-3 py-1.5 text-sm text-mute hover:text-cream"
          >
            <ArrowLeft size={16} />
            Back to binder
          </button>
          <div className="text-center">
            <p className="font-display text-lg font-bold">{game.title}</p>
            <p className="font-mono text-[11px] tracking-wider text-led uppercase">
              {game.platform} · {game.genre} · {game.year}
              {romName ? ` · ${romName}` : ""}
            </p>
          </div>
          <p className="font-mono text-sm text-mute">{playLabel}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[720px]">
          <div className="rounded-[36px] border border-mist/20 bg-linear-to-br from-shell-2 via-shell to-[#2a2668] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.55)] sm:p-6">
            <div className="rounded-[18px] bg-[#141022] p-2 sm:p-3">
              <div className="lcd-glow relative overflow-hidden rounded-lg bg-black">
                <canvas
                  ref={canvasRef}
                  width={W}
                  height={H}
                  className="block h-auto w-full"
                  style={{ imageRendering: "pixelated" }}
                />
                {!booted && (
                  <div className="absolute inset-0 grid place-items-center bg-ink">
                    <div className="text-center">
                      <p className="font-display text-xl font-black text-lcd">EGGERMATH</p>
                      <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-mute uppercase">
                        32bit handheld bios
                      </p>
                    </div>
                  </div>
                )}
                {paused && booted && (
                  <div className="absolute inset-0 grid place-items-center bg-ink/70">
                    <p className="font-display text-2xl font-black text-led">PAUSED</p>
                  </div>
                )}
                <div className="scanlines pointer-events-none absolute inset-0 opacity-30" />
                {toast && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-sm bg-ink/80 px-2 py-1 font-mono text-[10px] text-led">
                    {toast}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-center font-mono text-[10px] tracking-[0.3em] text-mist/50 uppercase">
              {game.title}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Tool onClick={doSave} icon={Save} label="Save F5" />
          <Tool onClick={doLoad} icon={Upload} label="Load F9" />
          <Tool
            onClick={() => setFast((f) => !f)}
            icon={FastForward}
            label="Speed"
            active={fast}
          />
          <Tool
            onClick={() => setMuted((m) => !m)}
            icon={muted ? VolumeX : Volume2}
            label={muted ? "Muted" : "Beep"}
          />
          <Tool
            onClick={toggleFull}
            icon={full ? Minimize2 : Maximize2}
            label="Full"
          />
        </div>

        <div>
          <p className="mb-2 text-center font-mono text-[11px] tracking-wider text-mute uppercase">
            Save slots · F7 to cycle · active {slot}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => {
              const rec = saves.find((s) => s.slot === i);
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSlot(i);
                    writeActiveSlot(game.slug, i);
                  }}
                  className={cn(
                    "h-9 w-9 rounded-md border font-mono text-xs",
                    i === slot
                      ? "border-led bg-led text-ink"
                      : rec
                        ? "border-lcd/30 bg-den-2 text-lcd"
                        : "border-mist/15 bg-den-2 text-mute",
                  )}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>

        <TouchPad pressed={pressed} setKey={setKey} />

        <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-mute">
          {game.blurb} Walk the overworld with the D-pad. Press K (A) near sparkles to pick them up.
          This screen is a live handheld demo of the EggerMath arcade — drop your own legally obtained
          ROM in the slot to seat a local file.
        </p>
      </div>
    </div>
  );
}

function Tool({
  onClick,
  icon: Icon,
  label,
  active,
}: {
  onClick: () => void;
  icon: typeof Save;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
        active ? "border-led bg-led text-ink" : "border-mist/15 bg-den-2 text-mute hover:text-cream",
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function TouchPad({
  pressed,
  setKey,
}: {
  pressed: Pressed;
  setKey: (k: PadKey, down: boolean) => void;
}) {
  const hold = (k: PadKey) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setKey(k, true);
    },
    onPointerUp: () => setKey(k, false),
    onPointerCancel: () => setKey(k, false),
  });
  const lit = (k: PadKey) => pressed[k];

  return (
    <div className="relative mx-auto h-[230px] w-full max-w-[420px] select-none sm:hidden">
      <div className="absolute top-0 right-4 left-4 flex justify-between">
        <PadBtn className="h-9 w-16" active={lit("l")} {...hold("l")}>
          L
        </PadBtn>
        <PadBtn className="h-9 w-16" active={lit("r")} {...hold("r")}>
          R
        </PadBtn>
      </div>
      <div className="absolute bottom-12 left-4 grid h-32 w-32 grid-cols-3 grid-rows-3">
        <span />
        <PadBtn active={lit("up")} {...hold("up")}>
          ▲
        </PadBtn>
        <span />
        <PadBtn active={lit("left")} {...hold("left")}>
          ◀
        </PadBtn>
        <span />
        <PadBtn active={lit("right")} {...hold("right")}>
          ▶
        </PadBtn>
        <span />
        <PadBtn active={lit("down")} {...hold("down")}>
          ▼
        </PadBtn>
      </div>
      <div className="absolute right-6 bottom-16">
        <PadBtn
          className="absolute top-0 right-0 h-14 w-14 rounded-full"
          active={lit("a")}
          {...hold("a")}
        >
          A
        </PadBtn>
        <PadBtn
          className="absolute top-10 right-16 h-14 w-14 rounded-full"
          active={lit("b")}
          {...hold("b")}
        >
          B
        </PadBtn>
      </div>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-4">
        <PadBtn className="h-7 w-16 text-[10px]" active={lit("select")} {...hold("select")}>
          SELECT
        </PadBtn>
        <PadBtn className="h-7 w-16 text-[10px]" active={lit("start")} {...hold("start")}>
          START
        </PadBtn>
      </div>
    </div>
  );
}

function PadBtn({
  children,
  className,
  active,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "grid touch-none place-items-center rounded-md border border-white/15 bg-[#2a2438] font-mono text-xs text-cream",
        active && "border-led bg-led text-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildMap(game: Game) {
  const tiles = new Uint8Array(COLS * ROWS);
  const gems = new Set<number>();
  let h = hashStr(game.slug);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 0x45d9f3b);
    return (h >>> 0) / 0xffffffff;
  };
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x;
      const edge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
      if (edge) tiles[i] = 3;
      else if (rand() > 0.92) tiles[i] = 2;
      else if (rand() > 0.84) tiles[i] = 3;
      else if (rand() > 0.7) tiles[i] = 1;
      else tiles[i] = 0;
    }
  }
  for (let n = 0; n < 8; n++) {
    const x = 2 + Math.floor(rand() * (COLS - 4));
    const y = 2 + Math.floor(rand() * (ROWS - 4));
    const i = y * COLS + x;
    tiles[i] = 0;
    gems.add(i);
  }
  return { tiles, gems, colors: game.world };
}

function walkable(map: ReturnType<typeof buildMap>, x: number, y: number) {
  const tx = Math.round(x);
  const ty = Math.round(y);
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
  const t = map.tiles[ty * COLS + tx];
  return t !== 2 && t !== 3;
}

function tryCollect(
  map: ReturnType<typeof buildMap>,
  s: { x: number; y: number; collected: number },
) {
  const i = Math.round(s.y) * COLS + Math.round(s.x);
  if (map.gems.has(i)) {
    map.gems.delete(i);
    s.collected += 1;
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function draw(
  ctx: CanvasRenderingContext2D,
  map: ReturnType<typeof buildMap>,
  game: Game,
  s: { x: number; y: number; collected: number; booted: boolean; paused: boolean },
  fast: boolean,
) {
  const [c0, c1, c2, c3] = map.colors;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = map.tiles[y * COLS + x];
      ctx.fillStyle = t === 2 ? c2 : t === 3 ? "#0c0a12" : t === 1 ? c1 : c0;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      if (t === 3) {
        ctx.fillStyle = c1;
        ctx.fillRect(x * TILE + 2, y * TILE + 1, 4, 5);
      }
    }
  }
  ctx.fillStyle = c3;
  map.gems.forEach((i) => {
    const x = (i % COLS) * TILE;
    const y = Math.floor(i / COLS) * TILE;
    ctx.fillRect(x + 3, y + 3, 2, 2);
  });
  ctx.fillStyle = "#f3e6c8";
  ctx.fillRect(Math.round(s.x) * TILE + 1, Math.round(s.y) * TILE + 1, 6, 6);
  ctx.fillStyle = game.stripe;
  ctx.fillRect(Math.round(s.x) * TILE + 2, Math.round(s.y) * TILE + 2, 4, 3);

  ctx.fillStyle = "rgba(10,8,16,0.72)";
  ctx.fillRect(0, 0, W, 16);
  ctx.fillRect(0, H - 14, W, 14);
  ctx.fillStyle = "#8fd4c4";
  ctx.font = "8px monospace";
  ctx.fillText(game.title.slice(0, 26).toUpperCase(), 4, 11);
  ctx.fillStyle = "#f5b942";
  ctx.fillText(`★${s.collected}  ${fast ? ">>" : "  "}`, 4, H - 4);
  ctx.fillText("K:A  ESC:EJECT", 130, H - 4);
}
