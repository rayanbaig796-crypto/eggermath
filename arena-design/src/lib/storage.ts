import type { ContinueEntry, SaveSlot } from "../types";

const CONTINUE_KEY = "eggermath:continue";
const SAVES_KEY = (slug: string) => `eggermath:saves:${slug}`;
const SLOT_KEY = (slug: string) => `eggermath:slot:${slug}`;

export function readContinue(): ContinueEntry[] {
  try {
    const raw = localStorage.getItem(CONTINUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContinueEntry[];
    return parsed.sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 8);
  } catch {
    return [];
  }
}

export function touchContinue(slug: string, playMs: number) {
  const list = readContinue().filter((e) => e.slug !== slug);
  list.unshift({ slug, lastPlayed: Date.now(), playMs });
  localStorage.setItem(CONTINUE_KEY, JSON.stringify(list.slice(0, 8)));
}

export function clearContinue() {
  localStorage.removeItem(CONTINUE_KEY);
}

export function readSaves(slug: string): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY(slug));
    return raw ? (JSON.parse(raw) as SaveSlot[]) : [];
  } catch {
    return [];
  }
}

export function writeSave(slug: string, slot: SaveSlot) {
  const all = readSaves(slug).filter((s) => s.slot !== slot.slot);
  all.push(slot);
  localStorage.setItem(SAVES_KEY(slug), JSON.stringify(all));
  localStorage.setItem(SLOT_KEY(slug), String(slot.slot));
}

export function readActiveSlot(slug: string) {
  const n = Number(localStorage.getItem(SLOT_KEY(slug)) ?? "0");
  return Number.isFinite(n) ? n : 0;
}

export function writeActiveSlot(slug: string, slot: number) {
  localStorage.setItem(SLOT_KEY(slug), String(slot));
}
