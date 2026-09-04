import { useState } from "react";
import type { Route } from "../types";

const copy: Record<Exclude<Route["name"], "home" | "play">, { title: string; body: string[] }> = {
  about: {
    title: "About Us",
    body: [
      "EggerMath is a privacy-focused browser arcade for Game Boy Advance, Game Boy Color, and Game Boy software.",
      "The player is powered by mGBA compiled to WebAssembly. Nothing is installed. Nothing is uploaded to a server when you seat your own ROM — the file stays in memory on this device.",
      "This replica restages the original EggerMath arcade: a 52-game binder, a cartridge slot, save states, and a handheld you can actually walk around in.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "Questions about the arcade, accessibility, or a listing in the binder: hello@eggermath.com",
      "For legal notices use the DMCA Takedown page. We read every message; we do not sell addresses.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "EggerMath stores save states, continue-playing, and last-used slot in your browser's localStorage. That data never leaves the device unless you copy it.",
      "We do not require an account. Dropped ROM files are read locally and are not transmitted.",
      "If analytics are present on a hosted copy of this page, they only see page views — never game files.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "EggerMath provides emulator software. You are responsible for the legality of any ROM you supply.",
      "Catalog titles are listed for demonstration of the arcade interface. You should only play files you have the right to use.",
      "The service is offered as-is, without warranty that a particular title will boot on every browser.",
    ],
  },
  takedown: {
    title: "DMCA Takedown",
    body: [
      "If you are a rights holder and believe a listing infringes your copyright, write to dmca@eggermath.com with:",
      "1. Your contact details and a description of the work. 2. The exact URL or slug. 3. A statement made under penalty of perjury that you are authorized to act.",
      "We will review complete notices promptly and remove infringing material where required.",
    ],
  },
};

export function LegalPage({ name, onBack }: { name: Exclude<Route["name"], "home" | "play">; onBack: () => void }) {
  const page = copy[name];
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <button onClick={onBack} className="mb-8 text-sm text-mute hover:text-led">
        ← Back to the arcade
      </button>
      <h1 className="font-display text-4xl font-black tracking-tight">{page.title}</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-mute">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {name === "contact" && <ContactForm />}
    </article>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="mt-8 space-y-3 rounded-2xl border border-mist/10 bg-den-2 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block font-mono text-[11px] tracking-wider text-mute uppercase">Your name</span>
        <input
          required
          name="name"
          className="w-full rounded-lg border border-mist/15 bg-den px-3 py-2 text-cream"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-mono text-[11px] tracking-wider text-mute uppercase">Email</span>
        <input
          required
          type="email"
          name="email"
          className="w-full rounded-lg border border-mist/15 bg-den px-3 py-2 text-cream"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-mono text-[11px] tracking-wider text-mute uppercase">Message</span>
        <textarea
          required
          name="message"
          rows={4}
          className="w-full rounded-lg border border-mist/15 bg-den px-3 py-2 text-cream"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-led px-4 py-2 font-display text-sm font-extrabold tracking-wide text-ink uppercase"
      >
        Send message
      </button>
      {sent && (
        <p className="font-mono text-sm text-lcd">
          Noted. In this local arcade the note stays on-device — nothing is uploaded.
        </p>
      )}
    </form>
  );
}
