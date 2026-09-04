import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { cn } from "../utils/cn";

const ACCEPT = [".gba", ".gbc", ".gb", ".zip"];

export function CartridgeSlot({
  onFile,
}: {
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function take(file?: File) {
    if (!file) return;
    const ok = ACCEPT.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!ok) {
      setError("Seat a .gba, .gbc, .gb, or .zip file.");
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative w-full overflow-hidden rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition-all",
          over
            ? "border-led bg-led/10 shadow-[0_0_40px_rgba(245,185,66,0.25)]"
            : "border-mist/15 bg-den-2/70 hover:border-led/40 hover:-translate-y-0.5",
        )}
      >
        <img
          src="/images/cartridge-macro.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] transition-opacity group-hover:opacity-20"
        />
        <div className="relative flex flex-col items-center gap-3">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-led/30 bg-den-3 text-led shadow-[0_8px_24px_rgba(245,185,66,0.2)] transition-transform group-hover:-translate-y-1">
            <FileUp size={28} />
          </span>
          <p className="font-display text-xl font-bold tracking-tight">
            Seat your own cart in the slot
          </p>
          <p className="max-w-md text-sm text-mute">
            Drag any game file to run locally inside your browser with zero install. Saves stay on
            this device — no account.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {ACCEPT.map((t) => (
              <span
                key={t}
                className="rounded-md border border-mist/10 bg-den-3 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-mute uppercase"
              >
                {t}
              </span>
            ))}
          </div>
          {error && <p className="font-mono text-sm text-magenta">{error}</p>}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => take(e.target.files?.[0])}
      />
    </section>
  );
}
