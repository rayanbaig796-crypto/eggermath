export type Genre =
  | "RPG"
  | "Adventure"
  | "Racing"
  | "Platformer"
  | "Action"
  | "Strategy"
  | "Fighting"
  | "Simulation"
  | "Puzzle";

export type Platform = "GBA" | "GBC" | "GB";

export interface Game {
  id: string;
  slug: string;
  title: string;
  genre: Genre;
  platform: Platform;
  year: number;
  blurb: string;
  paper: string;
  ink: string;
  stripe: string;
  world: [string, string, string, string];
}

export type Route =
  | { name: "home" }
  | { name: "play"; slug: string }
  | { name: "about" }
  | { name: "contact" }
  | { name: "privacy" }
  | { name: "terms" }
  | { name: "takedown" };

export interface SaveSlot {
  slot: number;
  x: number;
  y: number;
  collected: number;
  playMs: number;
  savedAt: number;
}

export interface ContinueEntry {
  slug: string;
  lastPlayed: number;
  playMs: number;
}

export type PadKey = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select" | "l" | "r";
