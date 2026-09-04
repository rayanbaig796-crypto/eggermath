const links = [
  { href: "#/about", label: "About Us" },
  { href: "#/contact", label: "Contact" },
  { href: "#/privacy", label: "Privacy Policy" },
  { href: "#/terms", label: "Terms of Service" },
  { href: "#/takedown", label: "DMCA Takedown" },
];

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-mist/10 bg-den-2">
      <img
        src="/images/desk-night.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-14 text-center">
        <p className="font-display text-lg font-bold tracking-tight">EggerMath Arcade</p>
        <p className="max-w-xl text-sm leading-relaxed text-mute">
          A privacy-focused Game Boy Advance, Game Boy Color, and Game Boy emulator running via
          mGBA WebAssembly directly inside modern web browsers.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-mute transition-colors hover:text-led"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="font-mono text-[11px] tracking-wide text-mute/70 uppercase">
          © 2026 EggerMath. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
