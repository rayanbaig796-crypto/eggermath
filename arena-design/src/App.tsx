import { useCallback, useEffect, useMemo, useState } from "react";
import { CartridgeSlot } from "./components/CartridgeSlot";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { ControlsGuide, FAQ, HowToPlay, Why } from "./components/InfoSections";
import { LegalPage } from "./components/LegalPage";
import { Library } from "./components/Library";
import { Nav } from "./components/Nav";
import { Player } from "./components/Player";
import { GAMES, getGame } from "./data/games";
import { clearContinue, readContinue } from "./lib/storage";
import type { ContinueEntry, Game, Route } from "./types";

function parseRoute(): Route {
  const raw = window.location.hash.replace(/^#/, "");
  const path = raw.startsWith("/") ? raw : "";
  if (path.startsWith("/play/")) {
    const slug = decodeURIComponent(path.slice(6).split("?")[0]);
    return { name: "play", slug };
  }
  if (path === "/about") return { name: "about" };
  if (path === "/contact") return { name: "contact" };
  if (path === "/privacy") return { name: "privacy" };
  if (path === "/terms") return { name: "terms" };
  if (path === "/takedown") return { name: "takedown" };
  return { name: "home" };
}

function go(hash: string) {
  window.location.hash = hash;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const [preview, setPreview] = useState<Game | undefined>(GAMES[0]);
  const [continueList, setContinueList] = useState<ContinueEntry[]>(() => readContinue());
  const [localRom, setLocalRom] = useState<{ fileName: string; game: Game } | null>(null);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const playGame = useCallback((game: Game) => {
    setPreview(game);
    go(`/play/${game.slug}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const home = useCallback(() => {
    go("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setContinueList(readContinue());
  }, []);

  const onFile = useCallback((file: File) => {
    const title = file.name.replace(/\.(gba|gbc|gb|zip)$/i, "");
    const platform: Game["platform"] = file.name.toLowerCase().endsWith(".gb")
      ? "GB"
      : file.name.toLowerCase().endsWith(".gbc")
        ? "GBC"
        : "GBA";
    const game: Game = {
      id: `local-${file.name}`,
      slug: `local-${encodeURIComponent(file.name)}`,
      title,
      genre: "Adventure",
      platform,
      year: new Date().getFullYear(),
      blurb: `Local file ${file.name} (${Math.round(file.size / 1024)} KB) seated in the slot. Walk the overworld demo while the file stays on this device.`,
      paper: "#F3E6C8",
      ink: "#1A1523",
      stripe: "#F5B942",
      world: ["#3F3A8C", "#8FD4C4", "#2A2668", "#F5B942"],
    };
    setLocalRom({ fileName: file.name, game });
    setPreview(game);
    go(`/play/${game.slug}`);
  }, []);

  const playing = useMemo(() => {
    if (route.name !== "play") return null;
    if (localRom && localRom.game.slug === route.slug) return localRom.game;
    return getGame(route.slug) ?? null;
  }, [localRom, route]);

  if (route.name === "play") {
    if (playing) {
      return (
        <Player
          key={playing.slug}
          game={playing}
          romName={localRom?.game.slug === playing.slug ? localRom.fileName : undefined}
          onBack={home}
        />
      );
    }
  } else if (route.name !== "home") {
    return (
      <div className="min-h-screen bg-den text-cream">
        <Nav onHome={home} />
        <LegalPage name={route.name} onBack={home} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-den text-cream">
      <a
        href="#library"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-led focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to library
      </a>
      <Nav onHome={home} />
      <Hero
        preview={preview}
        onBrowse={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })}
      />
      <CartridgeSlot onFile={onFile} />
      <Library
        onPlay={playGame}
        onPreview={setPreview}
        continueList={continueList}
        onClearContinue={() => {
          clearContinue();
          setContinueList([]);
        }}
      />
      <HowToPlay />
      <Why />
      <ControlsGuide />
      <FAQ />
      <Footer />
    </div>
  );
}
